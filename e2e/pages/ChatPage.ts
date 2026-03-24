import type { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly fileInput: Locator;
  readonly videoCallButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.locator('textarea[placeholder="Enter your message content"]'); 
    this.sendButton = page.getByRole('button').filter({ hasText: 'Wyślij' });
    this.fileInput = page.locator('input[type="file"]'); 
    this.videoCallButton = page.locator('button[name="video-call"]'); 
  }

  async openChatWith(friendName: string) {
    await this.page.goto('/chats');
    await this.page.getByText(friendName).click();
  }

  // Wiadomości i Załączniki
  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  get lastMessage(): Locator {
    return this.page.locator('.card').last();
  }

  get lastAttachment(): Locator {
    return this.lastMessage.locator('img'); // Szukamy obrazka w ostatniej wiadomości
  }

  // Połączenia Wideo (screenPopUp.vue)
  get incomingCallPopup(): Locator {
    return this.page.locator('[role="dialog"]'); 
  }

  get callDeclinedNotification(): Locator {
    return this.page.locator('.notification-content', { hasText: 'odrzucił' });
  }

  get videoRoomIsConnected(): Promise<boolean> {
    // W teście użyliśmy expect().toBeTruthy(), więc zwracamy Promise<boolean> z widoczności
    return this.page.locator('video').first().isVisible();
  }

  async startVideoCall() {
    await this.videoCallButton.click();
  }

  async acceptCall() {
    await this.incomingCallPopup.getByRole('button', { name: 'Answer' }).click();
  }

  async declineCall() {
    await this.incomingCallPopup.getByRole('button', { name: 'Decline' }).click();
  }

  async cancelCall() {
    // Zatrzymanie dzwonienia przez inicjatora
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}