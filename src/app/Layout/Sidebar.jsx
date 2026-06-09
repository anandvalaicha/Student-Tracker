import { NAV_PAGES, PAGE_TITLES } from "../constants/pages";

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">StudyFlow</h1>
        <p className="text-sm text-slate-500">Your student life, organised</p>
      </div>

      <nav className="space-y-2">
        {NAV_PAGES.map((key) => {
          const isActive = currentPage === key;

          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`relative w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "text-slate-700 hover:bg-indigo-50"
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
              )}

              {PAGE_TITLES[key]}
            </button>
          );
        })}
      </nav>

      <div className="mt-10 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <p className="text-xs font-semibold text-indigo-700">💡 Tip</p>
        <p className="mt-1 text-xs text-slate-600">
          Use the sidebar to move between pages instantly.
        </p>
      </div>
    </aside>
  );
}
