import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Get current directory (only used in dev mode)
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Statically import all routes for production builds
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

/** Recursively finds all route.js files under the given directory (dev mode only). */
async function findRouteFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        // Handle root route.js specially
        if (filePath === join(__dirname, 'route.js')) {
          routes.unshift(filePath); // Add to beginning of array
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

/** Converts a route file path to Hono path segments (including [id] and [...slug]). */
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Register routes synchronously in production, async in dev
function registerRoutesSync() {
  // Production: use statically imported modules (synchronous)
  const routeFiles = Object.keys(routeModules).sort((a, b) => b.length - a.length);
  const routeMap = routeModules;

  // Clear existing routes
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      const route = routeMap[routeFile];
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile.replace('../src/app/api', __dirname));
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

// Development async registration
async function registerRoutesAsync() {
  try {
    const routeFiles = (await findRouteFiles(__dirname))
      .slice()
      .sort((a, b) => b.length - a.length);

    // Clear existing routes
    api.routes = [];

    for (const routeFile of routeFiles) {
      try {
        const route = await import(/* @vite-ignore */ `${routeFile}?update=${Date.now()}`);
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        
        for (const method of methods) {
          try {
            if (route[method]) {
              const parts = getHonoPath(routeFile);
              const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
              const handler: Handler = async (c) => {
                const params = c.req.param();
                const updatedRoute = await import(
                  /* @vite-ignore */ `${routeFile}?update=${Date.now()}`
                );
                return await updatedRoute[method](c.req.raw, { params });
              };
              const methodLowercase = method.toLowerCase();
              switch (methodLowercase) {
                case 'get':
                  api.get(honoPath, handler);
                  break;
                case 'post':
                  api.post(honoPath, handler);
                  break;
                case 'put':
                  api.put(honoPath, handler);
                  break;
                case 'delete':
                  api.delete(honoPath, handler);
                  break;
                case 'patch':
                  api.patch(honoPath, handler);
                  break;
                default:
                  console.warn(`Unsupported method: ${method}`);
                  break;
              }
            }
          } catch (error) {
            console.error(`Error registering route ${routeFile} for method ${method}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error importing route file ${routeFile}:`, error);
      }
    }
  } catch (error) {
    console.error('Error finding route files:', error);
  }
}

// Initial route registration
if (import.meta.env.DEV) {
  await registerRoutesAsync();
} else {
  registerRoutesSync();
}

// Hot reload routes in development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept((newSelf) => {
    registerRoutesAsync().catch((err) => {
      console.error('Error reloading routes:', err);
    });
  });
}

export { api, API_BASENAME };
