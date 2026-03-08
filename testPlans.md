# Test Plan – Dialogo

## 1. Wprowadzenie

Dokument opisuje plan testów dla projektu Dialogo.  
Celem testów jest weryfikacja poprawności działania aplikacji, identyfikacja błędów oraz zapewnienie, że funkcjonalności systemu działają zgodnie z wymaganiami.

Projekt Dialogo jest aplikacją udostępnianą w repozytorium GitHub, służącą do obsługi dialogów/modali w aplikacji webowej przy użyciu JavaScript.

Testy obejmują zarówno weryfikację funkcjonalności interfejsu użytkownika, jak i poprawność działania logiki aplikacji.

---

## 2. Cele testów

Główne cele testów:

- sprawdzenie poprawności działania komponentu dialogowego
- weryfikacja poprawnego wyświetlania i ukrywania okna dialogowego
- identyfikacja błędów w logice JavaScript
- weryfikacja poprawnej integracji z elementami DOM
- zapewnienie poprawnego działania w różnych przeglądarkach

---

## 3. Zakres testów

### In Scope

Testowane będą następujące funkcjonalności:

- wyświetlanie okna dialogowego po kliknięciu przycisku
- zamykanie okna dialogowego
- poprawne manipulowanie stylem elementu overlay
- reakcja aplikacji na zdarzenia użytkownika (click)

### Out of Scope

Poza zakresem testów:

- testy wydajnościowe
- testy bezpieczeństwa
- integracje z systemami zewnętrznymi
- testy backendowe (projekt opiera się głównie na logice frontendowej)

---

## 4. Strategia i typy testów

W projekcie zastosowane zostaną następujące typy testów:

### Testy funkcjonalne
Sprawdzenie czy funkcjonalności aplikacji działają zgodnie z wymaganiami.

### Testy UI
Weryfikacja poprawności działania interfejsu użytkownika:
- wyświetlanie dialogu
- zamykanie dialogu
- poprawna widoczność elementów

### Testy manualne
Ręczne testowanie działania aplikacji w przeglądarce.

### Testy regresji
Sprawdzenie czy nowe zmiany w kodzie nie powodują regresji w istniejącej funkcjonalności.

### Testy kompatybilności
Sprawdzenie działania aplikacji w różnych przeglądarkach:
- Chrome
- Firefox
- Edge

---

## 5. Środowisko testowe

Testy będą przeprowadzane w następującym środowisku:

System operacyjny:
- Windows 10 / 11
- macOS

Przeglądarki:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge

Technologie:
- JavaScript
- HTML
- DOM API

---

## 6. Harmonogram testów

| Etap | Opis | Czas trwania |
|-----|-----|-----|
| Analiza projektu | Przegląd repozytorium i funkcjonalności | 1 dzień |
| Przygotowanie scenariuszy testowych | Utworzenie przypadków testowych | 1 dzień |
| Wykonanie testów | Testy manualne funkcjonalności | 2 dni |
| Retesty | Weryfikacja poprawek błędów | 1 dzień |
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
- wszystkie krytyczne błędy zostały naprawione
- raport z testów został przygotowany

---

## 8. Ryzyka

Potencjalne ryzyka projektu:

- brak pełnej dokumentacji projektu
- błędy w obsłudze zdarzeń JavaScript
- różnice w działaniu między przeglądarkami
- brak automatycznych testów

---

## 9. Role i odpowiedzialności

| Rola | Odpowiedzialność |
|-----|-----|
| QA Engineer | przygotowanie planu testów i wykonanie testów |
| Developer | implementacja funkcjonalności i naprawa błędów |
| Reviewer | przegląd kodu oraz wyników testów |
