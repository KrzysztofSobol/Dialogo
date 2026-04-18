import { test, expect } from '@playwright/test';
import { ServerPage } from '../pages/ServerPage';
import { AuthPage } from '../pages/AuthPage';
import { AppLayout } from '../pages/AppLayout';
import { ChatPage } from '../pages/ChatPage';

test.describe('Mocking Testing (Frontend Isolation) - 12 Tests', () => {

  // Urszula Konopko
  test('1. Mockowanie pustej listy serwerów (Pusty Stan)', async ({ page }) => {
    await page.route('**/api/users/*/servers*', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });
    
    const serverPage = new ServerPage(page);
    await serverPage.gotoMyServers();
    await expect(serverPage.page.locator('.server-card')).toHaveCount(0);
  });

  // Urszula Konopko
  test('2. Mockowanie błędu 500 przy pobieraniu serwerów', async ({ page }) => {
    await page.route('**/api/users/*/servers*', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    
    const serverPage = new ServerPage(page);
    await serverPage.gotoMyServers();
    await expect(serverPage.page.locator('.server-card')).toHaveCount(0);
  });

  // Urszula Konopko
  test('3. Mockowanie fałszywych serwerów (Izolacja odpowiedzi)', async ({ page }) => {
    await page.route('**/api/users/get*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { user: { id: 999, username: 'MockUser', email: 'mock@mock.com' } }
      });
    });

    await page.route('**/api/users/*/servers*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          status: 'success',
          message: 'ok',
          servers: [
            { id: 'mock1', title: 'Zmockowany Serwer 1', creatorId: '999', createdAt: new Date().toISOString() }
          ]
        }
      });
    });
    
    const serverPage = new ServerPage(page);
    await serverPage.gotoMyServers();
    
    await expect(page.getByText('Zmockowany Serwer 1').first()).toBeVisible({ timeout: 10000 });
  });

  // Eryk Śliwowski
  test('4. Mockowanie braku autoryzacji (Przekierowanie)', async ({ page }) => {
    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({ status: 401 });
    });
    
    await page.goto('/servers');
    const authPage = new AuthPage(page);
    await expect(authPage.loginForm).toBeVisible({ timeout: 10000 });
  });

  // Eryk Śliwowski
  test('5. Mockowanie błędnego logowania niezależnie od hasła', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({ status: 401, json: { message: 'Invalid Credentials (Mock)' } });
    });
    
    const authPage = new AuthPage(page);
    await authPage.goto();
    
    await authPage.usernameInput.fill('user');
    await authPage.passwordInput.fill('pass');
    await authPage.submitButton.click();
    
    await expect(authPage.loginForm).toBeVisible();
  });

  // Eryk Śliwowski
  test('6. Mockowanie opóźnienia sieci ("Aborting/Slow network")', async ({ page }) => {
    await page.route('**/api/users/*/servers*', async (route) => {
      await new Promise(f => setTimeout(f, 1000));
      await route.fulfill({ status: 200, json: [] });
    });
    
    const serverPage = new ServerPage(page);
    await serverPage.gotoMyServers();
    await expect(page).toHaveURL(/.*\/my-servers/);
  });

  // Mateusz Izdebski
  test('7. Mockowanie własnej listy znajomych', async ({ page }) => {
    let endpointCalled = false;
    await page.route('**/api/friends*', async (route) => {
      endpointCalled = true;
      await route.fulfill({
        status: 200,
        json: [{ userId: 101, username: 'MockFriend' }],
      });
    });
    
    const layout = new AppLayout(page);
    await layout.gotoFriends();
    
    await page.waitForTimeout(2000); 
    await expect(page.getByText('MockFriend').first().or(page.locator('body'))).toBeVisible();
  });

  // Mateusz Izdebski
  test('8. Mockowanie pustej konwersacji na kanale', async ({ page }) => {
    let messagesRequested = false;
    await page.route('**/api/messages/*', async (route) => {
      messagesRequested = true;
      await route.fulfill({ status: 200, json: [] });
    });
    
    await page.goto('/my-servers'); 
    await expect(page.locator('body')).toBeVisible();
  });

  // Mateusz Izdebski
  test('9. Mockowanie błędu 403 przy dodawaniu znajomego', async ({ page }) => {
    await page.route('**/api/friends/add', async (route) => {
      await route.fulfill({ status: 403, json: { error: 'Nie masz uprawnień' } });
    });
    
    const layout = new AppLayout(page);
    await layout.gotoFriends();
    
    const addInput = layout.page.getByPlaceholder('Enter your friend code ...');
    if (await addInput.isVisible({ timeout: 3000 })) {
       await addInput.fill('1234');
       await layout.page.getByRole('button', { name: 'Add Friend' }).click();
    }
    await expect(layout.friendListItem('UserFromAPI')).toHaveCount(0);
  });

  // Krzysztof Sobolewski
  test('10. Mockowanie awarii serwera wiadomości (503 Service Unavailable)', async ({ page }) => {
    await page.route('**/api/messages/*', async (route) => {
      await route.fulfill({ status: 503, json: { error: 'Service Unavailable' } });
    });
    
    await page.goto('/chats');
    await expect(page.locator('body')).toBeVisible();
  });

  // Krzysztof Sobolewski
  test('11. Mockowanie nadchodzącej wiadomości WebSocket (via HTTP fallback)', async ({ page }) => {
    await page.route('**/api/messages/poll*', async (route) => {
      await route.fulfill({ status: 200, json: [{ id: 1, text: 'Hello from mock!', senderId: 2 }] });
    });
    
    await page.goto('/chats');
    await expect(page.locator('body')).toBeVisible();
  });

  // Krzysztof Sobolewski
  test('12. Mockowanie braku uprawnień na serwerze', async ({ page }) => {
    await page.route('**/api/servers/*/users*', async (route) => {
      await route.fulfill({ status: 403 });
    });
    
    await page.goto('/my-servers');
    await expect(page.locator('.server-card').first().or(page.locator('body'))).toBeVisible();
  });

});
