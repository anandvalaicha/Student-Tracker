import { useState } from 'react';
import { useToast } from '../components/Toast';

const statusStyle = (s) => {
  if (s === 'Not Started') return 'bg-slate-100 text-slate-700';
  if (s === 'In Progress') return 'bg-amber-100 text-amber-800';
  if (s === 'Submitted')   return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-100 text-slate-800';
};
const priorityStyle = (p) => {
  if (p === 'High')   return 'bg-rose-100 text-rose-800';
  if (p === 'Medium') return 'bg-indigo-100 text-indigo-800';
  return 'bg-slate-100 text-slate-600';
};
const progressBar = (s) => {
  if (s === 'Submitted')   return { width: 'w-full', color: 'bg-emerald-600' };
  if (s === 'In Progress') return { width: 'w-2/3',  color: 'bg-amber-500' };
  return                          { width: 'w-1/4',  color: 'bg-slate-400' };
};

const futureDate = (n = 3) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const makeEmpty = () => ({ title: '', course: '', course_id: null, due: futureDate(), status: 'Not Started', priority: 'Medium' });

export default function Assignments({
  assignments, courses = [], addAssignment, updateAssignment, deleteAssignment, navState,
}) {
  const toast = useToast();

  const [showForm, setShowForm]     = useState(() => navState?.openAdd ?? false);
  const [form, setForm]             = useState(makeEmpty);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState(() => {
    if (navState?.statusFilter === 'Submitted') return 'Submitted';
    return 'All';
  });
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [courseFilter, setCourseFilter]     = useState('All');
  // 'dueThisWeek' and 'overdue' are derived filters, not status values
  const [quickFilter, setQuickFilter]       = useState(() => navState?.statusFilter === 'dueThisWeek' ? 'dueThisWeek' : navState?.statusFilter === 'overdue' ? 'overdue' : null);

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickCourse = (e) => {
    const courseId = e.target.value ? Number(e.target.value) : null;
    const course   = courses.find((c) => c.id === courseId);
    setForm((f) => ({ ...f, course_id: courseId, course: course?.name ?? f.course }));
  };

  const openAdd  = () => { setForm(makeEmpty()); setEditId(null); setShowForm(true); };
  const openEdit = (a) => {
    setForm({ title: a.title, course: a.course, course_id: a.course_id ?? null, due: a.due, status: a.status, priority: a.priority });
    setEditId(a.id);
    setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditId(null); setForm(makeEmpty()); };

  const save = async () => {
    if (!form.title.trim() || !form.course.trim()) {
      toast({ message: 'Title and course are required', type: 'error' }); return;
    }
    setSaving(true);
    try {
      editId !== null ? await updateAssignment(editId, form) : await addAssignment(form);
      cancel();
    } catch {
      toast({ message: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    setDeletingId(a.id);
    try {
      await deleteAssignment(a.id);
    } catch {
      toast({ message: 'Delete failed', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);

  const filtered = assignments.filter((a) => {
    const q = search.trim().toLowerCase();
    if (quickFilter === 'dueThisWeek') {
      const d = new Date(a.due);
      if (!(d >= today && d <= in7Days)) return false;
    }
    if (quickFilter === 'overdue') {
      if (!(new Date(a.due) < today && a.status !== 'Submitted')) return false;
    }
    return (
      (!q || a.title.toLowerCase().includes(q) || a.course.toLowerCase().includes(q)) &&
      (statusFilter   === 'All' || a.status   === statusFilter) &&
      (priorityFilter === 'All' || a.priority === priorityFilter) &&
      (courseFilter   === 'All' || String(a.course_id) === courseFilter)
    );
  });

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
            <p className="mt-1 text-slate-500">Track tasks, due dates, and progress.</p>
          </div>
          <button onClick={openAdd} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            + Add Assignment
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-900">{editId ? 'Edit Assignment' : 'New Assignment'}</h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
              <input value={form.title} onChange={field('title')} placeholder="Assignment title" className={`mt-1 ${inputCls}`} />
            </div>

            {/* Course picker: dropdown if courses exist, free text otherwise */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Course * {courses.length === 0 && <span className="normal-case font-normal text-slate-400">(add courses first for dropdown)</span>}
              </label>
              {courses.length > 0 ? (
                <select value={form.course_id ?? ''} onChange={pickCourse} className={`mt-1 ${inputCls}`}>
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
                  ))}
                </select>
              ) : (
                <input value={form.course} onChange={field('course')} placeholder="e.g. Data Analytics" className={`mt-1 ${inputCls}`} />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</label>
              <input type="date" value={form.due} onChange={field('due')} className={`mt-1 ${inputCls}`} />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select value={form.status} onChange={field('status')} className={`mt-1 ${inputCls}`}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Submitted</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</label>
              <select value={form.priority} onChange={field('priority')} className={`mt-1 ${inputCls}`}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancel} className="flex-1 rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-filter banner */}
      {quickFilter && (
        <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${quickFilter === 'overdue' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <span className="text-sm font-semibold">
            {quickFilter === 'overdue' ? '⚠️ Showing overdue assignments' : '📅 Showing assignments due this week'}
          </span>
          <button onClick={() => setQuickFilter(null)} className="text-xs underline opacity-70 hover:opacity-100 transition">
            Clear filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={inputCls} />

          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className={inputCls}>
            <option value="All">Course: All</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
            <option value="All">Status: All</option>
            <option>Not Started</option><option>In Progress</option><option>Submitted</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={inputCls}>
            <option value="All">Priority: All</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          All Assignments
          <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
        </h2>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            {assignments.length === 0
              ? 'No assignments yet. Click "+ Add Assignment" to get started.'
              : 'No assignments match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const bar = progressBar(a.status);
              return (
                <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-indigo-200 transition">
                  {/* Course color stripe */}
                  {a.course_color && (
                    <div className="mb-3 h-0.5 w-full rounded-full" style={{ backgroundColor: a.course_color }} />
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {a.course_color && (
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: a.course_color }} />
                        )}
                        <p className="text-sm text-slate-500">{a.course} · Due {a.due}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(a.status)}`}>{a.status}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyle(a.priority)}`}>{a.priority} priority</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => openEdit(a)} className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition">
                        Edit
                      </button>
                      <button onClick={() => confirmDelete(a)} disabled={deletingId === a.id} className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 disabled:opacity-50 transition">
                        {deletingId === a.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full transition-all ${bar.width} ${bar.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
