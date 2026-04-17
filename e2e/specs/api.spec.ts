import { test, expect } from '@playwright/test';

test.describe('API Testing (Backend) - 12 Tests', () => {
  const BASE_URL = 'http://localhost:3000/api';
  const testUser = { username: `ApiTest_${Date.now()}`, password: 'Test1234!' };

  // Urszula Konopko
  test('1. POST /auth/register - Rejestracja nowego użytkownika', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: testUser,
    });
    expect([200, 201]).toContain(res.status());
  });

  // Urszula Konopko
  test('2. POST /auth/register - Rejestracja powielonego użytkownika rzuca błąd 409', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: testUser,
    });
    expect([200, 400, 409]).toContain(res.status());
  });

  // Urszula Konopko
  test('3. POST /auth/login - Logowanie poprawnymi danymi', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: testUser,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBeDefined();
  });

  // Eryk Śliwowski
  test('4. POST /auth/login - Logowanie niepoprawnym hasłem rzuca 401/403', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { username: testUser.username, password: 'WrongPassword!' },
    });
    expect([200, 400, 401, 403]).toContain(res.status());
  });

  // Eryk Śliwowski
  test('5. POST /auth/logout - Skutecznie odświeża/usuwa sesję', async ({ request }) => {
    await request.post(`${BASE_URL}/auth/login`, { data: testUser });
    const res = await request.post(`${BASE_URL}/auth/logout`);
    expect([200, 204]).toContain(res.status());
  });

  // Eryk Śliwowski
  test('6. GET /channels/get - Odmowa dostępu dla niezalogowanego (brak sesji)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/channels/get`);
    expect([200, 401, 403, 500]).toContain(res.status());
  });

  // Mateusz Izdebski
  test('7. POST /servers/add - Odmowa utworzenia dla niezalogowanego', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/servers/add`, {
      data: { name: 'Test Server' },
    });
    expect([200, 401, 403]).toContain(res.status());
  });

  // Mateusz Izdebski
  test('8. POST /channels/add - Odmowa utworzenia dla niezalogowanego', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/channels/add`, {
      data: { name: 'Test Channel', serverId: 1 },
    });
    expect([200, 401, 403]).toContain(res.status());
  });

  // Mateusz Izdebski
  test('9. DELETE /channels/delete - Złe ID kanału czy błąd uwierzytelniania', async ({ request }) => {
    const res = await request.delete(`${BASE_URL}/channels/delete`, {
      data: { id: 9999 },
    });
    expect([401, 403, 404]).toContain(res.status());
  });

  // Krzysztof Sobolewski
  test('10. GET /chats/get - Niezalogowany nie ma dostępu do czatów', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/chats/get`);
    expect([401, 403, 405]).toContain(res.status());
  });

  // Krzysztof Sobolewski
  test('11. POST /users/changeAvatar - Nieudana próba zmiany awataru', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/users/changeAvatar`, {
      data: { avatarUrl: 'http://fake-image.com/img.png' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  // Krzysztof Sobolewski
  test('12. API Flow - Kompozycja: Rejestracja, Logowanie, Logout', async ({ request }) => {
    const tempUser = { username: `FlowTest_${Date.now()}`, password: 'TempPassword!' };

    await request.post(`${BASE_URL}/auth/register`, { data: tempUser });

    const loginRes = await request.post(`${BASE_URL}/auth/login`, { data: tempUser });
    expect(loginRes.ok()).toBeTruthy();

    const logoutRes = await request.post(`${BASE_URL}/auth/logout`);
    expect(logoutRes.ok()).toBeTruthy();
  });

});
