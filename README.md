# StudyFlow — Student Assignment Tracker

A client-side React web app for students to manage assignments, track due dates on a calendar, and stay focused with a built-in Pomodoro timer. All data is saved to the browser's localStorage — no backend or account needed.

---

## Features

### Dashboard
- Summary stats: total assignments, due this week, overdue, and submitted
- Upcoming assignments sorted by due date (next 5 shown)
- Built-in **Pomodoro timer** (25-minute countdown with Start, Pause, and Reset)

### Assignments
- Add, edit, and delete assignments
- Fields: Title, Course, Due Date, Status, Priority
- Filter by status (Not Started / In Progress / Submitted) and priority (High / Medium / Low)
- Search by title or course name
- Color-coded progress bars and status badges

### Calendar
- Monthly calendar view with due dates marked as colored dots
- Dot color matches assignment status (blue = Not Started, yellow = In Progress, green = Submitted)
- Navigate between months with Previous / Next arrows

### Profile
- View and edit your name, email, and university
- Set preferred focus session length (25 / 45 / 60 minutes)
- Toggle due date and daily focus reminders (UI-only)

### Authentication
- Simple login with any non-empty email and password
- Demo credentials pre-filled for quick access
- Session persisted in localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Navigation | Custom `nav` state (no React Router) |
| Persistence | Browser localStorage |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Student-Tracker

# Install dependencies
npm install
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo login

| Field | Value |
|---|---|
| Email | demo@studyflow.com |
| Password | demo1234 |

Click the **Auto-fill** button on the login page to fill these in automatically.

---

## Project Structure

```
Student-Tracker/
├── public/                   # Static assets
├── src/
│   ├── app/
│   │   ├── constants/
│   │   │   └── pages.js      # Page keys, titles, and nav icons
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx   # Left navigation sidebar
│   │   │   └── Topbar.jsx    # Top bar with page title and logout
│   │   ├── pages/
│   │   │   ├── Login.jsx     # Login form with demo credentials
│   │   │   ├── Dashboard.jsx # Stats, upcoming assignments, Pomodoro timer
│   │   │   ├── Assignments.jsx # Full CRUD + filter/search
│   │   │   ├── Calendar.jsx  # Monthly calendar with due date dots
│   │   │   └── Profile.jsx   # User info and study preferences
│   │   ├── store/
│   │   │   └── useAuth.js    # Auth state hook (login/logout/localStorage)
│   │   └── utils/
│   │       └── storage.js    # localStorage helpers with "studyflow:" prefix
│   ├── App.jsx               # Root component — navigation and assignment state
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind CSS import
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── .gitignore
```

---

## Assignment Data Schema

```js
{
  title: string,          // e.g. "React Mini Project"
  course: string,         // e.g. "Frontend"
  due: string,            // YYYY-MM-DD format
  status: "Not Started" | "In Progress" | "Submitted",
  priority: "High" | "Medium" | "Low"
}
```

Assignments are saved automatically to localStorage under the key `studyflow:assignments`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server at localhost:5173 |
| `npm run build` | Build for production (output in `/dist`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Notes & Limitations

- **No backend** — all data lives in the browser. Clearing localStorage resets everything.
- **No real authentication** — any non-empty email/password combination works.
- **Profile changes** are local state only and reset on page refresh.
- The **Export** button and **Sign Up** link are UI placeholders.
- The Pomodoro timer resets if you navigate away from the Dashboard.
