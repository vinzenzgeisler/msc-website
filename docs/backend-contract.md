# Backend Contract – MSC Website ↔ PocketBase CMS

Stand: 12.04.2026  
Backend: PocketBase (`https://cream-salamander.pikapod.net`)  
Prinzip: **DE ist führend**, EN/CZ als Übersetzungen pro Datensatz (`locale`-Feld).  
Fallback-Kette: `locale` → `de` → hardcoded Fallback

---

## 1. Collections-Übersicht

| # | Collection (PB-Name) | Typ | Locale-fähig | Beschreibung |
|---|---|---|---|---|
| 1 | `siteSettings` | Singleton | ✗ | Globale Einstellungen (Vereinsname, Kontakt, SEO, Social) |
| 2 | `pageContents` | Content | ✓ | CMS-Textblöcke pro Seite/Section/Locale |
| 3 | `calendarEvents` | Content | ✓ | Kalendertermine inkl. Hauptevent-Flag |
| 4 | `posts` | Content | ✓ | News-Beiträge |
| 5 | `sponsors` | Content | ✗ | Sponsoren/Partner |
| 6 | `partnerClubs` | Content | ✓ | Partnervereine |
| 7 | `downloads` | Content | ✗ | Downloadbare Dateien |
| 8 | `boardMembers` | Content | ✗ | Vorstandsmitglieder |
| 9 | `mediaAlbums` | Content | ✓ | Fotogalerien |
| 10 | `eventSchedules` | Event-Komponente | ✓ | Zeitplan-Tage pro Event |
| 11 | `eventScheduleEntries` | Event-Komponente | ✓ | Einzelne Zeitplan-Einträge |
| 12 | `eventInfos` | Event-Komponente | ✓ | Besucherinfos (Anreise, Eintritt, Fahrerlager, etc.) |
| 13 | `participantClasses` | Event-Komponente | ✓ | Teilnehmerklassen |
| 14 | `historyTimelineEntries` | Structured | ✓ | Vereinschronik-Einträge |
| 15 | `membershipBenefits` | Structured | ✓ | Vorteile einer Mitgliedschaft |
| 16 | `membershipSteps` | Structured | ✓ | Schritte zum Beitritt |
| 17 | `disciplineHighlights` | Structured | ✓ | Highlights je Sparte (Motocross/Trial/Touring) |

---

## 2. Collection-Schemas

### 2.1 `siteSettings` (Singleton)

| PB-Feld | Typ | Frontend-Mapping | Pflicht | Beschreibung |
|---|---|---|---|---|
| `siteName` | text | Header, Footer, Meta | ✓ | Vollständiger Vereinsname |
| `siteShortName` | text | Logo-Fallback | ✗ | Kürzel (z.B. „MSC") |
| `description` | text | Footer, Hero-Fallback | ✗ | Kurzbeschreibung des Vereins |
| `contactEmail` | email | Footer, Kontaktseite | ✓ | Haupt-E-Mail-Adresse |
| `contactPhone` | text | Footer, Kontaktseite | ✗ | Telefonnummer |
| `address` | text | Footer, Kontaktseite | ✗ | Postanschrift |
| `facebookUrl` | url | Footer, Kontaktseite | ✗ | Facebook-Link |
| `instagramUrl` | url | Footer, Kontaktseite | ✗ | Instagram-Link |
| `contactMapEmbedUrl` | url | Kontaktseite (iframe) | ✗ | OpenStreetMap-Embed-URL |
| `contactMapLink` | url | Kontaktseite | ✗ | Externer Karten-Link |
| `contactMapLabel` | text | Kontaktseite | ✗ | Karten-Beschriftung |
| `sponsoringEmail` | email | Sponsoren-CTA | ✗ | E-Mail für Sponsoring-Anfragen |
| `metaTitle` | text | `<title>` | ✗ | Globaler Meta-Title |
| `metaDescription` | text | `<meta description>` | ✗ | Globale Meta-Beschreibung |
| `logo` | file | Header, Footer | ✗ | Vereinslogo |
| `logoAlt` | text | Logo alt-Text | ✗ | |
| `defaultOgImage` | file | OG-Image-Fallback | ✗ | Standard-Vorschaubild |
| `foundingYear` | number | Club-Teaser „Seit X" | ✗ | Gründungsjahr (Standard: 1984) |
| `memberCount` | text | Club-Teaser Stats | ✗ | z.B. „150+" |
| `sectionCount` | text | Club-Teaser Stats | ✗ | z.B. „3" |
| `memberCountLabel` | text | Club-Teaser Stats | ✗ | z.B. „Mitglieder" |
| `traditionYearsLabel` | text | Club-Teaser Stats | ✗ | z.B. „Jahre Tradition" |
| `sectionCountLabel` | text | Club-Teaser Stats | ✗ | z.B. „Sektionen" |

**Frontend-Nutzung:** `useSettings()` → alle Seiten (Header, Footer, Kontakt, Club-Teaser, SEO)

---

### 2.2 `pageContents` (CMS-Textblöcke)

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `pageKey` | text | Seiten-Schlüssel (z.B. `home`, `about`, `event`) |
| `sectionKey` | text | Abschnitt-Schlüssel (z.B. `hero`, `intro`, `track_map`) |
| `locale` | text | Sprache: `de`, `en`, `cz` |
| `title` | text | Überschrift |
| `subtitle` | text | Unterzeile |
| `content` | editor/text | Hauptinhalt (HTML erlaubt) |
| `primaryButtonLabel` | text | Label für primären CTA-Button |
| `primaryButtonUrl` | url | Link für primären CTA-Button |
| `secondaryButtonLabel` | text | Label für sekundären Button |
| `secondaryButtonUrl` | url | Link für sekundären Button |
| `statOneLabel` | text | Label für Statistik-Feld 1 |
| `statTwoLabel` | text | Label für Statistik-Feld 2 |
| `statThreeLabel` | text | Label für Statistik-Feld 3 |
| `image` | file | Bild zum Abschnitt |
| `imageAlt` | text | Bild-Alternativtext |

**Unique-Constraint:** `(pageKey, sectionKey, locale)`

**Frontend-Nutzung:** `useContentWithFallback(pageKey, sectionKey)` → automatischer Fallback DE

#### Registrierte Seiten & Sections

| pageKey | sectionKey | Verwendet auf | Wichtigste Felder |
|---|---|---|---|
| `home` | `hero` | Startseite Hero | `title`, `subtitle`, `image`, `primaryButtonLabel/Url`, `secondaryButtonLabel/Url` |
| `home` | `club_teaser` | Club-Teaser | `title`, `subtitle`, `content`, `image`, `statOneLabel`, `statTwoLabel`, `statThreeLabel` |
| `home` | `upcoming_events` | Terminvorschau | `title`, `subtitle` |
| `home` | `news` | News-Sektion | `title`, `subtitle` |
| `home` | `sponsors` | Sponsoren-Sektion | `title`, `subtitle` |
| `about` | `intro` | Über uns | `title`, `subtitle`, `content`, `image` |
| `about` | `mission` | Über uns – Mission | `title`, `content` |
| `about` | `values` | Über uns – Werte | `title`, `content` |
| `board` | `intro` | Vorstand | `title`, `subtitle`, `content`, `image` |
| `history` | `intro` | Geschichte | `title`, `subtitle`, `content`, `image` |
| `membership` | `intro` | Mitgliedschaft | `title`, `subtitle`, `content`, `image` |
| `membership` | `benefits` | Vorteile-Überschrift | `title` |
| `membership` | `how_to_join` | Beitritt-Überschrift | `title` |
| `membership` | `cta` | Mitglied-CTA | `title`, `content`, `primaryButtonLabel`, `primaryButtonUrl` |
| `motocross` | `intro` | Motocross | `title`, `subtitle`, `content`, `image` |
| `motocross` | `training` | Motocross Training | `title`, `content` |
| `motocross` | `events` | Motocross Termine | `title`, `content` |
| `trial` | `intro` | Trial | `title`, `subtitle`, `content`, `image` |
| `trial` | `training` | Trial Training | `title`, `content` |
| `trial` | `events` | Trial Termine | `title`, `content` |
| `touring` | `intro` | Touring | `title`, `subtitle`, `content`, `image` |
| `touring` | `training` | Touring Training | `title`, `content` |
| `touring` | `events` | Touring Termine | `title`, `content` |
| `calendar` | `intro` | Kalender | `title`, `subtitle` |
| `news` | `intro` | News-Listing | `title`, `subtitle` |
| `event` | `intro` | Event Hero-Fallback | `title`, `content` |
| `event` | `track_map` | Streckenkarte | `title`, `content`, `image`, `imageAlt` |
| `event` | `location_map` | Karten-Embed | `title`, `content` (Embed-URL), `primaryButtonUrl` (Google Maps), `primaryButtonLabel` |
| `event` | `registration_info` | Anmeldung | `title`, `content` |
| `event` | `gallery` | Galerie-Fallback | `content` |
| `event` | `archive` | Archiv-Fallback | `content` |
| `contact` | `intro` | Kontaktseite | `title`, `subtitle` |
| `contact` | `info` | Kontaktdaten-Text | `content` |
| `contact` | `map` | Karten-Label | `title`, `content` |
| `sponsors` | `intro` | Sponsorenseite | `title`, `subtitle` |
| `sponsors` | `cta` | Sponsor-CTA | `title`, `content` |
| `partner_clubs` | `intro` | Partnervereine | `title`, `subtitle`, `content`, `image` |
| `imprint` | `content` | Impressum | `title`, `content` (HTML) |
| `privacy` | `content` | Datenschutz | `title`, `content` (HTML) |

---

### 2.3 `calendarEvents`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Veranstaltungstitel |
| `slug` | text | URL-Slug (unique je locale) |
| `description` | text | Beschreibung |
| `category` | select | `motocross`, `trial`, `touring`, `allgemein`, `verein` |
| `startDt` | datetime | Startdatum/-zeit |
| `endDt` | datetime | Enddatum (optional) |
| `location` | text | Veranstaltungsort |
| `locale` | text | `de`/`en`/`cz` |
| `isMainEvent` | bool | Hauptevent-Flag → Hero + /event |
| `contactEmail` | email | Kontakt-E-Mail |
| `registrationUrl` | url | Externer Anmeldelink |
| `published` | bool | Veröffentlicht |

**Frontend-Nutzung:**
- `useMainEvent()` → Startseite Hero, Event-Seite Hero
- `useCalendarEvents()` → Kalender, Terminvorschau, Sparten-Seiten

---

### 2.4 `posts`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Beitragstitel |
| `slug` | text | URL-Slug (unique je locale) |
| `content` | editor | Inhalt (HTML) |
| `excerpt` | text | Vorschautext |
| `category` | select | `allgemein`, `verein`, `motocross`, `trial`, `touring` |
| `image` | file | Beitragsbild |
| `published` | bool | Veröffentlicht |
| `isPinned` | bool | Angepinnt (Sortierung) |
| `locale` | text | `de`/`en`/`cz` |

**Frontend-Nutzung:** `usePosts()` → News-Listing, News-Detail, Startseite News-Sektion

---

### 2.5 `sponsors`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `name` | text | Sponsorname |
| `logo` | file | Logo-Datei |
| `website` | url | Website-Link |
| `tier` | select | `main`, `partner`, `supporter` |
| `active` | bool | Aktiv/Sichtbar |
| `sortOrder` | number | Sortierreihenfolge |

**Frontend-Nutzung:** `useSponsors()` → Sponsoren-Seite, Startseite Sponsoren-Sektion

---

### 2.6 `partnerClubs`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `name` | text | Vereinsname |
| `description` | text | Beschreibung |
| `location` | text | Standort |
| `website` | url | Website |
| `logo` | file | Logo |
| `active` | bool | Aktiv |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

**Frontend-Nutzung:** `usePartnerClubs()` → Partnervereine-Seite

---

### 2.7 `downloads`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Dateiname/Bezeichnung |
| `description` | text | Beschreibung |
| `file` | file | Datei |
| `category` | select | `event`, `verein`, `allgemein` |

**Frontend-Nutzung:** `useDownloads()` → Event-Seite Downloads, Admin Downloads

---

### 2.8 `boardMembers`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `name` | text | Vollständiger Name |
| `role` | text | Funktion (z.B. „1. Vorsitzender") |
| `photo` | file | Foto |
| `email` | email | E-Mail |
| `phone` | text | Telefon |
| `sortOrder` | number | Sortierung |

**Frontend-Nutzung:** `useBoardMembers()` → Vorstand-Seite

---

### 2.9 `mediaAlbums`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Album-Titel |
| `slug` | text | URL-Slug |
| `description` | text | Beschreibung |
| `coverImage` | file | Coverbild |
| `images` | file[] | Bilder (Multi-Upload) |
| `locale` | text | `de`/`en`/`cz` |

**Frontend-Nutzung:** `useMedia()` → Galerie, Admin Medien

---

### 2.10 Event-Komponenten

#### `eventSchedules` (Zeitplan-Tage)

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `event` | relation | → `calendarEvents.id` |
| `dayLabel` | text | Tag-Bezeichnung (z.B. „Samstag, 12. Juli") |
| `dayNumber` | number | Tagnummer (Sortierung) |
| `entries` | json | Legacy: `[{time, title}]` |
| `locale` | text | `de`/`en`/`cz` |

#### `eventScheduleEntries` (Einzelne Zeitplan-Einträge)

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `event` | relation | → `calendarEvents.id` |
| `scheduleDay` | relation | → `eventSchedules.id` |
| `timeLabel` | text | Uhrzeit (z.B. „09:00") |
| `title` | text | Programmpunkt |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

#### `eventInfos` (Besucherinfos)

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `event` | relation | → `calendarEvents.id` |
| `section` | select | `track`, `visitors_arrival`, `visitors_admission`, `visitors_paddock`, `registration` |
| `title` | text | Titel |
| `content` | text | Inhalt |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

#### `participantClasses` (Teilnehmerklassen)

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `event` | relation | → `calendarEvents.id` |
| `name` | text | Klassenname |
| `description` | text | Beschreibung |
| `icon` | select | `bike`, `car`, `users` |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

**Frontend-Nutzung:** `useEventContent(eventId)` → Event-Seite (Zeitplan, Klassen, Besucher)

---

### 2.11 Structured Content Collections

#### `historyTimelineEntries`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `yearLabel` | text | Jahreszahl (z.B. „1984") |
| `title` | text | Meilenstein-Titel |
| `description` | editor | Beschreibungstext (HTML) |
| `image` | file | Bild |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

#### `membershipBenefits`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Vorteil-Titel |
| `description` | text | Beschreibung |
| `icon` | text | Icon-Schlüssel |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

#### `membershipSteps`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `title` | text | Schritt-Titel |
| `description` | editor | Beschreibung (HTML) |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

#### `disciplineHighlights`

| PB-Feld | Typ | Beschreibung |
|---|---|---|
| `disciplineKey` | select | `motocross`, `trial`, `touring` |
| `title` | text | Highlight-Titel |
| `description` | text | Beschreibung |
| `icon` | text | Icon-Schlüssel (`training`, `events`, `community`, etc.) |
| `sortOrder` | number | Sortierung |
| `locale` | text | `de`/`en`/`cz` |

---

## 3. Frontend-Hooks → Collection Mapping

| Hook | Collection(s) | Seite(n) |
|---|---|---|
| `useSettings()` | `siteSettings` | Alle (Header, Footer, Meta) |
| `useContentWithFallback(page, section)` | `pageContents` | Alle Content-Seiten |
| `useMainEvent()` | `calendarEvents` | Startseite Hero, Event-Seite |
| `useCalendarEvents()` | `calendarEvents` | Kalender, Sparten, Startseite |
| `usePosts()` | `posts` | News-Listing, News-Detail, Startseite |
| `useSponsors()` | `sponsors` | Sponsoren-Seite, Startseite |
| `useBoardMembers()` | `boardMembers` | Vorstand-Seite |
| `useDownloads()` | `downloads` | Event-Seite, Admin |
| `useMedia()` | `mediaAlbums` | Galerie, Admin |
| `useEventContent(eventId)` | `eventSchedules`, `eventScheduleEntries`, `eventInfos`, `participantClasses` | Event-Seite |
| `useHistoryTimelineEntries()` | `historyTimelineEntries` | Geschichte-Seite |
| `useMembershipBenefits()` | `membershipBenefits` | Mitgliedschaft-Seite |
| `useMembershipSteps()` | `membershipSteps` | Mitgliedschaft-Seite |
| `useDisciplineHighlights(key)` | `disciplineHighlights` | Sparten-Seiten |
| `usePartnerClubs()` | `partnerClubs` | Partnervereine-Seite |

---

## 4. Lokalisierungs-Strategie

- **Locale-Werte:** `de` (Standard), `en`, `cz`
- **Fallback-Kette:** Exakte Locale → `de` → Hardcoded Fallback
- **Implementierung:** `resolveLocalizedRecord()` / `resolveLocalizedList()`
- **Nicht-lokalisierte Collections:** `siteSettings`, `sponsors`, `downloads`, `boardMembers`
- **UI-Labels:** Über `src/i18n/translations.ts` (nicht CMS), z.B. „Mehr erfahren", „Termine ansehen"

---

## 5. Spezielle CMS-Felder & ihre Nutzung

### 5.1 Event-Seite – Karten-Konfiguration

| Zweck | CMS-Feld | Collection | Key |
|---|---|---|---|
| uMap-Embed-URL | `content` | `pageContents` | `event/location_map` |
| Google Maps Link | `primaryButtonUrl` | `pageContents` | `event/location_map` |
| Google Maps Link-Label | `primaryButtonLabel` | `pageContents` | `event/location_map` |
| Streckenkarte als Bild | `image` | `pageContents` | `event/track_map` |

### 5.2 Startseite Hero – Event-Modus

Wenn ein `calendarEvent` mit `isMainEvent=true` und `published=true` existiert:
- Hero zeigt Event-Titel, Datum, Countdown, CTA
- Buttons verlinken auf `/event` und `/event#schedule`
- Diese Defaults können über `pageContents` `home/hero` überschrieben werden (`primaryButtonLabel/Url`, `secondaryButtonLabel/Url`)

### 5.3 Registrierungs-Button

- Quelle: `calendarEvents.registrationUrl`
- Wenn gesetzt: Externer Link mit Icon
- Wenn leer: Ankerlink auf `#registration` oder Hinweistext

---

## 6. Admin-Bereich

Der Admin-Bereich (`/admin`) ermöglicht CRUD-Operationen auf alle obigen Collections:

| Admin-Seite | Collection(s) |
|---|---|
| Dashboard | Statistiken aus allen Collections |
| Inhalte verwalten | `pageContents` (alle Seiten/Sections) |
| News verwalten | `posts` |
| Kalender verwalten | `calendarEvents` |
| Event verwalten | `eventSchedules`, `eventScheduleEntries`, `eventInfos`, `participantClasses` |
| Sponsoren verwalten | `sponsors` |
| Downloads verwalten | `downloads` |
| Medien verwalten | `mediaAlbums` |
| Structured Content | `historyTimelineEntries`, `membershipBenefits`, `membershipSteps`, `disciplineHighlights`, `partnerClubs` |
| Benutzer | PocketBase Auth |
| Einstellungen | `siteSettings` |

---

## 7. Vollständigkeits-Check: Was ist CMS-gesteuert?

### ✅ Vollständig CMS-gesteuert
- Alle Seitentexte (Titel, Inhalte, Unterzeilen) über `pageContents`
- Vereinseinstellungen (Name, Kontakt, Social, SEO) über `siteSettings`
- News-Beiträge über `posts`
- Kalendertermine über `calendarEvents`
- Event-Details (Zeitplan, Klassen, Besucherinfos) über Event-Komponenten
- Sponsoren über `sponsors`
- Vorstand über `boardMembers`
- Downloads über `downloads`
- Vereinsgeschichte über `historyTimelineEntries`
- Mitgliedschaft (Vorteile, Schritte) über `membershipBenefits`/`membershipSteps`
- Sparten-Highlights über `disciplineHighlights`
- Partnervereine über `partnerClubs`
- Impressum & Datenschutz über `pageContents` (imprint/content, privacy/content)
- Karten-Embeds (Kontakt über `siteSettings`, Event über `pageContents`)
- Registrierungslinks über `calendarEvents.registrationUrl`
- Google Maps Link über `pageContents` `event/location_map`

### ℹ️ Hardcoded (by design – UI-Labels)
- Navigationsmenü-Labels → `src/i18n/translations.ts`
- Button-Labels wie „Mehr erfahren", „Termine ansehen" → `translations.ts`
- Countdown-Labels (Tage, Stunden, Minuten) → `translations.ts`
- Formular-Labels (Name, E-Mail, Betreff) → `translations.ts`
- Footer-Navigation → fest verdrahtet (Seitenstruktur)
- uMap-Embed Fallback-URL → hardcoded Default, überschreibbar via CMS
