import { test, expect } from '../fixtures/appFixtures';

test.describe('Autoryzacja i Profil', () => {

  // TC1: Pełny cykl autoryzacji
  test('TC1: Rejestracja, logowanie i wylogowanie z weryfikacją sesji', async ({ guest }, testInfo) => {
    const randomUser = `User_${testInfo.workerIndex}_${Date.now()}`;
    await test.step('Rejestracja i Logowanie', async () => {
      await guest.auth.gotoRegister();
      await guest.auth.register(randomUser, 'SilneHaslo123!');
      
      await expect(guest.auth.loginForm).toBeVisible();
      await guest.auth.login(randomUser, 'SilneHaslo123!');
      await expect(guest.layout.mainView).toBeVisible();
    });

    await test.step('Wylogowanie i blokada cofania', async () => {
      await guest.layout.logout();
      await expect(guest.auth.loginForm).toBeVisible();
      await guest.page.reload();
      await expect(guest.auth.loginForm).toBeVisible(); 
    });
  });

  // TC2: Aktualizacja profilu i zmiana awatara
  test('TC2: Wgranie nowego awatara profilu', async ({ userA }) => {
    // Zakładamy, że userA jest już zalogowany (np. przez global setup lub API)
    await userA.layout.gotoProfile();
    await userA.layout.uploadAvatar('e2e/test-data/new-avatar.jpg');
    
    await expect(userA.layout.profileAvatar).toHaveAttribute('src', /new-avatar/);
    await userA.page.reload();
    await expect(userA.layout.profileAvatar).toHaveAttribute('src', /new-avatar/); // Weryfikacja po odświeżeniu
  });
});

test.describe('Relacje i Prywatny Czat (P2P)', () => {

  // TC3: Nawiązywanie i zrywanie relacji
  test('TC3: Dodawanie i usuwanie znajomego przy pomocy kodu', async ({ userA, userB }) => {
    const friendCode = await userB.layout.getMyFriendCode(); // Pobieramy kod usera B

    await userA.layout.gotoFriends();
    await userA.layout.addFriend(friendCode);
    
    // Weryfikacja dodania
    await expect(userA.layout.friendListItem('UserB')).toBeVisible();
    
    // Usunięcie relacji
    await userA.layout.removeFriend('UserB');
    await expect(userA.layout.friendListItem('UserB')).not.toBeVisible();
  });

  // TC4: Wymiana wiadomości i plików
  test('TC4: Wysyłanie wiadomości tekstowych i załączników', async ({ userA, userB }) => {
    await userA.chat.openChatWith('UserB');
    await userB.chat.openChatWith('UserA'); // Obaj otwierają czat

    await userA.chat.sendMessage('Witaj, przesyłam plik');
    await expect(userB.chat.lastMessage).toHaveText('Witaj, przesyłam plik');

    await userA.chat.uploadFile('test-data/image.png');
    await expect(userB.chat.lastAttachment).toBeVisible(); // Websocket działa natychmiast
  });
});

test.describe('Zarządzanie Serwerami i Moderacja', () => {

  // TC5: Zakładanie serwera i struktury kanałów
  test('TC5: Tworzenie serwera i kanału tekstowego', async ({ userA }) => {
    await userA.server.createServer('Serwer Testowy', 'test-data/server-icon.png');
    await expect(userA.layout.serverIcon('Serwer Testowy')).toBeVisible();

    await userA.server.createChannel('ogólny');
    await expect(userA.server.channelLink('ogólny')).toBeVisible();
  });

  // TC6: Komunikacja na publicznym kanale serwera
  test('TC6: Broadcast wiadomości na serwerze', async ({ userA, userB }) => {
    await userA.server.openServer('Serwer Testowy');
    await userB.server.openServer('Serwer Testowy');

    await userA.server.sendMessage('Cześć wszystkim na serwerze!');
    await expect(userB.server.lastMessage).toHaveText('Cześć wszystkim na serwerze!');
  });

  // TC7: Opuszczenie serwera przez zwykłego członka
  test('TC7: Użytkownik opuszcza serwer', async ({ userB }) => {
    await userB.layout.leaveServer('Serwer Testowy');
    await expect(userB.layout.serverIcon('Serwer Testowy')).not.toBeVisible();
    
    // Próba wejścia z linku
    const response = await userB.page.goto('/server/IdSerweraTestowego');
    expect(response?.status()).toBe(403); // Brak uprawnień
  });

  // TC8: Moderacja społeczności – usunięcie członka
  test('TC8: Wyrzucenie użytkownika z serwera (Kick)', async ({ userA, userB }) => {
    // User A wyrzuca Usera B
    await userA.server.openServer('Serwer Testowy');
    await userA.server.kickUser('UserB');

    // User B traci widok serwera
    await expect(userB.layout.serverIcon('Serwer Testowy')).not.toBeVisible();
    await expect(userB.page).not.toHaveURL(/server/); // Został wykopany z widoku
  });

  // TC9: Całkowite usunięcie serwera przez Właściciela
  test('TC9: Usunięcie serwera powoduje zniknięcie go u wszystkich', async ({ userA, userB }) => {
    await userA.server.openServer('Serwer Testowy');
    await userA.server.deleteServer();

    await expect(userA.layout.serverIcon('Serwer Testowy')).not.toBeVisible();
    await expect(userB.layout.serverIcon('Serwer Testowy')).not.toBeVisible();
  });
});

test.describe('Połączenia Wideo i Komunikacja Czasu Rzeczywistego', () => {

  // TC10: Udane nawiązanie połączenia wideo
  test('TC10: Akceptacja połączenia wideo', async ({ userA, userB }) => {
    await userA.chat.openChatWith('UserB');
    await userA.chat.startVideoCall();

    await expect(userB.chat.incomingCallPopup).toBeVisible();
    await userB.chat.acceptCall();

    await expect(userA.chat.videoRoomIsConnected).toBeTruthy();
    await expect(userB.chat.videoRoomIsConnected).toBeTruthy();
  });

  // TC11: Anulowanie i odrzucenie połączenia wideo
  test('TC11: Przerwania dzwonienia (Decline & Cancel)', async ({ userA, userB }) => {
    await test.step('Inicjator anuluje', async () => {
      await userA.chat.startVideoCall();
      await userA.chat.cancelCall();
      await expect(userB.chat.incomingCallPopup).not.toBeVisible();
    });

    await test.step('Odbiorca odrzuca', async () => {
      await userA.chat.startVideoCall();
      await userB.chat.declineCall();
      await expect(userA.chat.callDeclinedNotification).toBeVisible(); // Użytkownik A dowiaduje się o odrzuceniu
    });
  });

  // TC12: Powiadomienia w czasie rzeczywistym i globalne WebSocket
  test('TC12: Globalne dymki powiadomień (Toast)', async ({ userA, userB }) => {
    await userA.layout.gotoHelpPage(); // User A ucieka na ekran bez czatu

    await userB.chat.openChatWith('UserA');
    await userB.chat.sendMessage('Sprawdź powiadomienie!');
    
    // Sprawdzamy, czy dymek pojawił się na innej podstronie
    await expect(userA.layout.toastNotification('Sprawdź powiadomienie!')).toBeVisible();

    await userB.chat.startVideoCall();
    await expect(userA.layout.toastNotification('Nadchodzące połączenie wideo')).toBeVisible();
  });
});