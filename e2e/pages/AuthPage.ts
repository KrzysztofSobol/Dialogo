import type { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly toggleModeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator('.auth-container');
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.locator('button[type="submit"]');
    this.toggleModeLink = page.getByText(/Don't have an account|Already have an account/);
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    await this.page.evaluate(() => { (window as any).__isReloading = true; });
    const loginPromise = this.page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    await this.submitButton.click();
    await loginPromise;

    await this.page.waitForFunction(() => !(window as any).__isReloading);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoRegister() {
    await this.goto();
    await this.toggleModeLink.click();
  }

  async register(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    await this.page.evaluate(() => { (window as any).__isReloading = true; });
    const registerPromise = this.page.waitForResponse(response =>
      response.url().includes('/api/auth/register') && response.status() === 200
    );
    await this.submitButton.click();
    await registerPromise;

    await this.page.waitForFunction(() => !(window as any).__isReloading);
    await this.page.waitForLoadState('domcontentloaded');
  }
}