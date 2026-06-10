import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { updateMe } from '../api/auth';

export default function Profile({ user }) {
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name,       setName]       = useState('');
  const [university, setUniversity] = useState('');
  const [saving,     setSaving]     = useState(false);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [dueReminders, setDueReminders] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setUniversity(user.university ?? '');
    }
  }, [user]);

  const saveProfile = async () => {
    if (!name.trim() || !university.trim()) {
      toast({ message: 'Name and university are required', type: 'error' }); return;
    }
    setSaving(true);
    try {
      await updateMe({ name: name.trim(), university: university.trim() });
      toast({ message: 'Profile updated!' });
      setIsEditing(false);
    } catch {
      toast({ message: 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const focusBtn = (min) =>
    `rounded-xl border px-4 py-2 text-sm font-semibold transition ${
      focusMinutes === min
        ? 'border-indigo-500 bg-indigo-600 text-white'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`;

  const inputCls = (disabled) =>
    `mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
      disabled
        ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
        : 'border-slate-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-violet-50 border border-violet-100 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-slate-500">Your details and study preferences.</p>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow">
              {name ? name.slice(0, 2).toUpperCase() : '??'}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{name || 'Student'}</p>
              <p className="text-sm text-slate-500">{university}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Personal info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Personal Info</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</label>
              <input className={inputCls(!isEditing)} value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input className={inputCls(true)} value={user?.email ?? ''} disabled />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">University</label>
              <input className={inputCls(!isEditing)} value={university} onChange={(e) => setUniversity(e.target.value)} disabled={!isEditing} />
            </div>
            <button
              onClick={saveProfile}
              disabled={!isEditing || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Study Preferences</h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Focus Session Length</p>
              <p className="mt-1 text-sm text-slate-500">Choose your default Pomodoro duration.</p>
              <div className="mt-3 flex gap-2">
                {[25, 45, 60].map((m) => (
                  <button key={m} onClick={() => setFocusMinutes(m)} className={focusBtn(m)}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <div className="mt-3 space-y-3">
                {[
                  { label: 'Due date reminders', val: dueReminders, set: setDueReminders },
                  { label: 'Daily focus reminder', val: dailyReminder, set: setDailyReminder },
                ].map(({ label, val, set }) => (
                  <label key={label} className="flex cursor-pointer items-center justify-between">
                    <span className="text-sm text-slate-700">{label}</span>
                    <div
                      onClick={() => set((v) => !v)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${val ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => toast({ message: `Preferences saved: ${focusMinutes}min focus, reminders ${dueReminders ? 'on' : 'off'}` })}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
