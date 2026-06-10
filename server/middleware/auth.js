import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'studyflow-dev-secret-change-in-production';

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
}
