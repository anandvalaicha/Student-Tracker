import { useState } from "react";

export default function Profile() {
  // ✅ Profile editing
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("Anand");
  const [email, setEmail] = useState("anand@example.com");
  const [university, setUniversity] = useState("Griffith University");

  // ✅ Preferences
  const [focusMinutes, setFocusMinutes] = useState(45);
  const [dueReminders, setDueReminders] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);

  const saveProfile = () => {
    if (!fullName.trim() || !email.trim() || !university.trim()) {
      alert("Please fill all fields.");
      return;
    }
    setIsEditing(false);
    alert("Profile saved (UI only) ✅");
  };

  const updatePreferences = () => {
    alert(
      `Preferences updated ✅
Focus session: ${focusMinutes} minutes
Due reminders: ${dueReminders ? "ON" : "OFF"}
Daily focus reminder: ${dailyReminder ? "ON" : "OFF"}`
    );
  };

  const focusBtnStyle = (minutes) => {
    const isActive = focusMinutes === minutes;
    return `rounded-xl px-3 py-2 text-sm font-semibold border border-slate-200
      ${isActive ? "bg-blue-600 text-white" : "bg-white text-slate-800 hover:bg-slate-50"}`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-white/90">Your details and study preferences.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-2xl">
              👤
            </div>

            <div>
              <p className="text-xl font-bold text-slate-900">{fullName}</p>
              <p className="text-sm text-slate-500">Master of IT • Griffith</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing((v) => !v)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Personal Info */}
        <div className="rounded-2xl bg-white p-6 shadow flex flex-col gap-5 relative">
          <h2 className="text-lg font-bold text-slate-900">Personal Info</h2>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Full Name</p>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">Email</p>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">University</p>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={!isEditing}
              className="absolute bottom-6 w-[93%] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold text-slate-900">Study Preferences</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Focus Session Length
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Choose your default timer length.
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setFocusMinutes(25)}
                  className={focusBtnStyle(25)}
                >
                  25m
                </button>
                <button
                  onClick={() => setFocusMinutes(45)}
                  className={focusBtnStyle(45)}
                >
                  45m
                </button>
                <button
                  onClick={() => setFocusMinutes(60)}
                  className={focusBtnStyle(60)}
                >
                  60m
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Notifications
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Toggle reminders (UI only).
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">Due date reminders</span>
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={dueReminders}
                  onChange={() => setDueReminders((v) => !v)}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">Daily focus reminder</span>
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={dailyReminder}
                  onChange={() => setDailyReminder((v) => !v)}
                />
              </div>
            </div>

            <button
              onClick={updatePreferences}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Update Preferences
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow"></div>
    </div>
  );
}
