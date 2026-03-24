import type { Page, Locator } from '@playwright/test';

export class ServerPage {
  readonly page: Page;
  
  // Selektory dla tworzenia serwera
  readonly addServerButton: Locator;
  readonly serverNameInput: Locator;
  readonly serverIconInput: Locator;
  readonly submitServerButton: Locator;
  
  // Selektory dla tworzenia kanałów
  readonly addChannelButton: Locator;
  readonly channelNameInput: Locator;
  readonly submitChannelButton: Locator;

  // Selektory dla czatu serwerowego
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  // Selektory dla ustawień i administracji
  readonly serverSettingsButton: Locator;
  readonly deleteServerButton: Locator;
  readonly confirmModalButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Tworzenie serwera (na podstawie my-servers.vue)
    this.addServerButton = page.getByRole('button', { name: /Utwórz|Create/ }); 
    this.serverNameInput = page.getByPlaceholder('Nazwa serwera'); 
    this.serverIconInput = page.locator('input[type="file"]'); // Input do wgrywania ikony serwera
    this.submitServerButton = page.getByRole('button', { name: /Zapisz|Save/ });

    // Tworzenie kanału
    this.addChannelButton = page.locator('button[aria-label*="channel"]'); // Klasa przycisku dodawania kanału
    this.channelNameInput = page.getByPlaceholder('Wprowadź nazwę kanału');
    this.submitChannelButton = page.getByRole('button', { name: 'Dodaj' });

    // Czat serwerowy (korzysta z messageForm.vue)
    this.messageInput = page.locator('textarea[placeholder="Enter your message content"]');
    this.sendButton = page.getByRole('button', { name: /Wyślij|Send/ });

    // Ustawienia
    this.serverSettingsButton = page.locator('button[aria-label*="settings"]');
    this.deleteServerButton = page.getByText('Usuń serwer');
    this.confirmModalButton = page.getByRole('button', { name: 'Potwierdź' });
  }

  // --- METODY NAWIGACYJNE ---

  async openServer(serverName: string) {
    // Kliknięcie w ikonę/link serwera na pasku nawigacyjnym
    await this.page.getByRole('link', { name: serverName }).click();
  }

  channelLink(channelName: string) {
    // Zwraca konkretny link do kanału z listy po lewej stronie
    return this.page.getByRole('link', { name: channelName });
  }

  // --- METODY DO ZARZĄDZANIA SERWEREM ---

  async createServer(name: string, iconPath?: string) {
    await this.page.goto('/my-servers');
    await this.addServerButton.click();
    await this.serverNameInput.fill(name);
    
    if (iconPath) {
      await this.serverIconInput.setInputFiles(iconPath);
    }
    
    await this.submitServerButton.click();
    // Oczekiwanie aż zniknie formularz lub pojawi się potwierdzenie
  }

  async createChannel(channelName: string) {
    await this.addChannelButton.click();
    await this.channelNameInput.fill(channelName);
    await this.submitChannelButton.click();
  }

  async deleteServer() {
    await this.serverSettingsButton.click();
    await this.deleteServerButton.click();
    await this.confirmModalButton.click();
  }

  // --- METODY DO KOMUNIKACJI ---

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  get lastMessage() {
    // Zwraca ostatnią wiadomość z messagesFeed.vue
    return this.page.locator('.card').last(); 
  }

  // --- METODY MODERACYJNE ---

  async kickUser(username: string) {
    // 1. Znajdujemy użytkownika na liście członków serwera
    const userElement = this.page.locator('button').filter({ hasText: username }).first();
    
    // 2. Klikamy prawym przyciskiem myszy, aby wywołać menu kontekstowe
    await userElement.click({ button: 'right' }); 
    
    // 3. Wybieramy opcję Wyrzuć
    await this.page.getByText('Wyrzuć').click(); 
    
    // 4. Jeśli wyskakuje modal potwierdzający, klikamy go
    if (await this.confirmModalButton.isVisible()) {
      await this.confirmModalButton.click();
    }
  }
}