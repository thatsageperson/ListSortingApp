import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import Google from '@auth/core/providers/google';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, compare } from 'bcryptjs';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

async function ensureAuthTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for auth');
  }

  const dbInfo = await pool.query<{
    database_name: string;
    schema_name: string;
  }>(`SELECT current_database() AS database_name, current_schema() AS schema_name`);
  const currentDb = dbInfo.rows[0];
  console.info(
    `[auth][db] connected to database="${currentDb.database_name}" schema="${currentDb.schema_name}"`
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_verification_token (
      identifier TEXT NOT NULL,
      expires TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      "emailVerified" TIMESTAMPTZ,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_accounts (
      id SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      provider VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      "providerAccountId" VARCHAR(255) NOT NULL,
      access_token TEXT,
      expires_at BIGINT,
      refresh_token TEXT,
      id_token TEXT,
      scope TEXT,
      session_state TEXT,
      token_type TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      expires TIMESTAMPTZ NOT NULL,
      "sessionToken" VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_token ON auth_sessions("sessionToken");
    CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts("userId");
  `);
}

await ensureAuthTables();

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

if (process.env.AUTH_SECRET) {
  const hasGoogleOAuth =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const authUrl = process.env.AUTH_URL;
  let authUrlPath: string | null = null;
  try {
    authUrlPath = authUrl ? new URL(authUrl).pathname : null;
  } catch {
    authUrlPath = 'invalid';
  }

  console.info(
    `[auth][google] provider=${hasGoogleOAuth ? 'enabled' : 'disabled'} authUrlPath=${authUrlPath ?? '(unset)'} callbackPath=/api/auth/callback/google`
  );
  if (authUrlPath && authUrlPath !== '/' && authUrlPath !== '/api/auth') {
    console.warn(
      `[auth][google] AUTH_URL contains a path (${authUrlPath}). Usually AUTH_URL should be the site origin only (example: https://your-app.com).`
    );
  }

  app.use(
    '*',
    initAuthConfig((c) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H2',location:'__create/index.ts:initAuthConfig',message:'auth config created',data:{hasAuthSecret:!!c.env.AUTH_SECRET,basePath:'/api/auth',hasAuthUrl:!!process.env.AUTH_URL,authUrlPath:(() => { try { return process.env.AUTH_URL ? new URL(process.env.AUTH_URL).pathname : null; } catch { return 'invalid-url'; } })(),hasGoogleEnv:!!process.env.GOOGLE_CLIENT_ID&&!!process.env.GOOGLE_CLIENT_SECRET},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return ({
        secret: c.env.AUTH_SECRET,
        basePath: '/api/auth',
        trustHost: true,
        pages: {
          signIn: '/account/signin',
          signOut: '/account/logout',
        },
        skipCSRFCheck,
        session: {
          strategy: 'jwt',
        },
        callbacks: {
          session({ session, token }) {
            if (token.sub) {
              session.user.id = token.sub;
            }
            return session;
          },
        },
        cookies: {
          csrfToken: {
            options: {
              secure: true,
              sameSite: 'none',
            },
          },
          sessionToken: {
            options: {
              secure: true,
              sameSite: 'none',
            },
          },
          callbackUrl: {
            options: {
              secure: true,
              sameSite: 'none',
            },
          },
        },
        providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H4',location:'__create/index.ts:credentials-signin.authorize',message:'signin authorize entry',data:{hasEmail:!!email,hasPassword:!!password,emailType:typeof email,passwordType:typeof password,emailLen:typeof email==='string'?email.length:null},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H4',location:'__create/index.ts:credentials-signin.authorize',message:'signin rejected user not found',data:{emailLen:email.length},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H4',location:'__create/index.ts:credentials-signin.authorize',message:'signin rejected credentials account password missing',data:{hasMatchingCredentialsAccount:!!matchingAccount},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              return null;
            }

            const isValid = await compare(password, accountPassword);
            if (!isValid) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H4',location:'__create/index.ts:credentials-signin.authorize',message:'signin rejected password mismatch',data:{emailLen:email.length},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              return null;
            }

            // return user object with the their profile data
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H4',location:'__create/index.ts:credentials-signin.authorize',message:'signin authorize success',data:{hasUserId:!!user.id},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H3',location:'__create/index.ts:credentials-signup.authorize',message:'signup authorize entry',data:{hasEmail:!!email,hasPassword:!!password,emailType:typeof email,passwordType:typeof password,emailLen:typeof email==='string'?email.length:null,hasName:typeof name==='string'&&name.length>0,hasImage:typeof image==='string'&&image.length>0},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                id: crypto.randomUUID(),
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password, 10),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H3',location:'__create/index.ts:credentials-signup.authorize',message:'signup authorize success created and linked account',data:{hasNewUserId:!!newUser.id},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              return newUser;
            }
            return null;
          },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ? [
              Google({
                id: 'google',
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              }),
            ]
          : []),
        ],
      });
    })
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore - this key is accepted even if types not aware and is
    // required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

app.use('/api/auth/*', async (c, next) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'auth-flow-check',hypothesisId:'H1',location:'__create/index.ts:/api/auth middleware',message:'incoming auth route request',data:{path:c.req.path,method:c.req.method,isAuthAction:isAuthAction(c.req.path),hasAuthSecret:!!process.env.AUTH_SECRET,configBasePath:(() => { try { return c.get('authConfig')?.basePath ?? null; } catch { return 'missing-config'; } })(),authUrlPath:(() => { try { return process.env.AUTH_URL ? new URL(process.env.AUTH_URL).pathname : null; } catch { return 'invalid-url'; } })()},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});
app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
