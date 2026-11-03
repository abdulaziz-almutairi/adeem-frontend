import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import api from './apiService';

const originalAdapter = api.defaults.adapter;
const originalLocation = window.location;

function respondWith(status: number): { seen: InternalAxiosRequestConfig[] } {
  const seen: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    seen.push(config);
    const response = { data: {}, status, statusText: String(status), headers: {}, config };
    if (status >= 400) throw new AxiosError('failed', String(status), config, null, response);
    return response;
  };
  api.defaults.adapter = adapter;
  return { seen };
}

describe('apiService', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '/' } });
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('sends the stored token as a Bearer header', async () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    const { seen } = respondWith(200);

    await api.get('/users/me');

    expect(seen[0].headers.Authorization).toBe('Bearer abc');
  });

  it('sends no Authorization header without a token', async () => {
    const { seen } = respondWith(200);

    await api.get('/doctors/verified');

    expect(seen[0].headers.Authorization).toBeUndefined();
  });

  it('clears the session and goes to login on 401', async () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    localStorage.setItem('adeem_user', '{}');
    respondWith(401);

    await expect(api.get('/users/me')).rejects.toBeInstanceOf(AxiosError);

    expect(localStorage.getItem('adeem_auth_token')).toBeNull();
    expect(localStorage.getItem('adeem_user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('keeps the session on other errors', async () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    respondWith(403);

    await expect(api.get('/users/me')).rejects.toBeInstanceOf(AxiosError);

    expect(localStorage.getItem('adeem_auth_token')).toBe('abc');
    expect(window.location.href).toBe('/');
  });
});
