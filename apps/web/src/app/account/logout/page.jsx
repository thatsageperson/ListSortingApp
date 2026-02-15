import useAuth from "@/utils/useAuth";
import { Logo } from "@/components/Logo";

/**
 * Logout page: confirms and performs sign-out, then redirects to home.
 */
export default function LogoutPage() {
  const { signOut } = useAuth();
  /** Signs out and redirects to the home page. */
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream dark:bg-slate-bg p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-surface p-8 shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center mb-8">
          <Logo size="medium" />
        </div>
        <h1 className="mb-6 text-center text-3xl font-bold text-charcoal dark:text-white">
          Sign Out
        </h1>

        <button
          onClick={handleSignOut}
          className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold transition-all hover:bg-teal-800 shadow-lg shadow-teal-700/20"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
