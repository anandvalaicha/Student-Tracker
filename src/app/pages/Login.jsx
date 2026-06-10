import { useState } from 'react';
import { PAGE_KEYS } from '../constants/pages';

export default function Login({ onGo, onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const fillDemo = () => {
    setEmail('demo@studyflow.com');
    setPassword('demo1234');
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await onLogin({ email: email.trim(), password });
      onGo(PAGE_KEYS.dashboard);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => e.key === 'Enter' && handleLogin();

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white shadow-lg">
            SF
          </div>
          <h1 className="text-3xl font-bold text-white">StudyFlow</h1>
          <p className="mt-1 text-slate-400">Your student life, organised</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>

          {/* Demo banner */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-indigo-800">Demo account</p>
              <p className="text-xs text-slate-500">demo@studyflow.com / demo1234</p>
            </div>
            <button
              onClick={fillDemo}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Auto-fill
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKey}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKey}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60 transition"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
