import { get, post, put, patch, del } from './client.js';

export const getAll    = ()            => get('/notes');
export const create    = (data)        => post('/notes', data);
export const update    = (id, data)    => put(`/notes/${id}`, data);
export const togglePin = (id)          => patch(`/notes/${id}/pin`, {});
export const remove    = (id)          => del(`/notes/${id}`);
