# Test Plan – Dialogo

## 1. Wprowadzenie

Dokument opisuje plan testów dla projektu Dialogo.  
Celem testów jest weryfikacja poprawności działania aplikacji, identyfikacja błędów oraz zapewnienie, że funkcjonalności systemu działają zgodnie z wymaganiami.

Projekt Dialogo jest aplikacją udostępnianą w repozytorium GitHub, będącą komunikatorem z możliwością tworzenia serwerów i kontaktowania się z innymi użytkownikami porzez komunikacje pisemną oraz głosową.

Testy obejmują zarówno weryfikację funkcjonalności interfejsu użytkownika, jak i poprawność działania logiki aplikacji.

---

## 2. Cele testów

Główne cele testów:

- Sprawdzenie poprawności działania funkcji komunikacji
- Weryfikacja poprawności funkcji zarządzania serwerem
- Obsługa tworzenia i dostępu do kont
- Weryfikacja pod kątem bezpieczeństwa danych
- sprawdzenie poprawnego ograniczania działań do przypisanej roli
- Sprawdzenie poprawnego działania w różnych przeglądarkach
- Poprawna obsługa wyświetlania elementów

---

## 3. Zakres testów

### In Scope

Testowane będą następujące funkcjonalności:

- Testy bacendowe jednostkowe i integracyjne
- Testy frontendowe E2E automatyzujące
- Testy wydajnościowe
- Testowanie luk bezpieczeństwa
- Zarządzanie wiadomościami
- Komunikacja video/audio
- Zarządznie kontem
- Zarządzenie serwerem
- Wyszukiwanie użytkowników i serwerów
- Dołączenie i opuszczanie do serwerów
- Logowanie i rejestracja

### Out of Scope

Poza zakresem testów:

- Testy na urządzeniu mobilnym
- Testy obciążeniowe bazy danych
- Testy akceptacyjne i regresyjne

---

## 4. Strategia i typy testów

W projekcie zastosowane zostaną następujące typy testów:

### Testy manualne (funkcjonalne i niefunkcjonalne)
Ręczne testowanie działania i poprawności interfejsu użytkownika aplikacji w przeglądarce.

### Testy automatyczne
Automatyzacja testów E2E sprawdzająca poprawność działania aplikacji.

### Testy backendowe (jednostkowe i integracyjne)
Testowanie aplikacji po stronie backendowej, sprawdzające działanie pojedynczych elementów i integracji między nimi.

### Testy wydajnościowe
Testy zapewniające optymalne działanie aplikacji, niezależnie od ilości zasobów wykorzystywanych podczas korzystania z niej.

### Testy kompatybilności
Sprawdzenie działania aplikacji w różnych przeglądarkach:
- Chrome
- Firefox

---

## 5. Środowisko testowe

Testy będą przeprowadzane w następującym środowisku:

System operacyjny:
- Windows 11

Przeglądarki:
- Google Chrome
- Mozilla Firefox

Technologie:
- JavaScript
- HTML
- DOM API

---

## 6. Harmonogram testów

| Etap | Opis | Czas trwania |
|-----|-----|-----|
| Zaplanowanie testów | Przygotowanie plan testu | 1 dzień |
| Przygotowanie scenariuszy testowych | Utworzenie przypadków testowych | 1 dzień |
| Wykonanie testów | Realizacja zaplanowych testów | 5 dni |
| Raport testów | Podsumowanie wyników | 1 dzień |

---

## 7. Kryteria wejścia / wyjścia

### Entry Criteria

Testy mogą się rozpocząć gdy:

- kod projektu jest dostępny w repozytorium
- aplikacja uruchamia się w przeglądarce
- środowisko testowe jest przygotowane

### Exit Criteria

Testy mogą zostać zakończone gdy:

- wszystkie zaplanowane testy zostały wykonane
- wszystkie krytyczne błędy nie wystąpują
- raport z testów został przygotowany

---

## 8. Ryzyka

Potencjalne ryzyka projektu:

- brak pełnej dokumentacji projektu
- brak dogłębnej wiedzy o projekcie
- różnice w działaniu między przeglądarkami
- brak wiedzy o narzędziach testerskich

---

## 9. Role i odpowiedzialności

| Osoba | Odpowiedzialność |
|-----|-----|
| QA Lead (Urszula Konopko) | przygotowanie planu testów i wykonanie testów automatycznych |
| QA Engineer (Eryk Śliwowski) | testy wydajnościowe oraz testy manualne na podstawie rozpisanych scenariuszy testowych |
| QA Engineer (Mateusz Izdebski) | testy integracyjne oraz testy manualne na podstawie rozpisanych scenariuszy testowych |
| QA Engineer (Krzysztof Sobolewski) | testy jednostkowe oraz testy manualne na podstawie rozpisanych scenariuszy testowych |
