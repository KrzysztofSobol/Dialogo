import { test as base, type Page, request, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { ChatPage } from '../pages/ChatPage';
import { ServerPage } from '../pages/ServerPage';
import { AppLayout } from '../pages/AppLayout';

export class AppUser {
  auth: AuthPage;
  chat: ChatPage;
  server: ServerPage;
  layout: AppLayout;

  constructor(public page: Page) {
    this.auth = new AuthPage(page);
    this.chat = new ChatPage(page);
    this.server = new ServerPage(page);
    this.layout = new AppLayout(page);
  }
}

async function createLoggedInUser(browser: any, username: string, password: string): Promise<{ user: AppUser; context: any }> {

  const apiContext = await request.newContext();

  const registerResponse = await apiContext.post('http://localhost:3000/api/auth/register', {
    data: { username, password },
    ignoreHTTPSErrors: true,
  });

  if (!registerResponse.ok() && registerResponse.status() !== 409) {
    console.warn(`Zwrócono nieoczekiwany status przy tworzeniu usera ${username}: ${registerResponse.status()}`);
  }

  await apiContext.dispose();

  const context = await browser.newContext();
  const page = await context.newPage();
  const user = new AppUser(page);

  await user.auth.goto();
  await user.auth.login(username, password);

  await expect(user.layout.mainView).toBeVisible({ timeout: 10000 });

  return { user, context };
}

export const test = base.extend<{ userA: AppUser; userB: AppUser; guest: AppUser }>({

  guest: async ({ page }, use) => {
    const guest = new AppUser(page);
    await use(guest);
  },

  userA: async ({ browser }, use) => {
    const { user, context } = await createLoggedInUser(browser, 'UserA', 'Test1234!');
    await use(user);
    await context.close();
  },

  userB: async ({ browser }, use) => {
    const { user, context } = await createLoggedInUser(browser, 'UserB', 'Test1234!');
    await use(user);
    await context.close();
  },
});

export { expect } from '@playwright/test';