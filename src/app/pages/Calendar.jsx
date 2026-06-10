import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dotColor = (status) => {
  if (status === 'Not Started') return 'bg-slate-500';
  if (status === 'In Progress') return 'bg-amber-500';
  if (status === 'Submitted')   return 'bg-emerald-600';
  return 'bg-slate-400';
};

const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function Calendar({ assignments }) {
  const [current, setCurrent] = useState(new Date());

  const year  = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long' });

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = toKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="mt-1 text-slate-500">Assignments shown on due dates.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              ‹
            </button>
            <span className="min-w-[140px] text-center font-semibold text-slate-800">
              {monthName} {year}
            </span>
            <button
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Today button */}
      <div className="flex justify-end">
        <button
          onClick={() => setCurrent(new Date())}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          Today
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
            const key      = toKey(year, month, date);
            const dueToday = assignments.filter((a) => a.due === key);
            const isToday  = key === todayKey;

            return (
              <div
                key={date}
                className={`min-h-[52px] sm:min-h-[72px] rounded-xl p-1 sm:p-2 transition hover:bg-slate-50 ${
                  isToday
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {date}
                  </span>
                  <div className="flex gap-0.5">
                    {dueToday.slice(0, 3).map((a, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-2 rounded-full ${dotColor(a.status)}`}
                        title={a.title}
                      />
                    ))}
                  </div>
                </div>

                {dueToday.length > 0 && (
                  <p className="mt-0.5 hidden sm:block line-clamp-2 text-[10px] font-medium leading-tight text-slate-600">
                    {dueToday[0].title}
                    {dueToday.length > 1 && ` +${dueToday.length - 1}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legend</p>
        <div className="mt-3 flex flex-wrap gap-5">
          {[
            { label: 'Not Started', color: 'bg-slate-500' },
            { label: 'In Progress', color: 'bg-amber-500' },
            { label: 'Submitted',   color: 'bg-emerald-600' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-5 w-5 rounded-md border border-indigo-200 bg-indigo-50" />
            Today
          </div>
        </div>
      </div>
    </div>
  );
}
