import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import assignmentsRouter from './routes/assignments.js';
import coursesRouter from './routes/courses.js';
import notesRouter   from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/notes',   notesRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`StudyFlow API running at http://localhost:${PORT}`);
});
