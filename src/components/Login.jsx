import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Plane,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const returnTo = location.state?.from || "/";

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid username or password.");
      }

      const token = await response.text();

      localStorage.setItem("token", token);

      // Read the role from the JWT
      const payload = JSON.parse(atob(token.split(".")[1]));

      const role = payload.role;

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left visual panel */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(14,165,233,0.35),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.2),transparent_35%),linear-gradient(135deg,#020617,#0f172a)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex w-fit items-center gap-3 text-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Plane className="h-5 w-5" />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                AIR<span className="text-sky-300">DASH</span>
              </span>
            </button>

            {/* Main message */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sky-200 backdrop-blur-md">
                <Plane className="h-4 w-4" />
                Welcome aboard
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                Your journey
                <br />
                starts with
                <br />
                <span className="text-sky-300">Airdash.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Sign in to manage your flights, passenger details and
                bookings from one place.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 Airdash. Travel made simple.
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <button
              onClick={() => navigate("/")}
              className="mb-12 flex items-center gap-2 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950">
                <Plane className="h-5 w-5 text-white" />
              </div>

              <span className="text-xl font-bold">
                AIR<span className="text-sky-500">DASH</span>
              </span>
            </button>

            {/* Back */}
            <button
              onClick={() => navigate(returnTo === "/" ? "/" : "/flights")}
              className="mb-10 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                Account access
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to continue your booking journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
              >
                Create an account
              </button>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Your account is protected by secure authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;