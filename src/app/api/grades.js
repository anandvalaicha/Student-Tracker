import { patch } from './client.js';

export const saveGrade = (assignmentId, marks_received, marks_total) =>
  patch(`/assignments/${assignmentId}/grade`, { marks_received, marks_total });
