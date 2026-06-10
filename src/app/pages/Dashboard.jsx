import { useEffect, useState } from 'react';
import { PAGE_KEYS } from '../constants/pages';

const statusStyle = (status) => {
  if (status === 'In Progress') return 'bg-amber-100 text-amber-700';
  if (status === 'Not Started') return 'bg-slate-100 text-slate-600';
  if (status === 'Submitted')   return 'bg-emerald-100 text-emerald-700';
  return 'bg-slate-100 text-slate-600';
};

function StatCard({ label, value, sub, bg, accent, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 border ${bg} transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${accent} opacity-80`}>{label}</p>
          <p className={`mt-1.5 text-4xl font-bold ${accent}`}>{value}</p>
          <p className={`mt-1 text-xs ${accent} opacity-60`}>{sub}</p>
        </div>
        <span className="text-3xl opacity-30">{icon}</span>
      </div>
    </button>
  );
}

export default function Dashboard({ onGo, assignments = [], loading }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning]     = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(id); setIsRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const today   = new Date();
  const in7Days = new Date(); in7Days.setDate(today.getDate() + 7);

  const total       = assignments.length;
  const submitted   = assignments.filter((a) => a.status === 'Submitted').length;
  const dueThisWeek = assignments.filter((a) => { const d = new Date(a.due); return d >= today && d <= in7Days; }).length;
  const overdue     = assignments.filter((a) => new Date(a.due) < today && a.status !== 'Submitted').length;

  const upcoming = [...assignments]
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  const nextUp = upcoming.find((a) => a.status !== 'Submitted');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-500">Your study overview at a glance.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onGo(PAGE_KEYS.calendar)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              View Calendar
            </button>
            <button
              onClick={() => onGo(PAGE_KEYS.assignments, { openAdd: true })}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              + Add Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Assignments" value={total}       sub="Across all courses"     bg="bg-indigo-50  border-indigo-100"  accent="text-indigo-700"  icon="📋" onClick={() => onGo(PAGE_KEYS.assignments)} />
          <StatCard label="Due This Week"     value={dueThisWeek} sub="Plan your next sessions" bg="bg-amber-50   border-amber-100"   accent="text-amber-700"   icon="📅" onClick={() => onGo(PAGE_KEYS.assignments, { statusFilter: 'dueThisWeek' })} />
          <StatCard label="Overdue"           value={overdue}     sub="Focus on these first"    bg="bg-rose-50    border-rose-100"    accent="text-rose-700"    icon="⚠️" onClick={() => onGo(PAGE_KEYS.assignments, { statusFilter: 'overdue' })} />
          <StatCard label="Submitted"         value={submitted}   sub="Great progress!"         bg="bg-emerald-50 border-emerald-100" accent="text-emerald-700" icon="✅" onClick={() => onGo(PAGE_KEYS.assignments, { statusFilter: 'Submitted' })} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Assignments</h2>
              <p className="text-sm text-slate-500">Sorted by due date</p>
            </div>
            <button
              onClick={() => onGo(PAGE_KEYS.assignments)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              View all
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                No assignments yet — add one to get started.
              </div>
            ) : (
              upcoming.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between hover:border-indigo-200 transition"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">{a.course} · Due {a.due}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(a.status)}`}>
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Focus panel */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Focus Timer</h2>
            <p className="text-sm text-slate-500">25-minute Pomodoro session</p>
          </div>

          {/* Timer */}
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 text-center">
            <p className="text-5xl font-bold tracking-tight text-indigo-700">{fmt(secondsLeft)}</p>
            {secondsLeft === 0 && (
              <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                Time's up! Take a break.
              </span>
            )}
            <div className="mt-4 flex gap-2">
              {!isRunning ? (
                <button
                  onClick={() => { if (secondsLeft === 0) setSecondsLeft(25 * 60); setIsRunning(true); }}
                  className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {secondsLeft === 25 * 60 ? 'Start' : secondsLeft === 0 ? 'Restart' : 'Resume'}
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
                >
                  Pause
                </button>
              )}
              <button
                onClick={() => { setIsRunning(false); setSecondsLeft(25 * 60); }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Next up */}
          {nextUp && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Next up</p>
              <p className="mt-1 font-semibold text-slate-900">{nextUp.title}</p>
              <p className="text-sm text-slate-500">{nextUp.course} · Due {nextUp.due}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
