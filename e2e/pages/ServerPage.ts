import type { Page, Locator } from '@playwright/test';

export class ServerPage {
  readonly page: Page;

  readonly createServerButton: Locator;
  readonly serverNameInput: Locator;
  readonly submitServerButton: Locator;

  readonly addChannelButton: Locator;
  readonly channelNameInput: Locator;
  readonly submitChannelButton: Locator;

  readonly messageInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createServerButton = page.getByRole('button', { name: /Create a server/i });
    this.serverNameInput = page.getByPlaceholder('Enter server name');
    this.submitServerButton = page.locator('.action-buttons button').nth(1);

    this.addChannelButton = page.getByRole('button', { name: 'Add channel' });
    this.channelNameInput = page.getByPlaceholder('Name');
    this.submitChannelButton = page.locator('.new-channel-form button.action-button').last();

    this.messageInput = page.getByPlaceholder('Enter your message content');
  }

  // --- NAVIGATION ---

  async gotoMyServers() {
    await this.page.goto('/my-servers', { waitUntil: 'domcontentloaded' });
  }

  async gotoExploreServers() {
    await this.page.goto('/servers', { waitUntil: 'domcontentloaded' });
  }

  async openServer(serverName: string) {
    await this.gotoMyServers();
    await this.page.locator('.server-card').filter({ hasText: serverName }).click();
    await this.page.waitForURL('**/server/**');
  }

  channelLink(channelName: string) {
    return this.page.getByRole('listitem').filter({ hasText: channelName });
  }

  // --- SERVER MANAGEMENT ---

  async createServer(name: string) {
    await this.gotoMyServers();
    await this.createServerButton.click();
    await this.serverNameInput.fill(name);
    await this.submitServerButton.click();
    await this.page.locator('.server-card').filter({ hasText: name }).waitFor();
  }

  async createChannel(channelName: string) {
    await this.addChannelButton.click();
    await this.channelNameInput.fill(channelName);
    await this.submitChannelButton.click();
  }

  async deleteServer() {
    await this.page.locator('.header-buttons button').first().click();
    await this.page.getByRole('button', { name: 'Delete Server' }).click();
  }

  // --- MESSAGING ---

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.messageInput.press('Enter');
  }

  get lastMessage() {
    return this.page.locator('.card').last();
  }

  // --- MODERATION ---

  async kickUser(username: string) {
    const userListItem = this.page.getByRole('listitem').filter({ hasText: username });
    await userListItem.locator('button').click();
    await this.page.getByRole('button', { name: 'Remove User' }).click();
  }

  async leaveServer() {
    await this.page.locator('.header-buttons button').nth(0).click();
    await this.page.getByRole('button', { name: 'Leave Server' }).click();
  }

  async joinServer(serverName: string) {
    await this.gotoExploreServers();
    await this.page.locator('.server-card').filter({ hasText: serverName })
      .getByRole('button', { name: 'Join' }).click();
  }
}