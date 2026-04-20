# Sistem de Management Restaurant

Acest proiect este un sistem de management complet pentru un restaurant. Acesta facilitează fluxul operațional integral: de la vizualizarea meniului de către clienți și preluarea/prepararea comenzilor de către personal, până la procesarea plății de către chelneri și administrarea sistemului de către manager.

## Tehnologii Folosite
* **Backend:** Java, Spring Boot, Spring Data JPA, REST API
* **Bază de Date:** MySQL
* **Frontend:** HTML, CSS, JavaScript

## Structura Entităților
Sistemul implementează diagrama de clase:
* **Roluri:** Client, Manager, Personal, Chelner (moștenind abstractizarea `Utilizator`).
* **Meniu:** Entitatea `Produs` integrând informații specifice (`DetaliiProdus`).
* **Procesare:** `CosCumparaturi`, `Comanda`, `Plata`, `Chitanta`.

## Instrucțiuni de Configurare (Setup)

### 1. Configurare Bază de Date (folosind DBngin)
Recomandăm utilizarea **DBngin** pentru o configurare ușoară:
1. Descărcați și instalați aplicația de pe [dbngin.com](https://dbngin.com/).
2. Deschideți DBngin, apăsați pe butonul `+` (New Server) și selectați **MySQL**.
3. Denumiți serverul (ex. `restaurant_db`), păstrați portul implicit (`3306`) și apăsați **Create**.
4. Apăsați butonul **Start** în dreptul serverului nou creat.
5. Utilizați un client de baze de date (ex. *TablePlus*, *DBeaver* sau tab-ul *Database* din IntelliJ) și conectați-vă la `localhost:3306`.
   * **Utilizator:** `root`
   * **Parolă:** *(lăsați gol)*
6. Rulați următorul query pentru a crea baza de date:
```sql
CREATE DATABASE restaurant_db;
```

### 2. Configurare Backend (Spring Boot)
1. Deschideți proiectul în **IntelliJ IDEA**.
2. Navigați la fișierul `src/main/resources/application.properties`.
3. Actualizați datele de conectare. Dacă folosiți setările standard DBngin, configurația ar trebui să arate astfel:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/restaurant_db?serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   ```
4. Rulați aplicația din clasa principală `RestaurantApplication.java`. Tabelele se vor genera automat în baza de date la prima pornire.

### 3. Date de Acces Inițiale (Manager)
Pentru a testa modulele administrative, utilizați următorul cont predefinit:
* **Email:** `admin@restaurant.null`
* **Parolă:** `adminRestaurantMagic12`

### 4. Rulare Frontend
Pentru a asigura comunicarea corectă cu API-ul (evitând erorile de securitate de tip CORS), **recomandăm insistent** rularea frontend-ului printr-un server local:
1. Deschideți folderul de frontend în **VS Code**.
2. Utilizați extensia **"Live Preview"** (apăsați "Go Live" în colțul dreapta-jos).
3. Aplicația va fi accesibilă la o adresă de tip `http://127.0.0.1:5500` și va putea comunica fără probleme cu backend-ul pornit pe portul `8080`.

*Notă: Dacă deschideți fișierul `index.html` direct în browser (file://...), este posibil ca anumite funcționalități de preluare a datelor să fie blocate de browser.*
