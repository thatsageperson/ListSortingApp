import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { BrainCircuit } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials, signIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signIn("apple", { callbackUrl: "/" });
    } catch (err) {
      setError("Apple sign-in failed. Please try again.");
    }
  };

  const handleGuestMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestMode", "true");
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A] p-6">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1E1E] p-8 shadow-2xl border border-[#EDEDED] dark:border-[#333333]"
      >
        <div className="flex items-center justify-center mb-8">
          <BrainCircuit className="w-12 h-12 text-[#219079]" />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold text-[#1E1E1E] dark:text-white">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-[#70757F]">
          Sign in to your SmartLists account
        </p>

        <div className="space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#EDEDED] dark:border-[#333333] bg-white dark:bg-[#262626] px-4 py-3 text-base font-medium text-[#1E1E1E] dark:text-white transition-all hover:bg-[#F7F7F7] dark:hover:bg-[#1E1E1E]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-black dark:bg-white px-4 py-3 text-base font-medium text-white dark:text-black transition-all hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EDEDED] dark:border-[#333333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-[#1E1E1E] px-4 text-[#70757F]">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#70757F]">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-[#219079] dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#70757F]">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-[#219079] dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#219079] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#1a7359] disabled:opacity-50 shadow-lg shadow-[#219079]/20"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            onClick={handleGuestMode}
            className="w-full bg-transparent text-[#219079] dark:text-[#219079] py-4 rounded-2xl font-medium transition-all hover:bg-[#219079]/5 border-2 border-[#219079]"
          >
            Continue as Guest
          </button>

          <p className="text-center text-sm text-[#70757F]">
            Don't have an account?{" "}
            <a
              href={`/account/signup${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-[#219079] hover:text-[#1a7359] font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
