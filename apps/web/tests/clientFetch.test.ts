import { describe, it, expect, beforeAll } from 'vitest';
import { clientFetch } from '../app/lib/api';

let TEST_USER = {
  email: `test-client-${Date.now()}@example.com`,
  password: 'Test123456!'
};

let userId: string | number | null = null;

beforeAll(() => {
  // jsdom environment is configured in vitest.config.ts with the correct URL
  // Ensure clean storage between tests in this file
  window.localStorage.clear();
});

async function setAuth(t?: string | null) {
  if (t) {
    window.localStorage.setItem('auth_token', t);
  } else {
    window.localStorage.removeItem('auth_token');
  }
}

async function signup() {
  const res = await clientFetch<any>('/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
  });
  expect(res?.token).toBeTruthy();
  expect(res?.id).toBeTruthy();
  await setAuth(res.token);
  userId = res.id;
  return res;
}

async function login(password: string) {
  const res = await clientFetch<any>('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER.email, password })
  });
  return res;
}

describe('clientFetch auth flow', () => {
  it('health check ok', async () => {
    const res = await clientFetch<any>('/api/health');
    expect(res?.ok).toBe(true);
  });

  it('signup returns token and id', async () => {
    const res = await signup();
    expect(res.email).toBe(TEST_USER.email);
  });

  it('duplicate signup returns 409', async () => {
    // Expect ApiError with status 409
    await expect(
      clientFetch('/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(TEST_USER)
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('me returns current user when token present', async () => {
    const res = await clientFetch<any>('/auth/me');
    expect(res?.user?.email).toBe(TEST_USER.email);
    expect(res?.user?.id?.toString()).toBe(userId!.toString());
  });

  it('logout ok and me returns null without token', async () => {
    await clientFetch('/auth/logout', { method: 'POST' });
    await setAuth(null);
    const res = await clientFetch<any>('/auth/me');
    expect(res?.user).toBeNull();
  });

  it('me returns null with invalid token', async () => {
    await setAuth('invalid.token');
    const res = await clientFetch<any>('/auth/me');
    expect(res?.user).toBeNull();
    await setAuth(null);
  });

  it('login success and me returns user again', async () => {
    const res = await login(TEST_USER.password);
    expect(res?.token).toBeTruthy();
    await setAuth(res.token);
    const me = await clientFetch<any>('/auth/me');
    expect(me?.user?.email).toBe(TEST_USER.email);
  });

  it('login wrong password returns 401', async () => {
    await expect(
      login('WrongPassword!')
    ).rejects.toMatchObject({ status: 401 });
  });
});
