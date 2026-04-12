# PocketBase: Neue pageContents-Einträge

Die bestehende `pageContents`-Collection unterstützt beliebige `pageKey`/`sectionKey`-Kombinationen. Folgende Einträge müssen im PocketBase-Admin manuell angelegt werden, damit die neuen Sektionen mit CMS-Inhalten gefüllt werden können.

## Neue section_keys

### Sektionen-Seiten (Motocross, Trial, Touring)

Für jede der drei Sektionen (`motocross`, `trial`, `touring`) müssen diese `sectionKey`-Einträge angelegt werden:

| pageKey | sectionKey | Felder die genutzt werden | Beschreibung |
|---|---|---|---|
| `motocross` | `intro` | title, subtitle, content, image (Datei-Upload), imageAlt | Bereits vorhanden – jetzt auch mit Hero-Bild |
| `motocross` | `training` | title, content | Trainingszeiten, Übungsgelände etc. |
| `motocross` | `events` | title, content | Beschreibung der Veranstaltungen der Sektion |
| `trial` | `intro` | title, subtitle, content, image, imageAlt | Analog |
| `trial` | `training` | title, content | Analog |
| `trial` | `events` | title, content | Analog |
| `touring` | `intro` | title, subtitle, content, image, imageAlt | Analog |
| `touring` | `training` | title, content | Analog |
| `touring` | `events` | title, content | Analog |

### Mitgliedschaft

| pageKey | sectionKey | Felder | Beschreibung |
|---|---|---|---|
| `membership` | `intro` | title, subtitle, content, image, imageAlt | Bereits vorhanden – jetzt auch mit Hero-Bild |
| `membership` | `benefits` | title | Überschrift für den Vorteile-Bereich (z.B. "Vorteile einer Mitgliedschaft") |
| `membership` | `how_to_join` | title | Überschrift für den Schritte-Bereich (z.B. "So werden Sie Mitglied") |
| `membership` | `cta` | title, content, primaryButtonLabel, primaryButtonUrl | CTA-Bereich am Seitenende ("Interesse geweckt?") |

### Über uns

| pageKey | sectionKey | Felder | Beschreibung |
|---|---|---|---|
| `about` | `intro` | title, subtitle, content, image, imageAlt, primaryButtonLabel, secondaryButtonLabel, statOneLabel | Bereits vorhanden – Button-Labels werden als Quick-Link-Texte genutzt |
| `about` | `mission` | title, content | **Bestehend** – content wird jetzt als Rich-HTML gerendert |
| `about` | `values` | title, content | **Bestehend** – content wird jetzt als Rich-HTML gerendert |

### Veranstaltungsseite

| pageKey | sectionKey | Felder | Beschreibung |
|---|---|---|---|
| `event` | `intro` | title, content | Fallback-Texte ohne Hauptevent |
| `event` | `track_map` | title, content, image, imageAlt | Streckenkarte (Bild oder Text) |
| `event` | `location_map` | content | **Neu** – Google Maps/OSM Embed-URL für Karten-Einbettung |
| `event` | `registration_info` | title, content | **Neu** – Anmelde-Hinweise (Nenngeld, Regelungen etc.) |
| `event` | `gallery` | content | Galerie-Fallbacktext |
| `event` | `archive` | content | Archiv-Fallbacktext |

### Weitere Seiten (bestehende Einträge, jetzt mit Bild-Unterstützung)

| pageKey | sectionKey | Neues Feld | Beschreibung |
|---|---|---|---|
| `board` | `intro` | image, imageAlt, subtitle | Hero-Bild und besserer Subtitle |
| `history` | `intro` | image, imageAlt | Hero-Bild |
| `partner_clubs` | `intro` | image, imageAlt | Hero-Bild |

## Keine Schema-Änderungen nötig

Die `pageContents`-Collection hat bereits alle benötigten Felder (title, subtitle, content, image, imageAlt, primaryButtonLabel, primaryButtonUrl, etc.). Es müssen lediglich **neue Datensätze** mit den oben genannten `pageKey`/`sectionKey`-Kombinationen angelegt werden.

## Kalender-Kategorien

Die Sektionen-Seiten zeigen automatisch die nächsten Kalender-Termine der jeweiligen Kategorie an. Die Kalender-Termine müssen das Feld `category` entsprechend gesetzt haben:

- `motocross` – für Motocross-Termine
- `trial` – für Trial-Termine
- `touring` – für Touring-Termine

## News: Veröffentlichungsdatum

Die `posts`-Collection hat aktuell **kein eigenes Datumsfeld** für das Veröffentlichungsdatum. Das Frontend nutzt stattdessen das automatische `created`-Feld von PocketBase als Anzeige-Datum.

**Empfohlene Backend-Anpassung:** Ein optionales Feld `publishedAt` (Typ: DateTime) zur `posts`-Collection hinzufügen. Damit können Redakteure ein abweichendes Veröffentlichungsdatum setzen. Das Frontend sollte dann `publishedAt || created` als Anzeige-Datum nutzen.

Schritte:
1. In PocketBase-Admin → Collection `posts` → neues Feld `publishedAt` (DateTime, optional) anlegen
2. Im Frontend `mapPostRecord()` in `src/integrations/pocketbase/client.ts` anpassen: `published_at: record.publishedAt || null`
3. Im News-Formular (`NewsFormPage.tsx`) ein Datums-Eingabefeld für `publishedAt` ergänzen
