import { test, expect } from '@playwright/test';

test.describe('API Testing (Backend) - 12 Tests', () => {
  const BASE_URL = 'http://localhost:3000/api';
  const testUser = { username: `ApiTest_${Date.now()}`, password: 'Test1234!' };

  // Urszula Konopko
  test('1. POST /auth/register - Rejestracja nowego użytkownika', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: testUser,
    });
    expect([200, 201]).toContain(res.status());

    const body = await res.json().catch(() => ({}));
    expect(body).toBeDefined();
  });

  // Urszula Konopko
  test('2. POST /auth/register - Rejestracja powielonego użytkownika rzuca błąd', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/auth/register`, {
      data: testUser,
    });
    expect([400, 409]).toContain(res.status());

    const text = await res.text();
    expect(text.toLowerCase()).not.toContain('token');
  });

  // Urszula Konopko
  test('3. POST /auth/login - Logowanie poprawnymi danymi', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: testUser,
    });
    expect(res.status()).toBe(200);

    await page.goto('/my-servers');
    await expect(page.locator('body')).toBeVisible();
  });

  // Eryk Śliwowski
  test('4. POST /auth/login - Logowanie niepoprawnym hasłem rzuca 401/403', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { username: testUser.username, password: 'WrongPassword!' },
    });
    expect([400, 401, 403]).toContain(res.status());

    await page.goto('/my-servers');
    await expect(page.locator('.server-card')).not.toBeVisible();
  });

  // Eryk Śliwowski
  test('5. POST /auth/logout - Skutecznie odświeża/usuwa sesję', async ({ request, page }) => {
    await request.post(`${BASE_URL}/auth/login`, { data: testUser });
    const res = await request.post(`${BASE_URL}/auth/logout`);
    expect([200, 204]).toContain(res.status());

    await page.goto('/profile');
    await expect(page.getByRole('button', { name: 'Log Out' })).not.toBeVisible();
  });

  // Eryk Śliwowski
  test('6. GET /channels/get - Odmowa dostępu dla niezalogowanego (brak sesji)', async ({ request, page }) => {
    const res = await request.get(`${BASE_URL}/channels/get`);
    expect([401, 403, 500]).toContain(res.status());

    const text = await res.text();
    expect(text).not.toContain('channelName');
  });

  // Mateusz Izdebski
  test('7. POST /servers/add - Odmowa utworzenia dla niezalogowanego', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/servers/add`, {
      data: { name: 'Hacked Server' },
    });
    expect([401, 403]).toContain(res.status());

    await page.goto('/servers');
    await expect(page.getByText('Hacked Server')).not.toBeVisible();
  });

  // Mateusz Izdebski
  test('8. POST /channels/add - Odmowa utworzenia dla niezalogowanego', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/channels/add`, {
      data: { name: 'Hacked Channel', serverId: 1 },
    });
    expect([401, 403]).toContain(res.status());

    await page.goto('/server/1').catch(() => { });
    await expect(page.getByText('Hacked Channel')).not.toBeVisible();
  });

  // Mateusz Izdebski
  test('9. DELETE /channels/delete - Złe ID kanału czy błąd uwierzytelniania', async ({ request, page }) => {
    const res = await request.delete(`${BASE_URL}/channels/delete`, {
      data: { id: 9999 },
    });
    expect([401, 403, 404]).toContain(res.status());

    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  // Krzysztof Sobolewski
  test('10. GET /chats/get - Niezalogowany nie ma dostępu do czatów', async ({ request, page }) => {
    const res = await request.get(`${BASE_URL}/chats/get`);
    expect([401, 403, 405]).toContain(res.status());

    await page.goto('/chats');
    await expect(page.locator('.chat-message')).not.toBeVisible();
  });

  // Krzysztof Sobolewski
  test('11. POST /users/changeAvatar - Nieudana próba zmiany awataru', async ({ request, page }) => {
    const res = await request.post(`${BASE_URL}/users/changeAvatar`, {
      data: { avatarUrl: 'http://fake-image.com/img.png' },
    });
    expect([400, 401, 403]).toContain(res.status());

    await page.goto('/profile');
    await expect(page.locator('img[src="http://fake-image.com/img.png"]')).not.toBeVisible();
  });

  // Krzysztof Sobolewski
  test('12. API Flow - Kompozycja: Rejestracja, Logowanie, Logout', async ({ request, page }) => {
    const tempUser = { username: `FlowTest_${Date.now()}`, password: 'TempPassword!' };

    await request.post(`${BASE_URL}/auth/register`, { data: tempUser });
    const loginRes = await request.post(`${BASE_URL}/auth/login`, { data: tempUser });
    expect(loginRes.ok()).toBeTruthy();

    await page.goto('/my-servers');
    await expect(page.locator('.header-row')).toBeVisible();

    const logoutRes = await request.post(`${BASE_URL}/auth/logout`);
    expect(logoutRes.ok()).toBeTruthy();

    await page.goto('/my-servers');
    await expect(page.getByRole('button', { name: 'Log Out' })).not.toBeVisible();
  });

});
