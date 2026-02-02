
# MSC Oberlausitzer Dreiländereck e.V. – Website MVP

## Projektübersicht
Eine moderne, mehrsprachige Vereinswebsite für den MSC Oberlausitzer Dreiländereck e.V. mit Fokus auf das jährliche Event "Oberlausitzer Dreieck" (Demolauf). Die Website verbindet dynamisches, sportliches Design mit einem vollständigen CMS für die Inhaltspflege.

---

## Phase 1: Grundgerüst & Design-System

### Design-Konzept
- **Stil**: Dynamisch & Bold – kräftiges Blau, energetische gelbe Akzente
- **Elemente**: Diagonale Linien, sportliche Typografie, Motorsport-Atmosphäre
- **Modi**: Light Mode (heller Hintergrund) + Dark Mode (hoher Kontrast)
- **Responsiv**: Mobile First, optimiert für alle Geräte

### Mehrsprachigkeit (DE/CZ/EN)
- Sprachumschalter in der Navigation
- Alle Texte als editierbare Inhalte vorbereitet
- URL-Struktur mit Sprachpräfix (/de/, /cz/, /en/)

---

## Phase 2: Startseite

### Hero-Bereich
- Event-Countdown
- **"12. Oberlausitzer Dreieck – 12./13. September 2026"**
- Call-to-Action Buttons: "Zur Veranstaltung" & "Zeitplan ansehen"

### Weitere Sektionen
- **Vereins-Teaser**: Kurze Vorstellung des MSC
- **Nächste Termine**: Teaser-Kalender mit den wichtigsten Daten
- **Aktuelle News**: Die neuesten Vereinsnachrichten
- **Sponsoren-Slider**: Havlat, DEKRA, Bergquell, Auto-Fit, Kummer, Auto Jahn

---

## Phase 3: Veranstaltung – "Oberlausitzer Dreieck"

### Hub-Seite mit allen Event-Infos
- **Überblick**: Beschreibung des Demolaufs (kein Rennen!)
- **Strecke & Region**: 5,9 km zwischen Saalendorf, Jonsdorf, Waltersdorf
- **Zeitplan**: Detaillierte Tagesübersicht (Sa/So) mit allen Klassen
- **Teilnehmerklassen**: Rennmotorräder, Seitenwagen, Karts, Formelwagen, Tourenwagen
- **Besucherinformationen**: Anreise, Eintritt, Parken
- **Fahrerlager**: Lager 1 (Motorräder/Festzelt), Lager 2 (Seitenwagen/Rennwagen)
- **Downloads**: Programmheft, Ausschreibung
- **Galerie**: Impressionen vergangener Events
- **Sponsoren**: Alle Partner der Veranstaltung
- **Archiv**: Vergangene Jahre (2025, 2024, 2023...)

---

## Phase 4: Kalender & News

### Terminkalender
- Übersicht aller Vereinstermine
- Kategoriefilter: Verein | Veranstaltung | Training | Org-Team
- Termine wie: Org-Team Sitzungen, Hauptversammlung, Weihnachtsfeier
- Optional: ICS-Export für Kalender-Apps

### News-Bereich
- Übersichtsseite mit Kacheln/Liste
- Kategorien: Verein, Veranstaltung
- Detailseiten für jeden Beitrag

---

## Phase 5: Vereinsseiten

### Über den Verein
- **Über uns**: Geschichte und Mission des MSC
- **Vorstand**: Vorstellung des Teams
- **Geschichte**: Tradition seit Gründung

### Sparten (Abteilungen)
- **Motorradtouristik**: Gemeinsame Touren
- **Motocross**: Strecke und Aktivitäten
- **Trial**: Geschicklichkeitsfahren

### Mitgliedschaft
- Informationen zum Beitritt
- Vorteile der Mitgliedschaft

---

## Phase 6: Partner & Kontakt

### Sponsoren & Partner
- Alle Sponsoren mit Logo und Link
- Einteilung nach Tier (Hauptsponsor, Partner, Unterstützer)
- Partnervereine

### Kontakt
- Kontaktformular mit Validierung
- Vereinsadresse und E-Mail
- Social Media Links (Instagram, Facebook)

### Rechtliches
- Impressum
- Datenschutzerklärung

---

## Phase 7: Backend & Admin (Supabase)

### Authentifizierung
- Sicheres Login für Redakteure und Admins
- Rollensystem: **Admin** (Nutzerverwaltung) | **Editor** (Inhaltspflege)

### Datenbank-Struktur
- **events**: Veranstaltungsdaten mit Jahrgang
- **schedule_items**: Zeitplan-Einträge pro Event
- **posts**: News-Artikel mit Kategorien
- **calendar_events**: Vereinstermine
- **sponsors**: Sponsoren mit Logo und Tier
- **downloads**: Dateien zum Herunterladen
- **media_albums** & **media_images**: Bildergalerien

### Admin-Dashboard
- Übersicht aller Inhalte
- CRUD-Funktionen für alle Datenbereiche
- Medien-Upload (Bilder, Logos, PDFs)
- Vorschau-Funktion vor Veröffentlichung

---

## Umsetzungsreihenfolge

1. **Design-System & Layout** – Farbpalette, Typografie, Komponenten
2. **Navigation & Routing** – Mehrsprachige Seitenstruktur
3. **Startseite** – Hero, Teaser, Sponsoren
4. **Veranstaltungs-Hub** – Event-Informationen mit Zeitplan
5. **Kalender & News** – Terminübersicht und Beiträge
6. **Vereinsseiten** – Über uns, Sparten, Mitgliedschaft
7. **Supabase-Setup** – Datenbank, Auth, Rollen
8. **Admin-Bereich** – CMS für Inhaltspflege

---

## Inhalte aus bestehenden Websites

Die folgenden Inhalte werden übernommen:
- Vereinslogo und Banner
- Zeitplan-Struktur (Klassen, Zeiten)
- Terminkalender (Org-Team, Events)
- Sponsorenlogos und Links
- Streckeninformationen (Saalendorf–Jonsdorf–Waltersdorf)

Texte werden in deutscher Sprache angelegt, CZ und EN als Platzhalter zum Übersetzen.
