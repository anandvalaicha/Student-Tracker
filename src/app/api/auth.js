import { get, post, patch } from './client.js';

export const login = (email, password) =>
  post('/auth/login', { email, password });

export const getMe = () => get('/auth/me');

export const updateMe = (data) => patch('/auth/me', data);
