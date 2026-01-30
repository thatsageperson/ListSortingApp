import { neon } from '@neondatabase/serverless';

/** Throws when DATABASE_URL is missing; used as a placeholder when no DB is configured. */
const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};
/** Placeholder transaction that throws when DATABASE_URL is missing. */
NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};
/** Neon serverless SQL client when DATABASE_URL is set; otherwise the nullish placeholder. */
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : NullishQueryFunction;

export default sql;