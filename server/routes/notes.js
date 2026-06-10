import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

const WITH_COURSE = `
  SELECT n.*, c.name AS course_name, c.color AS course_color, c.code AS course_code
  FROM   notes n
  LEFT JOIN courses c ON c.id = n.course_id
`;

router.get('/', (req, res) => {
  const rows = db
    .prepare(`${WITH_COURSE} WHERE n.user_id = ? ORDER BY n.pinned DESC, n.updated_at DESC`)
    .all(req.user.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { title, content = '', course_id = null, pinned = 0 } = req.body ?? {};

  if (!title?.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO notes (user_id, course_id, title, content, pinned) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, course_id, title.trim(), content.trim(), pinned ? 1 : 0);

  const created = db.prepare(`${WITH_COURSE} WHERE n.id = ?`).get(lastInsertRowid);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Note not found' });

  const {
    title     = existing.title,
    content   = existing.content,
    course_id = existing.course_id,
    pinned    = existing.pinned,
  } = req.body ?? {};

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  db.prepare(
    'UPDATE notes SET title=?, content=?, course_id=?, pinned=?, updated_at=? WHERE id=? AND user_id=?'
  ).run(title.trim(), content.trim(), course_id, pinned ? 1 : 0, now, id, req.user.id);

  const updated = db.prepare(`${WITH_COURSE} WHERE n.id = ?`).get(id);
  res.json(updated);
});

router.patch('/:id/pin', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT id, pinned FROM notes WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Note not found' });

  const newPin = existing.pinned ? 0 : 1;
  const now    = new Date().toISOString().replace('T', ' ').slice(0, 19);

  db.prepare('UPDATE notes SET pinned=?, updated_at=? WHERE id=? AND user_id=?')
    .run(newPin, now, id, req.user.id);

  const updated = db.prepare(`${WITH_COURSE} WHERE n.id = ?`).get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  if (!existing) return res.status(404).json({ message: 'Note not found' });

  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.status(204).end();
});

export default router;
