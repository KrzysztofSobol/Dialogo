import type { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly fileUploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.getByPlaceholder('Enter your message content');
    this.fileUploadButton = page.locator('.file-upload button');
  }

  async openChatWith(friendName: string) {
    await this.page.goto('/chats');
    await this.page.locator('.friend-card').filter({ hasText: friendName }).click();
    await this.page.waitForURL('**/privateMessages/**');
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.messageInput.press('Enter');
  }
  async uploadFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.fileUploadButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  get lastMessage(): Locator {
    return this.page.locator('.card').last();
  }

  get lastAttachment(): Locator {
    return this.lastMessage.locator('img');
  }

  // --- Video Calls (ScreenPopUp component using UModal) ---

  get incomingCallPopup(): Locator {
    return this.page.locator('.modal-title', { hasText: 'Calling' }).locator('..').locator('..').locator('..');
  }

  get callDeclinedNotification(): Locator {
    return this.page.getByText('declined');
  }

  get videoRoomIsConnected(): Promise<boolean> {
    return this.page.locator('video').first().isVisible();
  }

  async acceptCall() {
    await this.page.getByRole('button', { name: 'Answer' }).click();
  }

  async declineCall() {
    await this.page.getByRole('button', { name: 'Decline' }).click();
  }

  async cancelCall() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}