import { useState } from 'react';
import { useToast } from '../components/Toast';

const PALETTE = [
  '#4f46e5', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#7c3aed', '#0f766e',
  '#1d4ed8', '#9333ea',
];

const EMPTY = { name: '', code: '', professor: '', credits: 3, color: '#4f46e5' };

function CourseCard({ course, onEdit, onDelete, deleting }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Color stripe */}
      <div className="h-2 w-full" style={{ backgroundColor: course.color }} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">{course.name}</h3>
            {course.code && (
              <span
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: course.color }}
              >
                {course.code}
              </span>
            )}
          </div>
          <div
            className="h-10 w-10 shrink-0 rounded-xl"
            style={{ backgroundColor: `${course.color}20` }}
          />
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-slate-500">
          {course.professor && (
            <p className="flex items-center gap-2">
              <span className="text-slate-400">◉</span>
              {course.professor}
            </p>
          )}
          <p className="flex items-center gap-2">
            <span className="text-slate-400">✦</span>
            {course.credits} credit{course.credits !== 1 ? 's' : ''}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-slate-400">✎</span>
            {course.assignment_count} assignment{course.assignment_count !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mt-5 flex gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => onEdit(course)}
            className="flex-1 rounded-xl bg-slate-100 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(course)}
            disabled={deleting === course.id}
            className="flex-1 rounded-xl bg-rose-50 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
          >
            {deleting === course.id ? '…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Courses({ courses, addCourse, updateCourse, deleteCourse }) {
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const field = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'credits' ? Number(e.target.value) : e.target.value }));

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({ name: c.name, code: c.code, professor: c.professor, credits: c.credits, color: c.color });
    setEditId(c.id);
    setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ message: 'Course name is required', type: 'error' }); return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await updateCourse(editId, form);
      } else {
        await addCourse(form);
      }
      cancel();
    } catch {
      toast({ message: 'Failed to save course', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (course) => {
    const msg = course.assignment_count > 0
      ? `Delete "${course.name}"? It has ${course.assignment_count} linked assignment${course.assignment_count > 1 ? 's' : ''} — they won't be deleted, just unlinked.`
      : `Delete "${course.name}"?`;
    if (!window.confirm(msg)) return;
    setDeleting(course.id);
    try {
      await deleteCourse(course.id);
    } catch {
      toast({ message: 'Delete failed', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
            <p className="mt-1 text-slate-500">Manage your enrolled subjects.</p>
          </div>
          <button
            onClick={openAdd}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900">{editId ? 'Edit Course' : 'New Course'}</h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course Name *</label>
              <input value={form.name} onChange={field('name')} placeholder="e.g. Data Structures" className={`mt-1 ${inputCls}`} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course Code</label>
              <input value={form.code} onChange={field('code')} placeholder="e.g. COMP3120" className={`mt-1 ${inputCls}`} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Professor</label>
              <input value={form.professor} onChange={field('professor')} placeholder="e.g. Dr. Smith" className={`mt-1 ${inputCls}`} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Credits</label>
              <input type="number" min={1} max={12} value={form.credits} onChange={field('credits')} className={`mt-1 ${inputCls}`} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Color</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {saving ? 'Saving…' : editId ? 'Update Course' : 'Add Course'}
              </button>
              <button onClick={cancel} className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Enrolled',      value: courses.length,                                         color: 'text-indigo-700' },
          { label: 'Total Credits', value: courses.reduce((s, c) => s + (c.credits ?? 0), 0),      color: 'text-slate-700' },
          { label: 'Assignments',   value: courses.reduce((s, c) => s + (c.assignment_count ?? 0), 0), color: 'text-slate-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Course cards grid */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-3 text-lg font-semibold text-slate-700">No courses yet</p>
          <p className="mt-1 text-sm text-slate-400">Add your first course to get started.</p>
          <button
            onClick={openAdd}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            + Add Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onEdit={openEdit}
              onDelete={confirmDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
