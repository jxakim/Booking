Booking System - Av Joakim Solvang Christiansen

Prosjekt jeg fikk av lærer. Dette er en bookingside der ansatte skal kunne booke plasser til de neste 7 dager.

Jeg har laget en algoritme som viser oppbygningen, og hva nettsiden skal inneholde.

NB! Dette kan IKKE brukes som det er nå til faktiske bedrifter. Om du skal dette, må det nok være en del endringer i koden og databasen.
Dette er bare en demo av en simpel bookingside. Den mangler et par sikkerhetstiltak og andre nødvendige punkter som en side trenger. 





| Databasen følger ikke med som er en ulempe, derfor vil ikke siden fungere helt som den skal. Jeg mangler databasen og skal se om jeg gidder å lage ny senere.

---------------------------------------------------------------------------------------------------

Hvordan kan du bruke?

1. Last ned alle filene i en mappe
2. Skriv i en terminal "npm install"
3. Så må du også laste ned node hvis du ikke har det.
4. Etter alt dette, kjør kommandoen "node server.js" som vil kjøre selve coren av prosjektet.
5. Deretter går du til nettleseren din og skriver inn "localhost:2000" og så vil du få opp siden.

---------------------------------------------------------------------------------------------------


---------------------------------------------------------------------------------------------------

SQL Kode:


!! Dette er for å legge inn tables !!

CREATE DATABASE IF NOT EXISTS booking;
USE booking;

CREATE TABLE IF NOT EXISTS brukerdata (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Navn VARCHAR(100) NOT NULL,
    Brukernavn VARCHAR(50) NOT NULL UNIQUE,
    Hashed_Passord VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS plasser (
    PlassID INT AUTO_INCREMENT PRIMARY KEY,
    Skjerm BOOLEAN DEFAULT FALSE,
    Tastatur BOOLEAN DEFAULT FALSE,
    Mus BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS bookinger (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    Brukernavn VARCHAR(50) NOT NULL,
    PlassID INT NOT NULL,
    Dato DATE NOT NULL,
    Aktiv BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (Brukernavn) REFERENCES brukerdata(Brukernavn) ON DELETE CASCADE,
    FOREIGN KEY (PlassID) REFERENCES plasser(PlassID) ON DELETE CASCADE
);





!! Dette er for å legge til plassene !!

INSERT INTO plasser (PlassID, Skjerm, Tastatur, Mus) VALUES
(1, FALSE, FALSE, FALSE),
(2, FALSE, FALSE, FALSE),
(3, FALSE, FALSE, FALSE),
(4, FALSE, FALSE, FALSE),
(5, FALSE, FALSE, FALSE),
(6, FALSE, FALSE, FALSE),
(7, FALSE, FALSE, FALSE),
(8, FALSE, FALSE, FALSE),
(9, FALSE, FALSE, FALSE),
(10, FALSE, FALSE, FALSE),
(11, FALSE, FALSE, FALSE),
(12, FALSE, FALSE, FALSE),
(13, FALSE, FALSE, FALSE),
(14, FALSE, FALSE, FALSE),
(15, FALSE, FALSE, FALSE),
(16, FALSE, FALSE, FALSE),
(17, FALSE, FALSE, FALSE),
(18, FALSE, FALSE, FALSE),
(19, FALSE, FALSE, FALSE);
