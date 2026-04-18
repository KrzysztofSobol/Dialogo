import { test, expect } from '@playwright/test';
import { AppLayout } from '../pages/AppLayout';
import { ServerPage } from '../pages/ServerPage';
import { ChatPage } from '../pages/ChatPage';
import { AuthPage } from '../pages/AuthPage';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../.auth/user.json');

test.use({ storageState: authFile });

test.describe('Zoptymalizowane Testy UI ze zbuforowanym uwierzytelnianiem - 12 Testów', () => {

  // Urszula Konopko
  test('1. Nawigacja główna - pomijanie ekranu logowania', async ({ page }) => {
    await page.goto('/');
    const layout = new AppLayout(page);
    await expect(layout.mainView).toBeVisible();
  });

  // Urszula Konopko
  test('2. Panel Serwerów jest przeglądalny startowo', async ({ page }) => {
    const serverPage = new ServerPage(page);
    await serverPage.gotoExploreServers();
    await expect(page).toHaveURL(/.*\/servers/);
  });

  // Urszula Konopko
  test('3. Ukryty panel prywatnych wiadomości (Chats)', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoFriends();
    await expect(page).toHaveURL(/.*\/friends/);
  });

  // Eryk Śliwowski
  test('4. Flow dodania serwera (Zalogowany użytkonik ma widoczny przycisk)', async ({ page }) => {
    const serverPage = new ServerPage(page);
    await serverPage.gotoMyServers();
    await expect(serverPage.createServerButton).toBeVisible();
  });

  // Eryk Śliwowski
  test('5. Wejście w profil zalogowanego uzytkownika', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoProfile();
    await expect(layout.profileAvatar).toBeVisible();
  });

  // Eryk Śliwowski
  test('6. Weryfikacja opcji wylogowania ze strony relacji (wymaga Auth)', async ({ page }) => {
    const layout = new AppLayout(page);
    await page.goto('/chats');
    await expect(layout.logoutButton).toBeVisible();
  });

  // Mateusz Izdebski
  test('7. Sprawdzenie formularza dodawania znajomego', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoFriends();
    const addInput = page.getByPlaceholder('Enter your friend code ...');
    await expect(addInput).toBeVisible();
  });

  // Mateusz Izdebski
  test('8. Weryfikacja formularza zakładania serwera', async ({ page }) => {
    const serverPage = new ServerPage(page);
    await page.goto('/my-servers');
    await serverPage.createServerButton.click();
    await expect(serverPage.serverNameInput).toBeVisible();
  });

  // Mateusz Izdebski
  test('9. Przycisk dodawania znajomego klikalny bez logowania tu i teraz', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoFriends();
    const btn = page.getByRole('button', { name: 'Add Friend' });
    await expect(btn).toBeVisible();
  });

  // Krzysztof Sobolewski
  test('10. Wejście na stronę pomocy ma włączone menu zalogowanego', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoHelpPage();
    await expect(layout.logoutButton).toBeVisible();
  });

  // Krzysztof Sobolewski
  test('11. Automatyczne załadowanie układu po przejściu w głąb struktury bez logowania', async ({ page }) => {
    const layout = new AppLayout(page);
    await layout.gotoProfile();
    // Sprawdzamy czy mimo bezpośredniego odnośnika aplikacja poprawnie wczytała DOM z profilowym layoutem
    await expect(layout.mainView).toBeVisible();
  });

  // Krzysztof Sobolewski
  test('12. Logout - unikalny test na samym końcu usuwający stan', async ({ page }) => {
    const layout = new AppLayout(page);

    await layout.gotoProfile();
    await layout.logout();
    // Skuteczne wylogowanie zniszczy sesję i usunie z DOMu przycisk wylogowania lub zmieni URL
    await expect(layout.logoutButton).not.toBeVisible();
  });

});
