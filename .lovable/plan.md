

# Plan: Unterseiten verbessern + CMS-Felder anpassen

## Bestandsaufnahme

Nach Analyse aller Seiten und des CMS-Backends (PocketBase) ergibt sich folgendes Bild:

**Gut funktionierend:**
- Startseite, News, Kalender, Event-Seite, Kontakt -- vielseitig, CMS-angebunden
- Admin unter /admin mit Content-Editor, strukturierten Inhalten, Settings

**Unterseiten mit Verbesserungspotential:**

| Seite | Problem |
|---|---|
| **Über uns** | Mission/Werte nur als einfacher Text in Cards -- kein Rich-Content, kein Bild, keine CTA |
| **Vorstand** | Funktional ok, aber Foto-Bereich wirkt leer ohne Bilder; kein Intro-Bild |
| **Geschichte** | Timeline funktioniert, aber kein Intro-Bild; leere Seite ohne Einträge wirkt kahl |
| **Mitgliedschaft** | Hardcoded Überschriften ("Vorteile einer Mitgliedschaft", "So werden Sie Mitglied"), CTA-Texte hardcoded |
| **Motocross/Trial/Touring** | Alle drei identisch aufgebaut, sehr dünn -- nur Intro + 3 kleine Cards; kein Bild, keine Links zu passenden Events |
| **Sponsoren** | Gut, aber CTA-Bereich könnte visuell stärker sein |
| **Partnervereine** | Kein Intro-Bild; leere Seite wirkt leer |
| **Impressum/Datenschutz** | Funktional ok, Fallback-Texte mit Platzhaltern |

## Geplante Verbesserungen

### 1. Sparten-Seiten aufwerten (Motocross, Trial, Touring)
- Hero-Bild aus CMS (`image_url` aus `pageContents` intro)
- Neuer CMS-Abschnitt `training` und `events` pro Sparte (je `pageContents`-Einträge)
- Verknüpfung zu den nächsten Kalender-Terminen der jeweiligen Kategorie
- CTA-Button ("Alle Termine ansehen" / "Kontakt aufnehmen") -- bereits bei Touring vorhanden, bei den anderen fehlt er

### 2. Über-uns-Seite aufwerten
- Mission/Werte: `content` als Rich-HTML statt Plaintext rendern (dangerouslySetInnerHTML)
- Intro-Bild prominenter darstellen (volle Breite)
- Quick-Links Texte ("Lernen Sie unser Vorstandsteam kennen" etc.) aus CMS laden -- neuer section_key `quick_links` oder bestehende `pageContents`-Felder `primary_button_label`/`url` nutzen

### 3. Mitgliedschaft -- hardcoded Texte ersetzen
- "Vorteile einer Mitgliedschaft" und "So werden Sie Mitglied" als CMS-Felder (`membership/benefits` title, `membership/how_to_join` title)
- CTA-Sektion ("Interesse geweckt?", Beschreibungstext) als neuer `pageContents`-Eintrag `membership/cta`
- Neue PAGE_SECTIONS-Einträge: `membership: ['intro', 'benefits', 'how_to_join', 'cta']`

### 4. Geschichte -- visuell aufwerten
- Intro-Bild anzeigen falls vorhanden
- Leerer Zustand visuell verbessern (Icon + erklärender Text)

### 5. Vorstand -- Intro-Bild und besseres Empty-State
- Intro-Bild aus CMS anzeigen
- Fallback-Subtitle aus CMS statt hardcoded "Vorstand"

### 6. Partnervereine -- Intro-Bild
- Intro-Bild anzeigen falls vorhanden
- Leerer Zustand visuell besser

### 7. PAGE_SECTIONS erweitern
Neue Einträge in `usePageContent.ts`:
```
membership: ['intro', 'benefits', 'how_to_join', 'cta'],
motocross: ['intro', 'training', 'events'],
trial: ['intro', 'training', 'events'],
touring: ['intro', 'training', 'events'],
```

### 8. Backend-Anforderungen dokumentieren
Eine MD-Datei `docs/pocketbase-requirements.md` erstellen, die fehlende Collections/Felder für PocketBase beschreibt, falls neue `pageContents` section_keys oder Felder benötigt werden.

## Technische Umsetzung

### Dateien die geändert werden:

| Datei | Änderung |
|---|---|
| `src/hooks/usePageContent.ts` | PAGE_SECTIONS erweitern (membership, motocross, trial, touring) |
| `src/pages/sections/MotocrossPage.tsx` | Hero-Bild, Training/Events-Sektionen, Kategorie-Termine, CTA |
| `src/pages/sections/TrialPage.tsx` | Analog Motocross |
| `src/pages/sections/TouringPage.tsx` | Analog, bereits teilweise vorhanden |
| `src/pages/club/AboutPage.tsx` | Rich-HTML für Mission/Werte, Intro-Bild volle Breite |
| `src/pages/club/MembershipPage.tsx` | CMS-Texte statt Hardcoded, neuer CTA-Bereich aus CMS |
| `src/pages/club/HistoryPage.tsx` | Intro-Bild, besserer Empty-State |
| `src/pages/club/BoardPage.tsx` | Intro-Bild, besserer Subtitle-Fallback |
| `src/pages/partners/PartnerClubsPage.tsx` | Intro-Bild |
| `docs/pocketbase-requirements.md` | Neue Anforderungen an Backend dokumentieren |

### Neue Datei:
- `docs/pocketbase-requirements.md` -- beschreibt welche neuen `pageContents`-Einträge (section_keys) im PocketBase angelegt werden müssen

### Keine Backend-Änderungen nötig
Die bestehende `pageContents`-Collection unterstützt beliebige `pageKey`/`sectionKey`-Kombinationen. Es müssen lediglich neue Datensätze im PocketBase angelegt werden. Die MD-Datei dokumentiert welche.

## Reihenfolge
1. `usePageContent.ts` -- PAGE_SECTIONS erweitern
2. Sparten-Seiten (alle drei parallel da gleiche Struktur)
3. Über uns, Mitgliedschaft, Geschichte, Vorstand, Partnervereine
4. `docs/pocketbase-requirements.md` erstellen

