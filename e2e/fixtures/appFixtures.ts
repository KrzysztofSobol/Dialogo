// tests/fixtures/appFixtures.ts
import { test as base, type Page } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { ChatPage } from '../pages/ChatPage';
import { ServerPage } from '../pages/ServerPage';
import { AppLayout } from '../pages/AppLayout';

// Zbieramy wszystkie Page Objecty w jeden obiekt użytkownika
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

// Tworzymy Custom Fixture dla testów wymagających dwóch zalogowanych osób
export const test = base.extend<{ userA: AppUser; userB: AppUser; guest: AppUser }>({

   guest: async ({ page }, use) => {
    const guest = new AppUser(page);
  },
    
  userA: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const userA = new AppUser(page);
    
    await userA.auth.goto();
    await userA.auth.usernameInput.fill('UserA');
    await userA.auth.passwordInput.fill('Test1234!');
    await userA.auth.submitButton.click();
    await page.waitForLoadState('networkidle');
    
    await use(userA);
    await context.close();
  },
  userB: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const userB = new AppUser(page);

    await userB.auth.goto();
    await userB.auth.usernameInput.fill('UserB');
    await userB.auth.passwordInput.fill('Test1234!');
    await userB.auth.submitButton.click();
    await page.waitForLoadState('networkidle');
    
    await use(userB);
    await context.close();
  },
});
export { expect } from '@playwright/test';