import { useCallback, useRef, useState } from 'react';
import { useToast } from '../components/Toast';

const EMPTY = { title: '', content: '', course_id: null };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Note card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, onPin, deleting, pinning }) {
  const preview = note.content.slice(0, 180) + (note.content.length > 180 ? '…' : '');
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;

  return (
    <div className="break-inside-avoid mb-4 rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
      {/* Color stripe */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: note.course_color ?? '#e2e8f0' }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 text-sm font-bold text-slate-900 leading-snug">{note.title}</h3>
          <button
            onClick={() => onPin(note)}
            disabled={pinning === note.id}
            title={note.pinned ? 'Unpin' : 'Pin'}
            className={`shrink-0 rounded-lg p-1 text-base transition ${
              note.pinned
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500'
            }`}
          >
            📌
          </button>
        </div>

        {/* Course badge */}
        {note.course_name && (
          <span
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: note.course_color ?? '#64748b' }}
          >
            {note.course_name}
          </span>
        )}

        {/* Content preview */}
        {preview && (
          <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600 leading-relaxed font-mono">
            {preview}
          </p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-[10px] text-slate-400">
            {wordCount} word{wordCount !== 1 ? 's' : ''} · {timeAgo(note.updated_at)}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(note)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(note)}
              disabled={deleting === note.id}
              className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
            >
              {deleting === note.id ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────
function NoteEditor({ note, courses, onSave, onCancel, saving }) {
  const [title,    setTitle]    = useState(note?.title    ?? '');
  const [content,  setContent]  = useState(note?.content  ?? '');
  const [courseId, setCourseId] = useState(note?.course_id ?? '');
  const textareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = () =>
    onSave({
      title:     title.trim(),
      content:   content.trim(),
      course_id: courseId ? Number(courseId) : null,
    });

  const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-900">{note ? 'Edit Note' : 'New Note'}</h3>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className={`mt-1 ${inputCls}`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={`mt-1 ${inputCls}`}>
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Content</label>
            <span className="text-[10px] text-slate-400">{wordCount} words</span>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => { setContent(e.target.value); autoResize(); }}
            onFocus={autoResize}
            placeholder="Write your notes here… supports plain text and code snippets"
            rows={8}
            className={`mt-1 resize-none font-mono text-xs leading-relaxed ${inputCls}`}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {saving ? 'Saving…' : note ? 'Update Note' : 'Save Note'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Notes({ notes, courses, addNote, updateNote, deleteNote, togglePin }) {
  const toast = useToast();

  const [showEditor, setShowEditor] = useState(false);
  const [editNote,   setEditNote]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [pinning,    setPinning]    = useState(null);

  const [search,       setSearch]       = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const openAdd  = () => { setEditNote(null); setShowEditor(true); };
  const openEdit = (n) => { setEditNote(n);   setShowEditor(true); };
  const cancel   = () => { setShowEditor(false); setEditNote(null); };

  const handleSave = async (data) => {
    if (!data.title) { toast({ message: 'Title is required', type: 'error' }); return; }
    setSaving(true);
    try {
      editNote ? await updateNote(editNote.id, data) : await addNote(data);
      cancel();
    } catch {
      toast({ message: 'Failed to save note', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setDeleting(note.id);
    try {
      await deleteNote(note.id);
    } catch {
      toast({ message: 'Delete failed', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const handlePin = async (note) => {
    setPinning(note.id);
    try {
      await togglePin(note.id);
    } catch {
      toast({ message: 'Failed to update pin', type: 'error' });
    } finally {
      setPinning(null);
    }
  };

  // Filter
  const filtered = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    return (
      (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) &&
      (courseFilter === 'all' || String(n.course_id) === courseFilter)
    );
  });

  const pinned   = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  const cardProps = { onEdit: openEdit, onDelete: handleDelete, onPin: handlePin, deleting, pinning };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-teal-50 border border-teal-100 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
            <p className="mt-1 text-slate-500">
              {notes.length} note{notes.length !== 1 ? 's' : ''} · {notes.filter((n) => n.pinned).length} pinned
            </p>
          </div>
          <button
            onClick={openAdd}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Editor */}
      {showEditor && (
        <NoteEditor
          note={editNote}
          courses={courses}
          onSave={handleSave}
          onCancel={cancel}
          saving={saving}
        />
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes by title or content…"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 transition sm:w-52"
        >
          <option value="all">All Courses</option>
          <option value="null">No Course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {notes.length === 0 && !showEditor && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-4xl">✒️</p>
          <p className="mt-3 text-lg font-semibold text-slate-700">No notes yet</p>
          <p className="mt-1 text-sm text-slate-400">Capture lecture notes, key concepts, or code snippets.</p>
          <button
            onClick={openAdd}
            className="mt-4 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            + New Note
          </button>
        </div>
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base">📌</span>
            <h2 className="text-sm font-bold text-slate-700">Pinned</h2>
            <span className="text-xs text-slate-400">({pinned.length})</span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
            {pinned.map((n) => <NoteCard key={n.id} note={n} {...cardProps} />)}
          </div>
        </section>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-700">All Notes</h2>
              <span className="text-xs text-slate-400">({unpinned.length})</span>
            </div>
          )}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
            {unpinned.map((n) => <NoteCard key={n.id} note={n} {...cardProps} />)}
          </div>
        </section>
      )}

      {/* No results */}
      {notes.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          No notes match your search.
        </div>
      )}
    </div>
  );
}
