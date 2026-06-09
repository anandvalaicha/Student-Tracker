export default function Topbar({ title, user, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {user?.email && (
            <p className="text-xs text-slate-500">Logged in as {user.email}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            🔔
          </button>

          <button
            onClick={onLogout}
            className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
