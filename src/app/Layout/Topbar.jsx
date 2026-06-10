export default function Topbar({ title, user, onLogout, onToggleSidebar, sidebarOpen }) {
  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">

        {/* Left: toggle + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Hide menu' : 'Show menu'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
          >
            {sidebarOpen ? (
              /* X icon */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* hamburger icon */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <h2 className="truncate text-lg font-bold text-slate-800">{title}</h2>
        </div>

        {/* Right: user + logout */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name ?? 'Student'}</p>
              <p className="text-xs text-slate-400 leading-tight">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
