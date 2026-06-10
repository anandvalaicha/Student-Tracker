import { useState } from 'react';
import { useToast } from '../components/Toast';
import { saveGrade } from '../api/grades';

// ── Grade helpers ─────────────────────────────────────────────────────────────
export function pct(received, total) {
  if (received == null || !total) return null;
  return Math.round((received / total) * 100 * 10) / 10;
}

export function letterGrade(percentage) {
  if (percentage == null) return null;
  if (percentage >= 85) return { letter: 'HD', color: 'text-emerald-700', bg: 'bg-emerald-100', gpa: 7 };
  if (percentage >= 75) return { letter: 'D',  color: 'text-blue-700',    bg: 'bg-blue-100',    gpa: 6 };
  if (percentage >= 65) return { letter: 'C',  color: 'text-indigo-700',  bg: 'bg-indigo-100',  gpa: 5 };
  if (percentage >= 50) return { letter: 'P',  color: 'text-amber-700',   bg: 'bg-amber-100',   gpa: 4 };
  return                       { letter: 'F',  color: 'text-rose-700',    bg: 'bg-rose-100',    gpa: 0 };
}

// Weighted GPA across courses (credits-weighted)
function computeStats(assignments, courses) {
  const graded = assignments.filter((a) => a.marks_received != null);

  // Per-course average
  const courseMap = {};
  graded.forEach((a) => {
    const key = a.course_id ?? `free_${a.course}`;
    if (!courseMap[key]) courseMap[key] = { pcts: [], credits: a.course_credits ?? 3, courseId: a.course_id };
    const p = pct(a.marks_received, a.marks_total);
    if (p != null) courseMap[key].pcts.push(p);
  });

  const courseAverages = Object.entries(courseMap).map(([key, { pcts, credits, courseId }]) => {
    const avg = pcts.reduce((s, v) => s + v, 0) / pcts.length;
    return { key, courseId, avg, credits };
  });

  // WAM: simple average of all graded percentages
  const allPcts = graded.map((a) => pct(a.marks_received, a.marks_total)).filter(Boolean);
  const wam = allPcts.length ? allPcts.reduce((s, v) => s + v, 0) / allPcts.length : null;

  // GPA: credits-weighted average of gpa points per course
  const totalCredits = courseAverages.reduce((s, c) => s + c.credits, 0);
  const gpa = totalCredits
    ? courseAverages.reduce((s, c) => s + (letterGrade(c.avg)?.gpa ?? 0) * c.credits, 0) / totalCredits
    : null;

  const best = allPcts.length ? Math.max(...allPcts) : null;

  return { wam, gpa, graded: graded.length, total: assignments.length, best, courseAverages };
}

// ── Inline grade row ──────────────────────────────────────────────────────────
function GradeRow({ assignment, onSaved }) {
  const toast = useToast();
  const [editing, setEditing]   = useState(false);
  const [received, setReceived] = useState(assignment.marks_received ?? '');
  const [total, setTotal]       = useState(assignment.marks_total ?? 100);
  const [saving, setSaving]     = useState(false);

  const percentage = pct(assignment.marks_received, assignment.marks_total);
  const grade      = letterGrade(percentage);

  const commit = async () => {
    const r = received === '' ? null : Number(received);
    const t = Number(total) || 100;
    if (r !== null && (r < 0 || r > t)) {
      toast({ message: 'Marks received cannot exceed total', type: 'error' }); return;
    }
    setSaving(true);
    try {
      const updated = await saveGrade(assignment.id, r, t);
      onSaved(updated);
      setEditing(false);
      toast({ message: 'Grade saved!' });
    } catch {
      toast({ message: 'Failed to save grade', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          {assignment.course_color && (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: assignment.course_color }} />
          )}
          <span className="text-sm font-medium text-slate-900">{assignment.title}</span>
        </div>
        <p className="ml-4 text-xs text-slate-400">{assignment.course}</p>
      </td>

      <td className="px-2 py-3 text-xs text-slate-500">{assignment.due}</td>

      <td className="px-2 py-3">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              min={0}
              max={total}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
              className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-indigo-400"
              placeholder="0"
            />
            <span className="text-xs text-slate-400">/</span>
            <input
              type="number"
              min={1}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
              className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-indigo-400"
            />
            <button
              onClick={commit}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '…' : '✓'}
            </button>
            <button
              onClick={() => { setReceived(assignment.marks_received ?? ''); setTotal(assignment.marks_total ?? 100); setEditing(false); }}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-700 transition"
          >
            {assignment.marks_received != null
              ? `${assignment.marks_received} / ${assignment.marks_total}`
              : '+ Enter marks'}
          </button>
        )}
      </td>

      <td className="px-2 py-3 text-center">
        {percentage != null ? (
          <span className="text-sm font-bold text-slate-700">{percentage}%</span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>

      <td className="px-2 py-3 text-center">
        {grade ? (
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${grade.bg} ${grade.color}`}>
            {grade.letter}
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Grades({ assignments, courses, onGradeUpdated }) {
  const [courseFilter, setCourseFilter] = useState('all');

  const { wam, gpa, graded, total, best, courseAverages } = computeStats(assignments, courses);

  const visible = courseFilter === 'all'
    ? assignments
    : assignments.filter((a) => String(a.course_id) === courseFilter);

  const courseForId = (id) => courses.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Grades</h1>
        <p className="mt-1 text-slate-500">Track marks, averages, and your GPA.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: 'WAM',
            value: wam != null ? `${wam.toFixed(1)}%` : '—',
            sub: 'Weighted Average Mark',
            bg: 'bg-indigo-50 border-indigo-100', accent: 'text-indigo-700',
          },
          {
            label: 'GPA',
            value: gpa != null ? `${gpa.toFixed(2)} / 7` : '—',
            sub: 'Griffith 7-point scale',
            bg: 'bg-blue-50 border-blue-100', accent: 'text-blue-700',
          },
          {
            label: 'Graded',
            value: `${graded} / ${total}`,
            sub: 'Assignments with marks',
            bg: 'bg-amber-50 border-amber-100', accent: 'text-amber-700',
          },
          {
            label: 'Best',
            value: best != null ? `${best}%` : '—',
            sub: letterGrade(best)?.letter ?? 'No grades yet',
            bg: 'bg-emerald-50 border-emerald-100', accent: 'text-emerald-700',
          },
        ].map(({ label, value, sub, bg, accent }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
            <p className={`text-sm font-medium ${accent} opacity-80`}>{label}</p>
            <p className={`mt-1 text-3xl font-bold ${accent}`}>{value}</p>
            <p className={`mt-1 text-xs ${accent} opacity-60`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Course breakdown */}
      {courseAverages.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Course Averages</h2>
          <div className="space-y-3">
            {courseAverages.map(({ key, courseId, avg }) => {
              const course = courseForId(courseId);
              const grade  = letterGrade(avg);
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-52 shrink-0">
                    {course?.color && (
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                    )}
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {course?.name ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(avg, 100)}%`,
                          backgroundColor: course?.color ?? '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-28 shrink-0 justify-end">
                    <span className="text-sm font-bold text-slate-700">{avg.toFixed(1)}%</span>
                    {grade && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${grade.bg} ${grade.color}`}>
                        {grade.letter}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grade scale reference */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Grade Scale (Griffith)</p>
        <div className="flex flex-wrap gap-2">
          {[
            { letter: 'HD', range: '≥ 85%',  bg: 'bg-emerald-100', color: 'text-emerald-700' },
            { letter: 'D',  range: '75–84%', bg: 'bg-blue-100',    color: 'text-blue-700' },
            { letter: 'C',  range: '65–74%', bg: 'bg-indigo-100',  color: 'text-indigo-700' },
            { letter: 'P',  range: '50–64%', bg: 'bg-amber-100',   color: 'text-amber-700' },
            { letter: 'F',  range: '< 50%',  bg: 'bg-rose-100',    color: 'text-rose-700' },
          ].map(({ letter, range, bg, color }) => (
            <div key={letter} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${bg}`}>
              <span className={`font-bold text-sm ${color}`}>{letter}</span>
              <span className="text-xs text-slate-500">{range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment grade entry table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Assignment Marks</h2>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No assignments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="py-3 pl-4 pr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</th>
                  <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Due</th>
                  <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Marks</th>
                  <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">%</th>
                  <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Grade</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <GradeRow key={a.id} assignment={a} onSaved={onGradeUpdated} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
