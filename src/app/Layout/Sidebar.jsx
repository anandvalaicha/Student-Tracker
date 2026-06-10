import { NAV_PAGES, PAGE_TITLES } from '../constants/pages';

const icons = {
  dashboard:   '▦',
  courses:     '◈',
  assignments: '✎',
  grades:      '★',
  notes:       '✒',
  analytics:   '◎',
  calendar:    '⬚',
  profile:     '◉',
};

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="flex h-full min-h-screen w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-5">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-bold text-white shadow">
          SF
        </div>
        <div>
          <p className="font-bold text-white leading-tight">StudyFlow</p>
          <p className="text-[10px] text-slate-400">Student life, organised</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_PAGES.map((key) => {
          const isActive = currentPage === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/50" />
              )}
              <span className="text-base">{icons[key] ?? '•'}</span>
              {PAGE_TITLES[key]}
            </button>
          );
        })}
      </nav>

      {/* Bottom tip */}
      <div className="mt-6 rounded-xl bg-slate-700/40 p-4">
        <p className="text-xs font-semibold text-indigo-400">Tip</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          Use the Pomodoro timer on the Dashboard to stay focused during study sessions.
        </p>
      </div>
    </aside>
  );
}
