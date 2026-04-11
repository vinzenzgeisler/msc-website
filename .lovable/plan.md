

# Plan: Website vorzeigefähig machen

## Überblick

Sechs Arbeitsbereiche: Header aufwerten, Mitgliedschaft verschönern, Veranstaltungsseite fixen, Karten-Funktionen, Cookie-Banner, und CMS-Dokumentation erweitern. Texte von der alten Website werden als CMS-Fallbacks eingebaut wo sinnvoll.

---

## 1. Blaue Subpage-Header aufwerten

**Problem:** Alle Unterseiten haben denselben langweiligen `bg-primary py-16` Block.

**Lösung:** Einen wiederverwendbaren `PageHeader`-Komponenten erstellen mit:
- Diagonalem Accent-Stripe (wie im Hero der Startseite)
- Subtiles Racing-Stripe-Pattern im Hintergrund
- Optionales CMS-Bild bleibt weiterhin unterstützt (opacity-20 overlay)
- Größerer Padding, bessere Typografie-Hierarchie

**Dateien:**
- Neu: `src/components/layout/PageHeader.tsx`
- Änderungen in: `AboutPage`, `BoardPage`, `HistoryPage`, `MembershipPage`, `ContactPage`, `SponsorsPage`, `PartnerClubsPage`, `ImprintPage`, `PrivacyPage`, `EventPage`

---

## 2. Mitgliedschaft-Seite verschönern

**Problem:** Seite wirkt flach, der CTA-Bereich passt nicht zum Design.

**Änderungen:**
- Header nutzt neuen `PageHeader`
- Benefits-Sektion: Icons variieren (nicht alle CheckCircle2), leichter farbiger Hintergrund pro Card
- How-to-join: Verbindungslinie zwischen Steps (wie Timeline)
- CTA: Racing-Stripe Hintergrund mit Primary-Farbe statt flachem Weiß, gelber Accent-Button
- Intro-Text aus alter Website als besserer Fallback: "Der MSC Oberlausitzer Dreiländereck e.V. freut sich über jedes neue Mitglied..."

---

## 3. Veranstaltungsseite fixen

**Problem:** "Zur Anmeldung"-Button fehlt bzw. wird nur angezeigt wenn `registration_url` gesetzt ist.

**Änderungen:**
- Im Header-Bereich: "Zur Anmeldung"-Button immer anzeigen wenn `registration_url` vorhanden (bereits im Code, prüfen ob mainEvent geladen wird)
- Button prominent als CTA im Hero-Bereich positionieren (aktuell `Jetzt anmelden`)
- Anchor-Navigation-Bar: "Anmeldung" Link beibehalten
- Fallback-Text von alter Website einbauen: "Das traditionsreiche Oberlausitzer Dreieck... auf der legendären 5,9 km langen Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf"
- Sicherstellen dass der Registrierungsbereich (#registration) auch ohne mainEvent sichtbar bleibt mit CMS-Fallback

---

## 4. Karten-Funktionen (Google Maps / OpenStreetMap)

**Lösung:** Auf der Kontaktseite und Veranstaltungsseite:
- Kontaktseite: `contact_map_embed_url` aus Settings wird bereits unterstützt -- sicherstellen dass es funktioniert
- Veranstaltungsseite (Strecke): Neues CMS-Feld `event/track_map` mit `mapEmbedUrl` oder direkt OpenStreetMap-Embed für den Streckenbereich
- Neuer `pageContents`-Eintrag `event/location_map` mit `content` = embed-URL
- Fallback: Statischer Link zu Google Maps mit Adresse aus `mainEvent.location`

**Dateien:** `EventPage.tsx` (Track-Sektion um Karten-Embed erweitern), `docs/pocketbase-requirements.md`

---

## 5. Cookie-Banner

**Lösung:** Einfacher, DSGVO-konformer Cookie-Banner:
- Neu: `src/components/layout/CookieBanner.tsx`
- Zeigt sich am unteren Bildschirmrand
- "Akzeptieren" und "Nur notwendige" Buttons
- Consent wird in `localStorage` gespeichert
- Einbindung in `MainLayout.tsx`
- Link zu Datenschutzerklärung

---

## 6. Texte von alter Website übernehmen

Aus der alten Website extrahierte Texte als verbesserte Fallbacks:
- **Event-Intro:** "Das traditionsreiche Oberlausitzer Dreieck... mitten im Zittauer Gebirge eine spannende Motorshow auf der legendären 5,9 km langen Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf."
- **Anmeldung:** Hinweise zu Vereinsmitgliedern (kein Nenngeld), Nachwuchsfahrer-Regelung, Attest ab 70 Jahren
- Rest soll über CMS gepflegt werden -- Fallbacks nur als Platzhalter

---

## 7. CMS-Dokumentation erweitern

`docs/pocketbase-requirements.md` aktualisieren:

| pageKey | sectionKey | Felder | Beschreibung |
|---|---|---|---|
| `event` | `location_map` | content (embed URL) | Karten-Embed für Streckenbereich |
| `event` | `registration_info` | title, content | Anmelde-Hinweise und Regelungen |

`docs/cms-content-matrix.md` aktualisieren mit neuen Feldern.

---

## Technische Übersicht

| Datei | Änderung |
|---|---|
| `src/components/layout/PageHeader.tsx` | **Neu** -- wiederverwendbarer Subpage-Header |
| `src/components/layout/CookieBanner.tsx` | **Neu** -- DSGVO Cookie-Banner |
| `src/components/layout/MainLayout.tsx` | CookieBanner einbinden |
| `src/pages/EventPage.tsx` | Registration-Button fix, Karten-Embed, bessere Fallback-Texte |
| `src/pages/club/MembershipPage.tsx` | Visuelles Redesign |
| `src/pages/club/AboutPage.tsx` | PageHeader nutzen |
| `src/pages/club/BoardPage.tsx` | PageHeader nutzen |
| `src/pages/club/HistoryPage.tsx` | PageHeader nutzen |
| `src/pages/ContactPage.tsx` | PageHeader nutzen |
| `src/pages/partners/SponsorsPage.tsx` | PageHeader nutzen |
| `src/pages/partners/PartnerClubsPage.tsx` | PageHeader nutzen |
| `src/pages/ImprintPage.tsx` | PageHeader nutzen |
| `src/pages/PrivacyPage.tsx` | PageHeader nutzen |
| `docs/pocketbase-requirements.md` | Neue Einträge dokumentieren |
| `docs/cms-content-matrix.md` | Aktualisieren |

## Reihenfolge
1. `PageHeader`-Komponente + alle Seiten umstellen
2. Mitgliedschaft-Redesign
3. Veranstaltungsseite fixen (Button + Karte + Texte)
4. Cookie-Banner
5. CMS-Dokumentation erweitern

