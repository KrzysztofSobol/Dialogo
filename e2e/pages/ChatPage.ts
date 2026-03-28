import type { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly fileUploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // messageForm.vue uses <UTextarea> with this placeholder
    this.messageInput = page.getByPlaceholder('Enter your message content');
    // FileUpload.vue uses a <UButton> with photo icon to trigger file selection
    this.fileUploadButton = page.locator('.file-upload button');
  }

  // Navigate to private chat via the chats page
  async openChatWith(friendName: string) {
    await this.page.goto('/chats');
    await this.page.locator('.friend-card').filter({ hasText: friendName }).click();
    await this.page.waitForURL('**/privateMessages/**');
  }

  // Messages are submitted via Enter key on the textarea (no send button exists)
  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.messageInput.press('Enter');
  }

  // Upload a file via the FileUpload component button
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

  // The incoming call modal is a ScreenPopUp with title "Calling"
  get incomingCallPopup(): Locator {
    return this.page.locator('.modal-title', { hasText: 'Calling' }).locator('..').locator('..').locator('..');
  }

  // Nuxt UI UNotifications toast for call declined
  get callDeclinedNotification(): Locator {
    return this.page.getByText('declined');
  }

  get videoRoomIsConnected(): Promise<boolean> {
    return this.page.locator('video').first().isVisible();
  }

  // Accept incoming call via ScreenPopUp modal (Answer button)
  async acceptCall() {
    await this.page.getByRole('button', { name: 'Answer' }).click();
  }

  // Decline incoming call via ScreenPopUp modal (Decline button)
  async declineCall() {
    await this.page.getByRole('button', { name: 'Decline' }).click();
  }

  // Cancel outgoing call via the caller's ScreenPopUp modal (Cancel button)
  async cancelCall() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}