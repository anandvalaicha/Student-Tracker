import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

const WITH_COURSE = `
  SELECT a.*, c.color AS course_color, c.code AS course_code, c.credits AS course_credits
  FROM   assignments a
  LEFT JOIN courses c ON c.id = a.course_id
`;

router.get('/', (req, res) => {
  const rows = db
    .prepare(`${WITH_COURSE} WHERE a.user_id = ? ORDER BY a.due ASC, a.created_at DESC`)
    .all(req.user.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const {
    title, course, course_id = null, due,
    status = 'Not Started', priority = 'Medium',
    marks_received = null, marks_total = 100,
  } = req.body ?? {};

  if (!title?.trim() || !course?.trim() || !due) {
    return res.status(400).json({ message: 'Title, course, and due date are required' });
  }

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO assignments (user_id, course_id, title, course, due, status, priority, marks_received, marks_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, course_id, title.trim(), course.trim(), due, status, priority, marks_received, marks_total);

  const created = db.prepare(`${WITH_COURSE} WHERE a.id = ?`).get(lastInsertRowid);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Assignment not found' });

  const {
    title          = existing.title,
    course         = existing.course,
    course_id      = existing.course_id,
    due            = existing.due,
    status         = existing.status,
    priority       = existing.priority,
    marks_received = existing.marks_received,
    marks_total    = existing.marks_total ?? 100,
  } = req.body ?? {};

  db.prepare(
    'UPDATE assignments SET title=?, course=?, course_id=?, due=?, status=?, priority=?, marks_received=?, marks_total=? WHERE id=? AND user_id=?'
  ).run(title.trim(), course.trim(), course_id, due, status, priority, marks_received, marks_total, id, req.user.id);

  const updated = db.prepare(`${WITH_COURSE} WHERE a.id = ?`).get(id);
  res.json(updated);
});

// Lightweight grade-only update
router.patch('/:id/grade', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT id FROM assignments WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Assignment not found' });

  const { marks_received = null, marks_total = 100 } = req.body ?? {};

  db.prepare(
    'UPDATE assignments SET marks_received=?, marks_total=? WHERE id=? AND user_id=?'
  ).run(marks_received, marks_total, id, req.user.id);

  const updated = db.prepare(`${WITH_COURSE} WHERE a.id = ?`).get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT id FROM assignments WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Assignment not found' });

  db.prepare('DELETE FROM assignments WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.status(204).end();
});

export default router;
