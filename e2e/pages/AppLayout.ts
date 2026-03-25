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
    // Wait for profile to load by waiting for the Friend Code text
    const friendCodeElement = this.page.locator('div').filter({ hasText: /^Friend Code:/ }).last();
    const fullText = await friendCodeElement.innerText();
    const cleanCode = fullText.replace('Friend Code:', '').trim();
    return cleanCode;
  }

  async addFriend(code: string) {
    await this.page.getByPlaceholder('Enter your friend code ...').fill(code);
    await this.page.getByRole('button', { name: 'Add Friend' }).click();
    // Wait for the API response
    await this.page.waitForTimeout(1000);
  }

  friendListItem(name: string): Locator {
    return this.page.locator('.friend-card').filter({ hasText: name });
  }

  async removeFriend(name: string) {
    const friendElement = this.friendListItem(name);
    this.page.on('dialog', dialog => dialog.accept());
    await friendElement.locator('button[title="Remove friend"]').click();
  }

  // --- Server actions in layout ---

  // Find a server card on the my-servers page by its title
  serverCard(name: string): Locator {
    return this.page.locator('.server-card').filter({ hasText: name });
  }

  // Check if a server is visible on the my-servers page
  async isServerVisible(name: string): Promise<boolean> {
    await this.page.goto('/my-servers', { waitUntil: 'domcontentloaded' });
    // Wait a bit for the list to load
    await this.page.waitForTimeout(1500);
    return this.serverCard(name).isVisible();
  }

  // --- Notifications ---

  // Nuxt UI UNotifications renders toasts; target the notification text directly
  toastNotification(text: string) {
    return this.page.getByText(text);
  }
}