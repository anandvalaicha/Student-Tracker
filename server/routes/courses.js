import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*,
           COUNT(a.id) AS assignment_count
    FROM   courses c
    LEFT JOIN assignments a ON a.course_id = c.id
    WHERE  c.user_id = ?
    GROUP  BY c.id
    ORDER  BY c.name ASC
  `).all(req.user.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, code = '', professor = '', credits = 3, color = '#6366f1' } = req.body ?? {};

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Course name is required' });
  }

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO courses (user_id, name, code, professor, credits, color) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, name.trim(), code.trim(), professor.trim(), credits, color);

  const created = db.prepare(
    'SELECT *, 0 AS assignment_count FROM courses WHERE id = ?'
  ).get(lastInsertRowid);

  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM courses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Course not found' });

  const {
    name      = existing.name,
    code      = existing.code,
    professor = existing.professor,
    credits   = existing.credits,
    color     = existing.color,
  } = req.body ?? {};

  db.prepare(
    'UPDATE courses SET name=?, code=?, professor=?, credits=?, color=? WHERE id=?'
  ).run(name.trim(), code.trim(), professor.trim(), credits, color, req.params.id);

  const updated = db.prepare(`
    SELECT c.*, COUNT(a.id) AS assignment_count
    FROM courses c
    LEFT JOIN assignments a ON a.course_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(req.params.id);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT id FROM courses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Course not found' });

  // Unlink assignments so they aren't cascade-deleted
  db.prepare('UPDATE assignments SET course_id = NULL WHERE course_id = ?').run(req.params.id);
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);

  res.status(204).end();
});

export default router;
