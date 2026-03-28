import { test, expect } from '../fixtures/appFixtures';

test.describe('Autoryzacja i Profil', () => {

  // TC1: Pełny cykl autoryzacji
  test('TC1: Rejestracja, logowanie i wylogowanie z weryfikacją sesji', async ({ guest }, testInfo) => {
    const randomUser = `User_${testInfo.project.name}_${Date.now()}`;
    await test.step('Rejestracja i Logowanie', async () => {
      await guest.auth.gotoRegister();
      await guest.auth.register(randomUser, 'SilneHaslo123!');
      await expect(guest.page.getByRole('button', { name: /Log In/i })).toBeVisible({ timeout: 10000 });
      await guest.auth.login(randomUser, 'SilneHaslo123!');
      await expect(guest.layout.mainView).toBeVisible({ timeout: 15000 });
    });

    await test.step('Wylogowanie i blokada odświeżania', async () => {
      await guest.layout.logout();
      await guest.page.waitForLoadState('domcontentloaded');
      await expect(guest.auth.loginForm).toBeVisible();
      await guest.page.reload();
      await expect(guest.auth.loginForm).toBeVisible();
    });
  });

  // TC2: Aktualizacja profilu i zmiana awatara
  test('TC2: Wgranie nowego awatara profilu', async ({ userA }) => {
    await userA.layout.gotoProfile();
    const oldAvatarSrc = await userA.layout.avatarImage.getAttribute('src') ?? '';
    const reloadPromise = userA.page.waitForResponse(response =>
      response.url().includes('/api/users/get') && response.status() === 200
    );
    await userA.layout.uploadAvatar('e2e/test-data/new-avatar.jpg');
    await reloadPromise;
    await expect(userA.layout.avatarImage).toHaveAttribute('src', /\/avatars\/.*\.jpg/);
    const newAvatarSrc = await userA.layout.avatarImage.getAttribute('src') ?? '';
    expect(newAvatarSrc).not.toEqual(oldAvatarSrc);
  });
});

test.describe('Relacje i Prywatny Czat (P2P)', () => {

  // TC3: Nawiązywanie i zrywanie relacji
  test('TC3: Dodawanie i usuwanie znajomego przy pomocy kodu', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode();
    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    await expect(userA.layout.friendListItem('UserB')).toBeVisible();
    await userA.layout.removeFriend('UserB');
    await expect(userA.layout.friendListItem('UserB')).not.toBeVisible();
  });

  // TC4: Wymiana wiadomości i plików
  test('TC4: Wysyłanie wiadomości tekstowych i załączników', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode();
    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    const friendCard = userA.layout.friendListItem('UserB');
    await expect(friendCard).toBeVisible();
    await friendCard.locator('button').first().click();
    await userA.page.waitForURL('**/privateMessages/**');

    const uniqueMessage = `Wiadomość z plikiem ${Date.now()}`;
    await userA.chat.messageInput.fill(uniqueMessage);
    const fileChooserPromise = userA.page.waitForEvent('filechooser');
    await userA.chat.fileUploadButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('e2e/test-data/new-message.jpg');
    await userA.chat.messageInput.press('Enter');

    await expect(userA.page.getByText(uniqueMessage)).toBeVisible();
    await userB.page.goto('/chats');
    await userB.page.locator('.friend-card').filter({ hasText: 'UserA' }).click();
    await expect(userB.page.getByText(uniqueMessage)).toBeVisible();
  });
});

test.describe('Zarządzanie Serwerami i Moderacja', () => {

  // TC5: Zakładanie serwera i struktury kanałów
  test('TC5: Tworzenie serwera i kanału tekstowego', async ({ userA }, testInfo) => {
    const uniqueServerName = `Serwer_${testInfo.workerIndex}_${Date.now()}`;
    await userA.server.createServer(uniqueServerName);
    const serverCard = userA.layout.serverCard(uniqueServerName);
    await expect(serverCard).toBeVisible();
    await serverCard.click();
    await userA.page.waitForURL('**/server/**');

    await userA.server.createChannel('ogólny');
    await expect(userA.server.channelLink('ogólny')).toBeVisible();
  });

  // TC6: Komunikacja na publicznym kanale serwera
  test('TC6: Broadcast wiadomości na serwerze', async ({ userA, userB }, testInfo) => {
    const serverName = `MsgServer_${testInfo.workerIndex}_${Date.now()}`;

    await test.step('UserA tworzy serwer z kanałem', async () => {
      await userA.server.createServer(serverName);
      await userA.layout.serverCard(serverName).click();
      await userA.page.waitForURL('**/server/**');
      await userA.server.createChannel('czat');
      await userA.server.channelLink('czat').click();
    });

    await test.step('UserB dołącza do serwera', async () => {
      await userB.server.joinServer(serverName);
      await userB.server.channelLink('czat').click();
    });

    await test.step('UserA wysyła wiadomość i UserB ją widzi', async () => {
      await userA.server.sendMessage('Cześć wszystkim na serwerze!');
      await expect(userB.page.getByText('Cześć wszystkim na serwerze!')).toBeVisible({ timeout: 10000 });
    });
  });

  // TC7: Opuszczenie serwera przez zwykłego członka
  test('TC7: Użytkownik opuszcza serwer', async ({ userA, userB }, testInfo) => {
    const serverName = `LeaveServer_${testInfo.workerIndex}_${Date.now()}`;

    await test.step('UserA tworzy serwer, UserB dołącza', async () => {
      await userA.server.createServer(serverName);
      await userB.server.joinServer(serverName);
    });

    await test.step('UserB opuszcza serwer', async () => {
      await userB.server.leaveServer();
      await userB.page.waitForURL('**/my-servers');
      const isVisible = await userB.layout.isServerVisible(serverName);
      expect(isVisible).toBe(false);
    });
  });

  // TC8: Moderacja społeczności – usunięcie członka
  test('TC8: Wyrzucenie użytkownika z serwera (Kick)', async ({ userA, userB }, testInfo) => {
    const serverName = `KickServer_${testInfo.workerIndex}_${Date.now()}`;

    await test.step('UserA tworzy serwer, UserB dołącza', async () => {
      await userA.server.createServer(serverName);
      await userB.server.joinServer(serverName);
    });

    await test.step('UserA wyrzuca UserB', async () => {
      await userA.server.openServer(serverName);
      await userA.server.kickUser('UserB');
      await expect(userA.page.getByRole('listitem').filter({ hasText: 'UserB' })).not.toBeVisible();
    });

    await test.step('UserB nie widzi serwera', async () => {
      const isVisible = await userB.layout.isServerVisible(serverName);
      expect(isVisible).toBe(false);
    });
  });

  // TC9: Całkowite usunięcie serwera przez Właściciela
  test('TC9: Usunięcie serwera powoduje zniknięcie go u wszystkich', async ({ userA, userB }, testInfo) => {
    const serverName = `DeleteServer_${testInfo.workerIndex}_${Date.now()}`;

    await test.step('UserA tworzy serwer, UserB dołącza', async () => {
      await userA.server.createServer(serverName);
      await userB.server.joinServer(serverName);
    });

    await test.step('UserA usuwa serwer', async () => {
      await userA.server.openServer(serverName);
      await userA.server.deleteServer();
      await userA.page.waitForURL('**/my-servers');
    });

    await test.step('Serwer znika u obu użytkowników', async () => {
      const isVisibleA = await userA.layout.isServerVisible(serverName);
      expect(isVisibleA).toBe(false);
      const isVisibleB = await userB.layout.isServerVisible(serverName);
      expect(isVisibleB).toBe(false);
    });
  });
});

test.describe('Połączenia Wideo i Komunikacja Czasu Rzeczywistego', () => {

  // TC10: Udane nawiązanie połączenia wideo
  test('TC10: Akceptacja połączenia wideo', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode();
    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    await expect(userA.layout.friendListItem('UserB')).toBeVisible();
    await userA.layout.startVideoCall('UserB');
    await expect(userB.page.getByText('is calling you')).toBeVisible({ timeout: 15000 });
    await userB.chat.acceptCall();
    await expect(userA.page).toHaveURL(/videoChat/, { timeout: 10000 });
    await expect(userB.page).toHaveURL(/videoChat/, { timeout: 10000 });
  });

  // TC11: Anulowanie i odrzucenie połączenia wideo
  test('TC11: Przerwania dzwonienia (Decline & Cancel)', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode();
    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    await expect(userA.layout.friendListItem('UserB')).toBeVisible();

    await test.step('Inicjator anuluje', async () => {
      await userA.layout.startVideoCall('UserB');
      await userA.chat.cancelCall();
      await expect(userB.page.getByText('Call request ended')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Odbiorca odrzuca', async () => {
      await userA.layout.gotoFriends();
      await expect(userA.layout.friendListItem('UserB')).toBeVisible();
      await userA.layout.startVideoCall('UserB');
      await expect(userB.page.getByText('is calling you')).toBeVisible({ timeout: 15000 });
      await userB.chat.declineCall();
      // UserA gets a toast notification about the declined call
      await expect(userA.page.getByText('declined')).toBeVisible({ timeout: 10000 });
    });
  });

  // TC12: Powiadomienia w czasie rzeczywistym i globalne WebSocket
  test('TC12: Globalne dymki powiadomień (Toast)', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode();
    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    const friendCard = userA.layout.friendListItem('UserB');
    await expect(friendCard).toBeVisible();
    await friendCard.locator('button').first().click();
    await userA.page.waitForURL('**/privateMessages/**');
    await userA.layout.gotoHelpPage();
    await userA.page.evaluate(() => {
      (window as any).__playedAudio = [];
      const origPlay = HTMLMediaElement.prototype.play;
      (HTMLMediaElement.prototype as any).play = function () {
        try {
          (window as any).__playedAudio.push(this.currentSrc || (this as any).src || 'audio');
        } catch (e) { }
        return Promise.resolve();
      };
      (window as any).getPlayedAudioCount = () => (window as any).__playedAudio.length;
      (window as any).__restorePlay = () => { (HTMLMediaElement.prototype as any).play = origPlay; };
    });

    await userB.chat.openChatWith('UserA');
    await userB.chat.sendMessage('Sprawdź powiadomienie!');
    await expect(userA.layout.toastNotification('Sprawdź powiadomienie!')).toBeVisible({ timeout: 10000 });
    await new Promise((res) => setTimeout(res, 1000));
    await userB.layout.gotoFriends();
    await userB.layout.startVideoCall('UserA');
    await expect(userA.page.getByText('is calling you')).toBeVisible({ timeout: 15000 });
    const playedCount = await userA.page.evaluate(() => (window as any).getPlayedAudioCount());
    expect(playedCount).toBeGreaterThanOrEqual(1);
  });
});