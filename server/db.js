import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'studyflow.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    name       TEXT    NOT NULL DEFAULT 'Student',
    university TEXT    NOT NULL DEFAULT 'Griffith University',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    code        TEXT    NOT NULL DEFAULT '',
    professor   TEXT    NOT NULL DEFAULT '',
    credits     INTEGER NOT NULL DEFAULT 3,
    color       TEXT    NOT NULL DEFAULT '#6366f1',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    course_id       INTEGER,
    title           TEXT    NOT NULL,
    course          TEXT    NOT NULL,
    due             TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'Not Started',
    priority        TEXT    NOT NULL DEFAULT 'Medium',
    marks_received  REAL,
    marks_total     REAL    NOT NULL DEFAULT 100,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    course_id  INTEGER,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    pinned     INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  );
`);

// ── Safe column migrations ────────────────────────────────────────────────────
const asgCols  = db.prepare('PRAGMA table_info(assignments)').all().map((c) => c.name);
const noteCols = db.prepare('PRAGMA table_info(notes)').all().map((c) => c.name);

if (!asgCols.includes('course_id'))       db.exec('ALTER TABLE assignments ADD COLUMN course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL');
if (!asgCols.includes('marks_received'))  db.exec('ALTER TABLE assignments ADD COLUMN marks_received REAL');
if (!asgCols.includes('marks_total'))     db.exec('ALTER TABLE assignments ADD COLUMN marks_total REAL NOT NULL DEFAULT 100');
if (!noteCols.includes('course_id'))      db.exec('ALTER TABLE notes ADD COLUMN course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL');
if (!noteCols.includes('updated_at'))     db.exec("ALTER TABLE notes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");

// ── Demo seed ─────────────────────────────────────────────────────────────────
const addDays = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

let demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@studyflow.com');
if (!demoUser) {
  const hash = bcrypt.hashSync('demo1234', 10);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (email, password, name, university) VALUES (?, ?, ?, ?)')
    .run('demo@studyflow.com', hash, 'Anand', 'Griffith University');
  demoUser = { id: lastInsertRowid };
}

// Seed courses + assignments
const existingCourses = db.prepare('SELECT id FROM courses WHERE user_id = ?').all(demoUser.id);
let courseIds = existingCourses.map((c) => c.id);

if (existingCourses.length === 0) {
  const ic = db.prepare('INSERT INTO courses (user_id, name, code, professor, credits, color) VALUES (?, ?, ?, ?, ?, ?)');
  const { lastInsertRowid: c1 } = ic.run(demoUser.id, 'Java Programming',    'COMP2120', 'Dr. Smith',   3, '#6366f1');
  const { lastInsertRowid: c2 } = ic.run(demoUser.id, 'Data Analytics',      'COMP3150', 'Dr. Lee',     3, '#3b82f6');
  const { lastInsertRowid: c3 } = ic.run(demoUser.id, 'Web Development',     'COMP2210', 'Dr. Patel',   3, '#10b981');
  const { lastInsertRowid: c4 } = ic.run(demoUser.id, 'Frontend Frameworks', 'COMP3200', 'Dr. Johnson', 3, '#f59e0b');
  courseIds = [c1, c2, c3, c4];

  db.prepare('DELETE FROM assignments WHERE user_id = ?').run(demoUser.id);
  const ia = db.prepare('INSERT INTO assignments (user_id, course_id, title, course, due, status, priority, marks_received, marks_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  ia.run(demoUser.id, c1, 'Tetris Game Report',          'Java Programming',    addDays(2), 'In Progress', 'High',   78,   100);
  ia.run(demoUser.id, c2, 'SQL + Power BI Dashboard',    'Data Analytics',      addDays(4), 'Not Started', 'Medium', null, 100);
  ia.run(demoUser.id, c3, 'Event Website Final Touch',   'Web Development',     addDays(6), 'Submitted',   'Low',    91,   100);
  ia.run(demoUser.id, c4, 'React Mini Project Write-up', 'Frontend Frameworks', addDays(8), 'In Progress', 'Medium', null, 100);
}

// Seed marks on submitted-but-ungraded assignments
const ungraded = db.prepare("SELECT id FROM assignments WHERE user_id=? AND marks_received IS NULL AND status='Submitted'").all(demoUser.id);
const seedMark = db.prepare('UPDATE assignments SET marks_received=?, marks_total=100 WHERE id=?');
[91, 84, 76, 68, 55].forEach((m, i) => { if (ungraded[i]) seedMark.run(m, ungraded[i].id); });

// Seed notes if demo user has none
const existingNotes = db.prepare('SELECT id FROM notes WHERE user_id = ?').all(demoUser.id);
if (existingNotes.length === 0 && courseIds.length >= 3) {
  const [c1, c2, c3] = courseIds;
  const in_ = db.prepare('INSERT INTO notes (user_id, course_id, title, content, pinned) VALUES (?, ?, ?, ?, ?)');

  in_.run(demoUser.id, c1, 'Java OOP Concepts',
`Key OOP pillars to remember:

• Encapsulation — hide internal state, expose via getters/setters
• Inheritance — child class extends parent (use "extends" keyword)
• Polymorphism — same method name, different behaviour per subclass
• Abstraction — abstract classes & interfaces define contracts

Common pitfalls:
- Don't overuse inheritance; prefer composition
- Override equals() and hashCode() together
- Use @Override annotation always`, 1);

  in_.run(demoUser.id, c2, 'SQL Quick Reference',
`-- Basic SELECT
SELECT col1, col2 FROM table WHERE condition;

-- Aggregates
SELECT course, AVG(mark) FROM grades GROUP BY course HAVING AVG(mark) > 60;

-- Joins
SELECT s.name, e.grade
FROM students s
INNER JOIN enrolments e ON s.id = e.student_id;

-- Window functions
SELECT name, mark, RANK() OVER (ORDER BY mark DESC) AS rank FROM results;`, 0);

  in_.run(demoUser.id, c3, 'CSS Flexbox Cheatsheet',
`Container properties:
  display: flex
  flex-direction: row | column | row-reverse
  justify-content: flex-start | center | space-between | space-around
  align-items: stretch | center | flex-start | flex-end
  flex-wrap: nowrap | wrap
  gap: <length>

Item properties:
  flex: <grow> <shrink> <basis>   (shorthand)
  align-self: auto | center | flex-start
  order: <integer>

Quick centering trick:
  display: flex; justify-content: center; align-items: center;`, 0);
}

export default db;
