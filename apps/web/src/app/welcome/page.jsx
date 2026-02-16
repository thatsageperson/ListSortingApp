import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import useUser from "@/utils/useUser";

/**
 * First-touch entry page for unauthenticated visitors.
 * Lets users explicitly choose account sign-in or guest mode.
 */
export default function WelcomePage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loading && user) {
      window.location.href = "/";
    }
  }, [loading, user]);

  const continueAsGuest = () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("guestMode", "true");
    localStorage.removeItem("guestMode");
    window.location.href = "/";
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream dark:bg-slate-bg p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-surface p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center mb-8">
          <Logo size="medium" />
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold text-charcoal dark:text-white">
          Welcome to jot.
        </h1>
        <p className="mb-8 text-center text-gray-500">
          Choose how you want to continue.
        </p>

        <div className="space-y-3">
          <a
            href="/account/signin"
            className="w-full flex items-center justify-center bg-teal-700 text-white py-4 rounded-2xl font-bold transition-all hover:bg-teal-800 shadow-lg shadow-teal-700/20"
          >
            Sign In
          </a>
          <a
            href="/account/signup"
            className="w-full flex items-center justify-center bg-white dark:bg-slate-800 text-charcoal dark:text-white py-4 rounded-2xl font-bold border-2 border-gray-200 dark:border-slate-700 transition-all hover:bg-cream dark:hover:bg-slate-700"
          >
            Create Account
          </a>
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full bg-transparent text-teal-700 dark:text-teal-400 py-4 rounded-2xl font-medium transition-all hover:bg-teal-700/5 border-2 border-teal-700"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
