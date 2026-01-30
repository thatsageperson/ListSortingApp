/**
 * Re-exports auth hooks: useAuth, useRequireAuth, useUser.
 */
import { useAuth, useRequireAuth } from './useAuth';
export { useUser } from './useUser';

export { useAuth, useRequireAuth };
export default useAuth;