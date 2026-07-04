import axios from 'axios';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function request(method, path, body) {
  try {
    const res = await client.request({ method, url: path, data: body });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Request failed');
  }
}

export const apiGet = (path) => request('get', path);
export const apiPost = (path, body) => request('post', path, body);
export const apiPatch = (path, body) => request('patch', path, body);
export const apiDelete = (path) => request('delete', path);
