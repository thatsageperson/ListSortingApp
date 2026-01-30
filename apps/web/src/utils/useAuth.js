import { useCallback } from 'react';
import { signIn, signOut } from "@auth/create/react";

/**
 * Exposes sign-in/sign-up and sign-out helpers for credentials, Google, Facebook, and Twitter.
 */
function useAuth() {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  /** Signs in with email/password. */
  const signInWithCredentials = useCallback((options) => {
    return signIn("credentials-signin", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl])

  /** Signs up with email/password (credentials-signup). */
  const signUpWithCredentials = useCallback((options) => {
    return signIn("credentials-signup", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl])

  /** Signs in with Google OAuth. */
  const signInWithGoogle = useCallback((options) => {
    return signIn("google", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl]);
  /** Signs in with Facebook OAuth. */
  const signInWithFacebook = useCallback((options) => {
    return signIn("facebook", options);
  }, []);
  /** Signs in with Twitter OAuth. */
  const signInWithTwitter = useCallback((options) => {
    return signIn("twitter", options);
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  }
}

export default useAuth;