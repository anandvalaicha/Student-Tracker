import { useMemo } from 'react';
import { letterGrade } from './Grades';

function pct(received, total) {
  if (received == null || !total) return null;
  return Math.round((received / total) * 1000) / 10;
}

function computeAll(assignments, courses) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const total       = assignments.length;
  const notStarted  = assignments.filter((a) => a.status === 'Not Started').length;
  const inProgress  = assignments.filter((a) => a.status === 'In Progress').length;
  const submitted   = assignments.filter((a) => a.status === 'Submitted').length;
  const overdue     = assignments.filter((a) => new Date(a.due) < today && a.status !== 'Submitted').length;
  const high        = assignments.filter((a) => a.priority === 'High').length;
  const medium      = assignments.filter((a) => a.priority === 'Medium').length;
  const low         = assignments.filter((a) => a.priority === 'Low').length;
  const completionRate = total ? Math.round((submitted / total) * 100) : 0;

  const graded = assignments.filter((a) => a.marks_received != null);
  const wam    = graded.length
    ? graded.reduce((s, a) => s + (a.marks_received / a.marks_total) * 100, 0) / graded.length
    : null;

  const courseStats = courses
    .map((c) => {
      const all     = assignments.filter((a) => a.course_id === c.id);
      const cGraded = all.filter((a) => a.marks_received != null);
      const avg     = cGraded.length
        ? cGraded.reduce((s, a) => s + (a.marks_received / a.marks_total) * 100, 0) / cGraded.length
        : null;
      return { ...c, count: all.length, gradedCount: cGraded.length, avg };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalCredits = courses.reduce((s, c) => s + (c.credits ?? 0), 0);

  const pending = assignments.filter((a) => a.status !== 'Submitted');
  const buckets = [
    { label: 'Overdue',   days: [-Infinity, 0], color: '#e11d48', count: 0 },
    { label: 'This week', days: [0, 7],          color: '#d97706', count: 0 },
    { label: 'Next week', days: [7, 14],          color: '#ca8a04', count: 0 },
    { label: 'Week 3',    days: [14, 21],         color: '#4f46e5', count: 0 },
    { label: 'Later',     days: [21, Infinity],   color: '#94a3b8', count: 0 },
  ];
  pending.forEach((a) => {
    const diff = Math.floor((new Date(a.due) - today) / 86400000);
    const b = buckets.find(({ days: [lo, hi] }) => diff >= lo && diff < hi);
    if (b) b.count++;
  });

  const insights = [];
  if (overdue > 0)              insights.push({ icon: '⚠️', text: `${overdue} overdue assignment${overdue > 1 ? 's' : ''} need attention`, level: 'warn' });
  if (completionRate >= 75)     insights.push({ icon: '🎯', text: `Strong ${completionRate}% completion rate — keep it up!`, level: 'good' });
  if (wam != null && wam >= 75) insights.push({ icon: '🏆', text: `Excellent WAM of ${wam.toFixed(1)}% across graded work`, level: 'good' });
  if (wam != null && wam < 50)  insights.push({ icon: '📖', text: `WAM is ${wam.toFixed(1)}% — consider extra study sessions`, level: 'warn' });
  const best = [...courseStats].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))[0];
  if (best?.avg != null)        insights.push({ icon: '⭐', text: `Best performing: ${best.name} at ${best.avg.toFixed(1)}%`, level: 'info' });
  if (high > medium + low)      insights.push({ icon: '🔥', text: `${high} high-priority assignments — plan your week carefully`, level: 'warn' });
  if (!insights.length)         insights.push({ icon: '📚', text: 'Add assignments and grades to unlock insights', level: 'info' });

  return { total, notStarted, inProgress, submitted, overdue, high, medium, low,
           completionRate, wam, courseStats, totalCredits, buckets, insights };
}

// ── Charts ────────────────────────────────────────────────────────────────────
function DonutChart({ segments, center, size = 168, sw = 20 }) {
  const r = (size - sw) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + g.value, 0);
  let cumDash = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {total === 0 && <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />}
        {segments.filter((s) => s.value > 0).map((seg, i) => {
          const frac = seg.value / total;
          const dash = frac * circumference;
          const off  = cumDash;
          cumDash   += dash;
          return (
            <circle key={i} cx={cx} cy={cx} r={r}
              fill="none" stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-off} strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold text-slate-900">{center.value}</p>
        <p className="text-[10px] text-slate-400 leading-tight">{center.label}</p>
      </div>
    </div>
  );
}

function HBar({ label, value, max, color, right }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <p className="w-24 sm:w-36 shrink-0 truncate text-xs sm:text-sm text-slate-700">{label}</p>
      <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w}%`, backgroundColor: color }} />
      </div>
      <div className="w-20 shrink-0 text-right">{right}</div>
    </div>
  );
}

function VBars({ buckets }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 100 }}>
      {buckets.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-bold text-slate-500">{b.count || ''}</span>
          <div className="w-full rounded-t-lg transition-all duration-500" style={{
            height: b.count ? `${Math.max((b.count / max) * 68, 8)}px` : '2px',
            backgroundColor: b.count ? b.color : '#e2e8f0',
          }} />
          <span className="text-[9px] text-center text-slate-400 leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analytics({ assignments, courses }) {
  const stats = useMemo(() => computeAll(assignments, courses), [assignments, courses]);
  const { total, notStarted, inProgress, submitted, overdue,
          high, medium, low, completionRate, wam, courseStats,
          totalCredits, buckets, insights } = stats;

  const statusSegments = [
    { label: 'Submitted',   value: submitted,  color: '#059669' },
    { label: 'In Progress', value: inProgress, color: '#d97706' },
    { label: 'Not Started', value: notStarted, color: '#94a3b8' },
  ];

  const prioritySegments = [
    { label: 'High',   value: high,   color: '#e11d48', bg: 'bg-rose-500' },
    { label: 'Medium', value: medium, color: '#4f46e5', bg: 'bg-indigo-500' },
    { label: 'Low',    value: low,    color: '#94a3b8', bg: 'bg-slate-400' },
  ];
  const priorityTotal = high + medium + low;
  const maxCourse = Math.max(...courseStats.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-500">Your study data at a glance — {total} assignment{total !== 1 ? 's' : ''} tracked.</p>
      </div>

      {/* Insights */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {insights.map((ins, i) => (
          <div key={i} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border ${
            ins.level === 'good' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
            ins.level === 'warn' ? 'bg-amber-50   text-amber-800   border-amber-100'   :
                                   'bg-slate-50   text-slate-700   border-slate-200'
          }`}>
            <span>{ins.icon}</span>
            {ins.text}
          </div>
        ))}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Completion',    value: `${completionRate}%`,                          sub: `${submitted} of ${total} done`,        bg: 'bg-emerald-50 border-emerald-100', accent: 'text-emerald-700', icon: '✅' },
          { label: 'WAM',           value: wam != null ? `${wam.toFixed(1)}%` : '—',     sub: letterGrade(wam)?.letter ?? 'No grades', bg: 'bg-indigo-50  border-indigo-100',  accent: 'text-indigo-700',  icon: '📊' },
          { label: 'Overdue',       value: overdue,                                        sub: 'Needs immediate focus',                 bg: 'bg-rose-50    border-rose-100',    accent: 'text-rose-700',    icon: '⚡' },
          { label: 'Total Credits', value: totalCredits,                                   sub: `${courses.length} course${courses.length !== 1 ? 's' : ''}`, bg: 'bg-blue-50 border-blue-100', accent: 'text-blue-700', icon: '🎓' },
        ].map(({ label, value, sub, bg, accent, icon }) => (
          <div key={label} className={`rounded-2xl p-5 border ${bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium ${accent} opacity-80`}>{label}</p>
                <p className={`mt-1.5 text-3xl font-bold ${accent}`}>{value}</p>
                <p className={`mt-1 text-xs ${accent} opacity-60`}>{sub}</p>
              </div>
              <span className="text-2xl opacity-30">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Assignment Status</h2>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <DonutChart segments={statusSegments} center={{ value: total, label: 'total' }} />
            <div className="flex flex-col gap-3">
              {statusSegments.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Priority Breakdown</h2>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {prioritySegments.map((s) => (
              <div key={s.label} className={`${s.bg} transition-all duration-500`}
                style={{ width: priorityTotal ? `${(s.value / priorityTotal) * 100}%` : '33.33%' }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {prioritySegments.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${s.bg}`} />
                  <span className="text-sm text-slate-700">{s.label} Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${s.bg}`}
                      style={{ width: priorityTotal ? `${(s.value / priorityTotal) * 100}%` : '0%' }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold text-slate-700">{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      {courseStats.some((c) => c.avg != null) && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Grade Distribution by Course</h2>
          <div className="space-y-4">
            {courseStats.filter((c) => c.avg != null).map((c) => {
              const grade = letterGrade(c.avg);
              return (
                <HBar key={c.id}
                  label={<div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} /><span className="truncate">{c.name}</span></div>}
                  value={c.avg} max={100} color={c.color}
                  right={
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-bold text-slate-700">{c.avg.toFixed(1)}%</span>
                      {grade && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${grade.bg} ${grade.color}`}>{grade.letter}</span>}
                    </div>
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Course workload */}
      {courseStats.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Workload by Course</h2>
          <div className="space-y-4">
            {courseStats.map((c) => (
              <HBar key={c.id}
                label={<div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} /><span className="truncate">{c.name}</span></div>}
                value={c.count} max={maxCourse} color={c.color}
                right={<span className="text-sm font-bold text-slate-700">{c.count} task{c.count !== 1 ? 's' : ''}</span>}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly pipeline */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Upcoming Pipeline</h2>
          <p className="text-xs text-slate-400">Pending assignments by week</p>
        </div>
        <VBars buckets={buckets} />
      </div>

      {total === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-4xl">📈</p>
          <p className="mt-3 text-lg font-semibold text-slate-700">No data yet</p>
          <p className="mt-1 text-sm text-slate-400">Add courses, assignments, and grades to see your analytics.</p>
        </div>
      )}
    </div>
  );
}
