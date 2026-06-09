import { useState } from "react";

export default function Calendar({ assignments }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const toKey = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const dotColor = (status) => {
    if (status === "Not Started") return "bg-blue-500";
    if (status === "In Progress") return "bg-yellow-500";
    if (status === "Submitted") return "bg-green-500";
    return "bg-slate-400";
  };

 

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="mt-1 text-white/90">
              Assignments shown on due dates.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goPrevMonth}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
            >
              ◀
            </button>
            <button
              onClick={goNextMonth}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {monthName} {year}
        </h2>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Today
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="grid grid-cols-7 gap-2 text-center">
          {days.map((day) => (
            <div key={day} className="text-sm font-semibold text-slate-600">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
            const key = toKey(year, month, date);

            const dueToday = assignments.filter((a) => a.due === key);

            return (
              <div
                key={date}
                className="min-h-[74px] rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {date}
                  </span>

                  <div className="flex gap-1">
                    {dueToday.slice(0, 3).map((a, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-2 rounded-full ${dotColor(a.status)}`}
                        title={a.title}
                      />
                    ))}
                  </div>
                </div>

                {dueToday.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-700">
                    {dueToday[0].title}
                    {dueToday.length > 1 ? ` +${dueToday.length - 1} more` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="text-sm font-bold text-slate-900">Legend</h3>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Not Started</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>In Progress</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span>Submitted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
