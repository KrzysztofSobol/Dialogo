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
    await this.page.goto('/profile');
  }

  async gotoFriends() {
    await this.page.goto('/friends');
  }

  async gotoHelpPage() {
    await this.page.goto('/help');
  }

  async uploadAvatar(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.profileAvatar.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // Akcje dla znajomych
  async getMyFriendCode(): Promise<string> {
    await this.gotoFriends();
    // Zakładamy klasę lub pole, gdzie wyświetla się kod (dostosuj do swojego kodu)
    return await this.page.locator('.friend-code').innerText(); 
  }

  async addFriend(code: string) {
    await this.page.locator('input[placeholder="Enter your friend code ..."]').fill(code);
    await this.page.getByRole('button', { name: 'Add Friend' }).click();
  }

  friendListItem(name: string): Locator {
    return this.page.locator('.friend-card').filter({ hasText: name });
  }

  async removeFriend(name: string) {
    const friendElement = this.friendListItem(name);
    await friendElement.locator('button').nth(0).click(); // Pierwszy przycisk w karcie to chat, drugi to video
  }

  // Akcje dla serwerów w layoutcie
  serverIcon(name: string): Locator {
    // Wyszukuje ikonę serwera na pasku nawigacyjnym po nazwie/tekście
    return this.page.locator('a').filter({ hasText: name });
  }

  async leaveServer(name: string) {
    await this.serverIcon(name).click({ button: 'right' }); // prawy przycisk myszy
    await this.page.getByText('Opuść serwer').click();
    await this.page.getByRole('button', { name: 'Potwierdź' }).click(); // potwierdzenie modala
  }

  // Notyfikacje
  toastNotification(text: string) {
    return this.page.locator('.notification-content', { hasText: text });
  }
}