import { get, post, put, del } from './client.js';

export const getAll  = ()         => get('/courses');
export const create  = (data)     => post('/courses', data);
export const update  = (id, data) => put(`/courses/${id}`, data);
export const remove  = (id)       => del(`/courses/${id}`);
