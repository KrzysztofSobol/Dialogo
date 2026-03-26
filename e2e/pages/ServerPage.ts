import type { Page, Locator } from '@playwright/test';

export class ServerPage {
  readonly page: Page;

  // Create server (my-servers.vue)
  readonly createServerButton: Locator;
  readonly serverNameInput: Locator;
  readonly submitServerButton: Locator;

  // Create channel (server/[serverId]/index.vue)
  readonly addChannelButton: Locator;
  readonly channelNameInput: Locator;
  readonly submitChannelButton: Locator;

  // Server chat (uses messageForm.vue)
  readonly messageInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // my-servers.vue: "Create a server" button
    this.createServerButton = page.getByRole('button', { name: /Create a server/i });
    // my-servers.vue: server name input inside the add-server card
    this.serverNameInput = page.getByPlaceholder('Enter server name');
    // my-servers.vue: check-icon button to confirm creation (second button in .action-buttons)
    this.submitServerButton = page.locator('.action-buttons button').nth(1);

    // server/[serverId]/index.vue: "Add channel" button
    this.addChannelButton = page.getByRole('button', { name: 'Add channel' });
    // Channel name input
    this.channelNameInput = page.getByPlaceholder('Name');
    // Check-icon button to confirm channel creation (third button in .new-channel-form)
    this.submitChannelButton = page.locator('.new-channel-form button.action-button').last();

    // Chat on server uses messageForm.vue with UTextarea
    this.messageInput = page.getByPlaceholder('Enter your message content');
  }

  // --- NAVIGATION ---

  async gotoMyServers() {
    await this.page.goto('/my-servers', { waitUntil: 'domcontentloaded' });
  }

  async gotoExploreServers() {
    await this.page.goto('/servers', { waitUntil: 'domcontentloaded' });
  }

  // Open a server by navigating to my-servers and clicking the server card
  async openServer(serverName: string) {
    await this.gotoMyServers();
    // Wait for server list to load, then click the card with the server name
    await this.page.locator('.server-card').filter({ hasText: serverName }).click();
    await this.page.waitForURL('**/server/**');
  }

  // Find a channel link in the server sidebar
  channelLink(channelName: string) {
    return this.page.getByRole('listitem').filter({ hasText: channelName });
  }

  // --- SERVER MANAGEMENT ---

  async createServer(name: string) {
    await this.gotoMyServers();
    await this.createServerButton.click();
    await this.serverNameInput.fill(name);
    await this.submitServerButton.click();
    // Wait for the server to appear in the list
    await this.page.locator('.server-card').filter({ hasText: name }).waitFor();
  }

  async createChannel(channelName: string) {
    await this.addChannelButton.click();
    await this.channelNameInput.fill(channelName);
    await this.submitChannelButton.click();
  }

  // Delete server via trash icon in server header → confirm in ScreenPopUp modal
  async deleteServer() {
    // Click the trash icon button in the server header (inside .header-buttons)
    await this.page.locator('.header-buttons button').first().click();
    // Confirm in the "Delete Server" modal
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

  // Kick/remove a user via the trash icon next to their name in the users sidebar
  async kickUser(username: string) {
    // Find the user's list item in the users sidebar and click the trash button
    const userListItem = this.page.getByRole('listitem').filter({ hasText: username });
    await userListItem.locator('button').click();
    // Confirm in the "Remove User" ScreenPopUp modal
    await this.page.getByRole('button', { name: 'Remove User' }).click();
  }

  // Leave the current server via the leave icon → confirm in ScreenPopUp modal
  async leaveServer() {
    // Click the leave icon button (arrow-right-on-rectangle) in server header
    await this.page.locator('.header-buttons button').nth(0).click();
    // Confirm in the "Leave Server" modal
    await this.page.getByRole('button', { name: 'Leave Server' }).click();
  }

  // Join a server from the Explore Servers page
  async joinServer(serverName: string) {
    await this.gotoExploreServers();
    await this.page.locator('.server-card').filter({ hasText: serverName })
      .getByRole('button', { name: 'Join' }).click();
  }
}