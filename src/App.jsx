import { useEffect, useState } from "react";
import { PAGE_KEYS, PAGE_TITLES } from "./app/constants/pages";

import Sidebar from "./app/Layout/Sidebar";
import Topbar from "./app/Layout/Topbar";

import Login from "./app/pages/Login";
import useAuth from "./app/store/useAuth";
import Dashboard from "./app/pages/Dashboard";
import Assignments from "./app/pages/Assignments";
import Calendar from "./app/pages/Calendar";
import Profile from "./app/pages/Profile";

import { loadAssignments, saveAssignments } from "./app/utils/storage";

const getFutureDate = (daysFromToday) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0];
};

const DEFAULT_ASSIGNMENTS = [
  {
    title: "Tetris Game Report",
    course: "Java",
    due: getFutureDate(2),
    status: "In Progress",
    priority: "High",
  },
  {
    title: "SQL + Power BI Dashboard",
    course: "Data Analytics",
    due: getFutureDate(4),
    status: "Not Started",
    priority: "Medium",
  },
  {
    title: "Event Website Final Touches",
    course: "Web Dev",
    due: getFutureDate(6),
    status: "Submitted",
    priority: "Low",
  },
  {
    title: "React Mini Project Write-up",
    course: "Frontend",
    due: getFutureDate(8),
    status: "In Progress",
    priority: "Medium",
  },
];

export default function App() {
  // ✅ FIX 1: useAuth hook must be INSIDE component
  const { user, isAuthed, login, logout } = useAuth();

  const [nav, setNav] = useState({ page: PAGE_KEYS.login, state: {} });
  const currentPage = nav.page;

  const title = PAGE_TITLES[currentPage] || "StudyFlow";

  const [assignments, setAssignments] = useState(() =>
    loadAssignments(DEFAULT_ASSIGNMENTS),
  );

  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  const addAssignment = (newItem) => {
    setAssignments((prev) => [newItem, ...prev]);
  };

  const deleteAssignment = (index) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAssignment = (index, updatedItem) => {
    setAssignments((prev) =>
      prev.map((item, i) => (i === index ? updatedItem : item)),
    );
  };

  const renderPage = () => {
    if (currentPage === PAGE_KEYS.login)
      return (
        <Login
          // ✅ FIX 2: no setCurrentPage, use setNav
          onGo={(page, state = {}) => setNav({ page, state })}
          onLogin={login}
        />
      );

    if (currentPage === PAGE_KEYS.dashboard)
      return (
        <Dashboard
          onGo={(page, state = {}) => setNav({ page, state })}
          assignments={assignments}
        />
      );

    if (currentPage === PAGE_KEYS.assignments)
      return (
        <Assignments
          assignments={assignments}
          addAssignment={addAssignment}
          updateAssignment={updateAssignment}
          deleteAssignment={deleteAssignment}
          navState={nav.state}
        />
      );

    if (currentPage === PAGE_KEYS.calendar)
      return <Calendar assignments={assignments} />;

    if (currentPage === PAGE_KEYS.profile) return <Profile />;

    return (
      <Dashboard
        onGo={(page, state = {}) => setNav({ page, state })}
        assignments={assignments}
      />
    );
  };

  // ✅ OPTIONAL (recommended): protect pages
  // If not logged in, always show login
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Login
          onGo={(page, state = {}) => setNav({ page, state })}
          onLogin={login}
        />
      </div>
    );
  }

  if (currentPage === PAGE_KEYS.login) {
    return <div className="min-h-screen bg-slate-50 p-6">{renderPage()}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setNav({ page, state: {} })}
        />
        <div className="flex-1">
          <Topbar
            title={title}
            user={user}
            // ✅ logout should clear auth too
            onLogout={() => {
              logout();
              setNav({ page: PAGE_KEYS.login, state: {} });
            }}
          />
          <main className="p-6">{renderPage()}</main>
        </div>
      </div>
    </div>
  );
}
