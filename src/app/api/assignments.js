import { get, post, put, del } from './client.js';

export const getAll   = ()            => get('/assignments');
export const create   = (data)        => post('/assignments', data);
export const update   = (id, data)    => put(`/assignments/${id}`, data);
export const remove   = (id)          => del(`/assignments/${id}`);
