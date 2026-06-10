import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, university: user.university },
  });
});

router.get('/me', verifyToken, (req, res) => {
  const user = db
    .prepare('SELECT id, email, name, university FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch('/me', verifyToken, (req, res) => {
  const { name, university } = req.body ?? {};

  if (!name?.trim() || !university?.trim()) {
    return res.status(400).json({ message: 'Name and university are required' });
  }

  db.prepare('UPDATE users SET name = ?, university = ? WHERE id = ?')
    .run(name.trim(), university.trim(), req.user.id);

  const updated = db
    .prepare('SELECT id, email, name, university FROM users WHERE id = ?')
    .get(req.user.id);

  res.json(updated);
});

export default router;
