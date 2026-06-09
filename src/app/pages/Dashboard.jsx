import React from "react";
import StatCard from "../components/StatCard";
import { PAGE_KEYS } from "../constants/pages";
import { useEffect, useState } from "react";


const Dashboard = ({ onGo, assignments = [] }) => {
  const getStatusStyle = (status) => {
    if (status === "In Progress") return "bg-yellow-100 text-yellow-800";
    if (status === "Not Started") return "bg-blue-100 text-blue-800";
    if (status === "Submitted") return "bg-green-100 text-green-800";
    return "bg-slate-100 text-slate-800";
  };
    // ✅ Focus Timer (simple)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const timerId = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerId);
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    if (secondsLeft === 0) setSecondsLeft(25 * 60);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(25 * 60);
  };


  // ✅ Use assignments from props instead of hardcoded upcoming
  const upcoming = assignments
    .slice()
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  // ✅ Optional: real stats from assignments (keeps your UI same, only numbers change)
  const total = assignments.length;
  const submitted = assignments.filter((a) => a.status === "Submitted").length;

  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);

  const dueThisWeek = assignments.filter((a) => {
    const d = new Date(a.due);
    return d >= today && d <= in7Days;
  }).length;

  const overdue = assignments.filter((a) => {
    const d = new Date(a.due);
    return d < today && a.status !== "Submitted";
  }).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-white/90">Your study overview at a glance.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onGo(PAGE_KEYS.calendar)}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
            >
              View Calendar
            </button>

            <button
              onClick={() => onGo(PAGE_KEYS.assignments, { openAdd: true })}
              className="rounded-xl bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              + Add Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Total Assignments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
          <p className="mt-1 text-xs text-slate-500">Across all courses</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Due This Week</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{dueThisWeek}</p>
          <p className="mt-1 text-xs text-slate-500">Plan your next sessions</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overdue}</p>
          <p className="mt-1 text-xs text-slate-500">Focus on this first</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{submitted}</p>
          <p className="mt-1 text-xs text-slate-500">Nice progress!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow">
          <div className="flex item-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Assignments</h2>
              <p className="text-sm text-slate-500">Sorted by due date</p>
            </div>

            <button
              onClick={() => onGo(PAGE_KEYS.assignments)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View all
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                No assignments yet. Add one from the Assignments page.
              </div>
            ) : (
              upcoming.map((a, idx) => (
                <div
                  key={a.id || idx}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">
                      {a.course} • Due {a.due}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-slate-900">Quick Plan</h2>
          <p className="m-1 text-sm text-slate-500">A simple focus routine for today.</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-xs font-semibold text-purple-700">Focus Block</p>
              <p className="mt-1 font-semibold text-slate-900">
                45 minutes - Assignment Planning
              </p>
              <p className="mt-1 text-sm text-slate-600">Pick one task and finish it.</p>
            </div>

            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-xs font-semibold text-yellow-700">Next Action</p>
              <p>Break down "Tetris Report"</p>
              <p className="mt-1 text-sm text-slate-600">
                Outline • screenshots • final review
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">Focus Timer</p>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {formatTime(secondsLeft)}
                </p>

                {secondsLeft === 0 && (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                    Time’s up!
                  </span>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="w-full rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    {secondsLeft === 25 * 60 ? "Start" : secondsLeft === 0 ? "Start Again" : "Resume"}
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    Pause
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Reset
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Simple Pomodoro timer (25 min). Works without backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
