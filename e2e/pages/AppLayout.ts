import type { Page, Locator } from '@playwright/test';

export class AppLayout {
  readonly page: Page;
  readonly mainView: Locator;
  readonly avatarImage: Locator;
  readonly logoutButton: Locator;
  readonly profileAvatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainView = page.locator('.main-container');
    this.avatarImage = page.locator('img.avatar');
    this.logoutButton = page.getByRole('button', { name: 'Log Out' });
    this.profileAvatar = page.locator('.avatar-container').first();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async gotoProfile() {
    await this.page.goto('/profile', { waitUntil: 'domcontentloaded' });
  }

  async gotoFriends() {
    await this.page.goto('/friends', { waitUntil: 'domcontentloaded' });
  }

  async gotoHelpPage() {
    await this.page.goto('/help', { waitUntil: 'domcontentloaded' });
  }

  async uploadAvatar(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.profileAvatar.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // --- Friend actions ---

  async getMyFriendCode(): Promise<string> {
    await this.gotoProfile();
    const friendCodeElement = this.page.locator('div').filter({ hasText: /^Friend Code:/ }).last();
    const fullText = await friendCodeElement.innerText();
    const cleanCode = fullText.replace('Friend Code:', '').trim();
    return cleanCode;
  }

  async addFriend(code: string) {
    await this.page.getByPlaceholder('Enter your friend code ...').fill(code);
    const addFriendPromise = this.page.waitForResponse(response =>
      response.url().includes('/api/') && response.status() === 200
    );

    await this.page.getByRole('button', { name: 'Add Friend' }).click();
    await addFriendPromise;
  }

  friendListItem(name: string): Locator {
    return this.page.locator('.friend-card').filter({ hasText: name });
  }

  async removeFriend(name: string) {
    const friendElement = this.friendListItem(name);
    this.page.on('dialog', dialog => dialog.accept());
    await friendElement.locator('button[title="Remove friend"]').click();
  }

  // --- Video call actions in layout ---

  async startVideoCall(name: string) {
    const friendElement = this.friendListItem(name);
    this.page.on('dialog', dialog => dialog.accept());
    await friendElement.locator('button[title="Video call"]').click();
  }

  // --- Server actions in layout ---

  serverCard(name: string): Locator {
    return this.page.locator('.server-card').filter({ hasText: name });
  }

  async isServerVisible(name: string): Promise<boolean> {
    const serversLoadedPromise = this.page.waitForResponse(response =>
      response.url().includes('/api/servers') && response.status() === 200
    );
    await this.page.goto('/my-servers', { waitUntil: 'domcontentloaded' });
    await serversLoadedPromise;
    return this.serverCard(name).isVisible();
  }

  // --- Notifications ---

  toastNotification(text: string) {
    return this.page.getByText(text);
  }
}