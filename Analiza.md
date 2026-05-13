# Dekonstrukcja własnego systemu – Modelowanie Strategiczne DDD i Model C4
**Projekt:** Dialogo  
**Cel zajęć:** Krytyczna ocena własnego projektu pod kątem długu technologicznego, identyfikacja antywzorca "Big Ball of Mud" oraz podział domeny biznesowej na wyizolowane logicznie granice.

---

## 1.1 Diagnoza Antywzorca "Big Ball of Mud"

Przeprowadzona diagnostyka potwierdza obecność poniższych błędów charakteryzyhjących "Big Ball of Mud".

1. **Brak wyraźnych granic modułowych:** Modele, widoki i endpointy API nie mają separacji domenowej.
2. **Monolityczne "God Objects":** Plik `websocket.ts` jest centralnym handlerem obsługującym 6 różnych funkcji z 3 różnych domen w jednym miejscu. Layout `default.vue` zarządza logiką rozmów wideo, autentykacją, dźwiękami i routingiem.
3. **Duplikacja logiki:** `fetchUser()` skopiowane do 4 osobnych komponentów.
4. **Brak mechanizmu transakcji:** Przeglądarka tworzy serwer w trzech niezależnych krokach jeden po drugim. Jeśli w trakcie zerwie się połączenie, proces się zatrzyma i w bazie powstaną śmieciowe dane.
5. **Mieszanie ról frontendu i backendu:** Frontend generuje UUID dla tworzonych serwerów i ID dla wiadomości tekstowych.
6. **Brak enkapsulacji:** Katalog `db/users.json` przechowuje hasła w formie czystego tekstu.
7. **Magiczne wartości:** Hardkodowane stringi determinują zachowanie (np. `channelId.startsWith("chat")`).
8. **Duplikacja interfejsów modeli:** Plik `server/api/servers/[serverId]/delete.ts` redefiniuje lokalne interfejsy `Channel` i `Server` zamiast importować je z `~/models/`. Modele istnieją w katalogu `models/`, ale nie są współdzielone.
9. **Niespójne wzorce obsługi błędów:** Część endpointów zwraca `{ statusCode: 500, message: ... }` jako zwykły JSON (np. `servers/get.ts`), a inna część rzuca `createError()` z H3. Frontend nie może spójnie obsługiwać odpowiedzi błędnych.
10. **Nieużywane importy:** Pliki `video/call.ts`, `video/response.ts`, `video/cancel.ts` importują `fs from 'fs/promises'`, ale nigdy z niego nie korzystają.
11. **Wycieki stanu sesji:** Endpoint `GET /api/users/get` zwraca pełen obiekt `User` włącznie z polem `password`. Strona `profile.vue` wyświetla hasło użytkownika na ekranie.
12. **Duplikacja logiki CSS:** Klasy `.avatar`, `.content-wrapper`, `.call-description`, `.user-name` są identycznie zdefiniowane w `friendsList.vue` i `default.vue`. Klasy `.header-content`, `.server-info`, `.server-title`, `.delete-button` są zduplikowane w pliku `my-servers.vue` (powtórzone dwukrotnie w tym samym pliku `<style>`).
13. **Generowanie ID po stronie klienta:** Frontend generuje krytyczne identyfikatory: `crypto.randomUUID()` dla serwerów w `my-servers.vue`, `Math.random().toString(36).slice(2, 12)` dla wiadomości w `messageForm.vue`, oraz identyczną metodę dla ID użytkowników w `auth/register.ts`.
14. **Brak walidacji danych wejściowych:** Żaden endpoint API nie waliduje typów, długości ani formatu danych wejściowych. Np. `register.ts` nie sprawdza minimalnej długości hasła, `channels/add.ts` nie weryfikuje czy `serverId` istnieje w bazie, `messages/add.ts` nie sanitizuje treści wiadomości.
16. **Martwy Kod:** Plik `axiosInstance.js` konfiguruje instancję Axios z `baseURL: 'http://localhost:1981/'`, ale nigdzie nie jest importowany – cały projekt używa wbudowanego `$fetch` z Nuxt. W `chats.vue` wykonywane jest zapytanie `await $fetch(/api/friends/${user.value?.id})`, którego wynik jest przypisany do `res`, ale nigdzie nie jest użyty.
17. **Ręczna implementacja blokady współbieżności:** Plik `friends/remove.ts` implementuje własny mechanizm blokady współbieżności `let dbLock = Promise.resolve()` z łańcuchem `Promise`. Jest to kruche i nie działa w środowisku wieloprocesowym.
18. **Brak autoryzacji na poziomie endpointów:** Większość endpointów nie weryfikuje sesji użytkownika. Np. `servers/add.ts`, `channels/add.ts`, `friends/add.ts`, `messages/add.ts` – każdy przyjmuje `userId` z body requestu bez weryfikacji, czy zgadza się z zalogowanym użytkownikiem.
19. **Niespójna konwencja nazewnicza w API:** Parametry WebSocket używają `CallerId` (PascalCase) i `CalleeID` (niespójne). Endpoint `video/call.ts` oczekuje `callerId` (camelCase), ale WebSocket w `websocket.ts` szuka `CallerId`. Nazwy plików endpointów mieszają konwencje: `assignUser.ts`, `kickUser.ts` (camelCase) vs `[userId].delete.ts` (kebab w parametrze).

### 1.2 Przypadek 1 – Złożoność zależności i łamanie SRP
Przykład krytycznego endpointu: `POST /api/messages/add` (`server/api/messages/add.ts`). Implementacja jednocześnie: 
- Rozpoznaje logikę domenową po parsowaniu stringów (`channelId.startsWith("chat")`).
- Wczytuje i parsuje bezpośrednio 3 różne pliki JSON z dysku (`channels.json`, `servers.json`, `serverUsers/users_*.json`).
- Realizuje autoryzację.
- Bezpośrednio woła funkcje WebSocket do rozgłaszania wiadomości i powiadomień.

### 1.2 Przypadek 2 – Tworzenie serwera jako nieatamoowa orkiestracja frontendowa
Plik `pages/my-servers.vue`, funkcja `submitNewServer()`. Proces tworzenia serwera wymaga trzech niezależnych żądań HTTP wysyłanych sekwencyjnie z frontendu:
1. `POST /api/servers/add` – utworzenie serwera
2. `POST /api/servers/assignUser` – przypisanie użytkownika do serwera  
3. `POST /api/users/assignServer` – przypisanie serwera do użytkownika

Kroki 2 i 3 wykonywane są w bloku `finally`, co oznacza, że zostaną wykonane nawet jeśli krok 1 się nie powiedzie. Jeśli połączenie zerwie się po kroku 1, serwer istnieje w bazie, ale nikt nie ma do niego dostępu. Identyczna logika powtarza się w `pages/servers.vue` (`joinServer()`) dwa osobne requesty do `assignUser` i `assignServer` bez gwarancji atomowości. Backend powinien orkiestrować te operacje w jednym endpointcie.

### 1.2 Przypadek 3 – Usunięcie serwera jako „ręczna kaskada"
Plik `server/api/servers/[serverId]/delete.ts` demonstruje brak warstwy abstrakcji nad bazą danych. Jeden endpoint realizuje ręcznie 6 operacji kaskadowego usunięcia:
1. Wczytaj `channels.json`, znajdź kanały serwera.
2. Usuń pliki z wiadomościami kanałów (`db/messages/channel_*.json`).
3. Nadpisz `channels.json` bez kanałów serwera.
4. Wczytaj `servers.json`, odfiltruj serwer, nadpisz.
5. Usuń plik użytkowników serwera (`db/serverUsers/users_*.json`).
6. Przeskanuj katalog `db/userServers/`, iteruj po **wszystkich** plikach użytkowników, usuń z każdego referencję do serwera.

Krok 6 to operacja O(n) po wszystkich użytkownikach systemu. Brak transakcyjności – jeśli krok 4 się uda, ale krok 6 się nie powiedzie, powstaną osierocone referencje. Dodatkowo endpoint redefiniuje interfejsy `Channel` i `Server` lokalnie zamiast użyć istniejących modeli z `~/models/`.

### 1.2 Przypadek 4 – Wycieki bezpieczeństwa w modelu User
Model `userModel.ts` definiuje interfejs `User` z polem `password`. Endpoint `GET /api/users/get` (`server/api/users/get.ts`, linia 24) zwraca cały obiekt: `return { statusCode: 200, user }`. Strona `pages/profile.vue` (linia 23) renderuje hasło: `<strong>Password:</strong> {{ user.password }}`. System nie posiada żadnego mechanizmu DTO/projekcji – ten sam model jest używany do zapisu w bazie, transferu przez API i prezentacji w UI. Istnieje osobny interfejs `UserBasics` (bez hasła), ale nie jest wykorzystywany spójnie.

---

## 1.3 Analiza i Priorytetyzacja Długu Technologicznego

| Kategoria | Odkryty problem | Impact | Effort | Priorytet |
|---|---|---|---|---|
| **Bezpieczeństwo** | Hasła w plaintext w bazie (`users.json`). Model API wycieka z polem `password`. Strona profilu wyświetla hasło. | Krytyczny | Średni | **P0** |
| **Bezpieczeństwo** | Brak autoryzacji sesji na endpointach – `userId` przyjmowany z body bez weryfikacji cookie. | Krytyczny | Średni | **P0** |
| **Bezpieczeństwo** | Brak walidacji danych wejściowych – żaden endpoint nie sprawdza typów, długości ani formatu. | Wysoki | Średni | **P0** |
| **Architektura** | Brak warstwy DAO/Repository nad plikami JSON. Każdy endpoint bezpośrednio operuje na `fs.readFile`/`fs.writeFile`. | Wysoki | Wysoki | **P1** |
| **Architektura** | `websocket.ts` łamie SRP – powiadomienia, chat i sygnalizacja Video w jednym pliku (192 linie, 6 eksportów). | Wysoki | Średni | **P1** |
| **Architektura** | Brak atomowości operacji – tworzenie serwera, dołączanie, usuwanie wymagają wielu nieskoordynowanych requestów. | Wysoki | Średni | **P1** |
| **Projektowanie** | Brak granic domenowych (Bounded Contexts) w strukturze katalogów i modelach. | Wysoki | Średni | **P1** |
| **Projektowanie** | Duplikacja logiki relacji wiele-do-wielu (user↔server, user↔friend) w wielu rozdzielonych endpointach. | Wysoki | Średni | **P1** |
| **Projektowanie** | Lokalna redefinicja modeli zamiast importu z `~/models/` (np. `delete.ts` definiuje `Channel` i `Server` lokalnie). | Średni | Niski | **P2** |
| **Sprzężenie** | `default.vue` (335 linii) z logiką wideorozmów, dźwiękami i sygnałami nawigacji. | Średni | Średni | **P2** |
| **Sprzężenie** | `friendsList.vue` (330 linii) łączy listę znajomych, inicjowanie rozmów wideo i dzwonki w jednym komponencie. | Średni | Średni | **P2** |
| **Jakość kodu** | Duplikacja `fetchUser()` w 6+ komponentach; brak composables Vue do współdzielenia logiki. | Średni | Niski | **P2** |
| **Jakość kodu** | Duplikacja CSS (`.avatar`, `.content-wrapper`, itp.) między komponentami; podwójne definicje w jednym pliku. | Niski | Niski | **P3** |
| **Jakość kodu** | Martwy kod: `axiosInstance.js` (nigdzie nie importowany), nieużywane zmienne, nieużywane importy `fs`. | Niski | Niski | **P3** |
| **Konwencje** | Magiczne stringi, niespójna konwencja nazewnicza (`CallerId` vs `caleeId` vs `CalleeID`). | Niski | Niski | **P3** |
| **Konwencje** | Trzy różne metody generowania ID (`crypto.randomUUID()`, `Math.random().toString(36)`, brak spójnej strategii). | Niski | Niski | **P3** |

---

## 1.4 Werdykt z Analizy własnego przypadku

Projekt Dialogo w obecnej formie stanowi przykład silnie zdegradowanej architektury zdefiniowanej jako antywzorzec **"Big Ball of Mud"**.

W projekcie brakowało projektowania architektury oraz dodawanie nowych funkcjonalności odbywało się z pominieciem zasad SOLID. Z analizy kodu wynika jakoby projekt miałby być conajwyżej wstępną prezentacją dla klienta przed faktycznym podjęciem działań projektowych 

## 2 Identyfikacja Subdomen
## 3 Projektowanie granic semantycznych
## 4 Wizualizacja Architektury (C4)
## 5 Podsumowanie