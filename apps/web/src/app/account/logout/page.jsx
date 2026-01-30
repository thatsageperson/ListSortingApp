import useAuth from "@/utils/useAuth";
import { BrainCircuit } from "lucide-react";

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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A] p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1E1E] p-8 shadow-2xl border border-[#EDEDED] dark:border-[#333333]">
        <div className="flex items-center justify-center mb-8">
          <BrainCircuit className="w-12 h-12 text-[#219079]" />
        </div>
        <h1 className="mb-6 text-center text-3xl font-bold text-[#1E1E1E] dark:text-white">
          Sign Out
        </h1>

        <button
          onClick={handleSignOut}
          className="w-full bg-[#219079] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#1a7359] shadow-lg shadow-[#219079]/20"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
