import { useState } from "react";

export default function Assignments({
  assignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  navState,
}) {
  const getFutureDate = (daysFromToday) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split("T")[0];
  };

  const [showAdd, setShowAdd] = useState(() => navState?.openAdd ?? false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDue, setNewDue] = useState(getFutureDate(3));
  const [newStatus, setNewStatus] = useState("Not Started");
  const [newPriority, setNewPriority] = useState("Medium");
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const handleAddAssignment = () => {
    if (!newTitle.trim() || !newCourse.trim()) return;

    const newItem = {
      title: newTitle.trim(),
      course: newCourse.trim(),
      due: newDue,
      status: newStatus,
      priority: newPriority,
    };

    if (editIndex !== null) {
      updateAssignment(editIndex, newItem);
      setEditIndex(null);
    } else {
      addAssignment(newItem);
    }

    setNewTitle("");
    setNewCourse("");
    setNewDue(getFutureDate(3));
    setNewStatus("Not Started");
    setNewPriority("Medium");
    setShowAdd(false);
  };

  const statusStyle = (status) => {
    if (status === "Not Started") return "bg-blue-100 text-blue-800";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-800";
    if (status === "Submitted") return "bg-green-100 text-green-800";
    return "bg-slate-100 text-slate-800";
  };

  const priorityStyle = (priority) => {
    if (priority === "High") return "bg-rose-100 text-rose-800";
    if (priority === "Medium") return "bg-purple-100 text-purple-800";
    if (priority === "Low") return "bg-slate-100 text-slate-800";
    return "bg-slate-100 text-slate-800";
  };
  const filteredAssignments = assignments.filter((a) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "All" || a.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || a.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="mt-1 text-white/90">
              {" "}
              Track tasks, due dates, and progress.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            + Add Assignment
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="text-sm font-bold text-slate-900">Add Assignment</h3>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
            />

            <input
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Course"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
            />

            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
            />

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Submitted</option>
            </select>

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleAddAssignment}
                className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Title and Course are required.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
          >
            <option value="All">Status: All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-300"
          >
            <option value="All">Priority: All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Sort: Due date
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            View: List
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Mode: UI only
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900"> All Assignments</h2>

          <button className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Export (UI)
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {filteredAssignments.map((a, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {a.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {a.course} • Due {a.due}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                        a.status,
                      )}`}
                    >
                      {a.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle(
                        a.priority,
                      )}`}
                    >
                      Priority: {a.priority}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditIndex(idx);
                      setNewTitle(a.title);
                      setNewCourse(a.course);
                      setNewDue(a.due);
                      setNewStatus(a.status);
                      setNewPriority(a.priority);
                      setShowAdd(true);
                    }}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        `Are you sure you want to delete "${a.title}"?`,
                      );
                      if (ok) {
                        deleteAssignment(idx);
                      }
                    }}
                    className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${
                      a.status === "Submitted"
                        ? "w-full bg-green-500"
                        : a.status === "In Progress"
                          ? "w-2/3 bg-yellow-500"
                          : "w-1/4 bg-blue-500"
                    }`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Progress is UI-only for now.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4"></div>
      </div>
    </div>
  );
}
