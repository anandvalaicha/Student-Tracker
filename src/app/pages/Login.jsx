import { useState } from "react";
import { PAGE_KEYS } from "../constants/pages";

export default function Login({ onGo, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!onLogin) {
      setError("onLogin is missing in App.jsx");
      return;
    }

    const result = onLogin({ email, password });

    if (!result?.ok) {
      setError(result?.message || "Login failed");
      return;
    }

    onGo(PAGE_KEYS.dashboard);
  };

  const fillDemo = () => {
    setEmail("demo@studyflow.com");
    setPassword("demo1234");
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>

        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <span className="font-semibold">Demo credentials:</span> demo@studyflow.com / demo1234
          <button
            onClick={fillDemo}
            className="ml-2 rounded-lg bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Auto-fill
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
              placeholder="********"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Login
          </button>

          <p className="text-center text-xs text-slate-500">
            Don’t have an account?{" "}
            <span
              className="font-semibold text-slate-700"
              onClick={() => alert("Signup is UI-only for now 🙂")}
              style={{ cursor: "pointer" }}
            >
              Sign up (UI)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
