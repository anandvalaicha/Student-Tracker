import { useEffect, useState } from 'react';
import { PAGE_KEYS, PAGE_TITLES } from './app/constants/pages';

import Sidebar     from './app/Layout/Sidebar';
import Topbar      from './app/Layout/Topbar';
import Login       from './app/pages/Login';
import Dashboard   from './app/pages/Dashboard';
import Courses     from './app/pages/Courses';
import Assignments from './app/pages/Assignments';
import Grades      from './app/pages/Grades';
import Notes       from './app/pages/Notes';
import Analytics   from './app/pages/Analytics';
import Calendar    from './app/pages/Calendar';
import Profile     from './app/pages/Profile';

import useAuth from './app/store/useAuth';
import { ToastProvider, useToast } from './app/components/Toast';
import * as assignmentsApi from './app/api/assignments';
import * as coursesApi     from './app/api/courses';
import * as notesApi       from './app/api/notes';

function AppInner() {
  const { user, isAuthed, loading: authLoading, login, logout } = useAuth();
  const toast = useToast();

  const [nav, setNav] = useState({ page: PAGE_KEYS.dashboard, state: {} });
  const currentPage = nav.page;

  const [assignments, setAssignments]               = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [courses, setCourses]                       = useState([]);
  const [notes, setNotes]                           = useState([]);

  useEffect(() => {
    if (!isAuthed) return;
    setAssignmentsLoading(true);
    Promise.all([assignmentsApi.getAll(), coursesApi.getAll(), notesApi.getAll()])
      .then(([asgn, crse, nts]) => {
        setAssignments(asgn);
        setCourses(crse);
        setNotes(nts);
      })
      .catch(() => toast({ message: 'Could not load data', type: 'error' }))
      .finally(() => setAssignmentsLoading(false));
  }, [isAuthed]);

  // ── Assignment actions ───────────────────────────────────────────────────
  const addAssignment = async (data) => {
    const created = await assignmentsApi.create(data);
    setAssignments((prev) => [created, ...prev]);
    if (created.course_id) {
      setCourses((prev) =>
        prev.map((c) => c.id === created.course_id
          ? { ...c, assignment_count: (c.assignment_count ?? 0) + 1 } : c)
      );
    }
    toast({ message: 'Assignment added!' });
  };

  const updateAssignment = async (id, data) => {
    const updated = await assignmentsApi.update(id, data);
    setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    toast({ message: 'Assignment updated!' });
  };

  const deleteAssignment = async (id) => {
    const target = assignments.find((a) => a.id === id);
    await assignmentsApi.remove(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (target?.course_id) {
      setCourses((prev) =>
        prev.map((c) => c.id === target.course_id
          ? { ...c, assignment_count: Math.max(0, (c.assignment_count ?? 1) - 1) } : c)
      );
    }
    toast({ message: 'Assignment deleted', type: 'info' });
  };

  // ── Course actions ───────────────────────────────────────────────────────
  const addCourse = async (data) => {
    const created = await coursesApi.create(data);
    setCourses((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ message: 'Course added!' });
  };

  const updateCourse = async (id, data) => {
    const updated = await coursesApi.update(id, data);
    setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    toast({ message: 'Course updated!' });
  };

  const deleteCourse = async (id) => {
    await coursesApi.remove(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setAssignments((prev) =>
      prev.map((a) => a.course_id === id ? { ...a, course_id: null, course_color: null } : a)
    );
    setNotes((prev) =>
      prev.map((n) => n.course_id === id ? { ...n, course_id: null, course_name: null, course_color: null } : n)
    );
    toast({ message: 'Course deleted', type: 'info' });
  };

  // ── Note actions ─────────────────────────────────────────────────────────
  const addNote = async (data) => {
    const created = await notesApi.create(data);
    setNotes((prev) => [created, ...prev]);
    toast({ message: 'Note saved!' });
  };

  const updateNote = async (id, data) => {
    const updated = await notesApi.update(id, data);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    toast({ message: 'Note updated!' });
  };

  const deleteNote = async (id) => {
    await notesApi.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ message: 'Note deleted', type: 'info' });
  };

  const togglePin = async (id) => {
    const updated = await notesApi.togglePin(id);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? updated : n))
        .sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at) - new Date(a.updated_at))
    );
    toast({ message: updated.pinned ? 'Note pinned!' : 'Note unpinned', type: 'info' });
  };

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const go = (page, state = {}) => {
    setNav({ page, state });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Loading StudyFlow…</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800 p-6">
        <Login onGo={go} onLogin={login} />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case PAGE_KEYS.dashboard:
        return <Dashboard onGo={go} assignments={assignments} loading={assignmentsLoading} />;
      case PAGE_KEYS.courses:
        return (
          <Courses
            courses={courses}
            addCourse={addCourse}
            updateCourse={updateCourse}
            deleteCourse={deleteCourse}
          />
        );
      case PAGE_KEYS.assignments:
        return (
          <Assignments
            assignments={assignments}
            courses={courses}
            addAssignment={addAssignment}
            updateAssignment={updateAssignment}
            deleteAssignment={deleteAssignment}
            navState={nav.state}
          />
        );
      case PAGE_KEYS.grades:
        return (
          <Grades
            assignments={assignments}
            courses={courses}
            onGradeUpdated={(updated) =>
              setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
            }
          />
        );
      case PAGE_KEYS.notes:
        return (
          <Notes
            notes={notes}
            courses={courses}
            addNote={addNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
            togglePin={togglePin}
          />
        );
      case PAGE_KEYS.analytics:
        return <Analytics assignments={assignments} courses={courses} />;
      case PAGE_KEYS.calendar:
        return <Calendar assignments={assignments} />;
      case PAGE_KEYS.profile:
        return <Profile user={user} />;
      default:
        return <Dashboard onGo={go} assignments={assignments} loading={assignmentsLoading} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed overlay on mobile, flex item on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
        lg:relative lg:inset-y-auto lg:left-auto lg:z-auto lg:transition-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!sidebarOpen ? 'lg:hidden' : ''}
      `}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setNav({ page, state: {} });
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          title={PAGE_TITLES[currentPage] ?? 'StudyFlow'}
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onLogout={() => { logout(); setNav({ page: PAGE_KEYS.dashboard, state: {} }); }}
        />
        <main className="flex-1 p-4 sm:p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
