

## Plan: CMS-Überarbeitung und Mitgliedschaftsseite

### 1. Anmeldeportal-URL im CMS (Event)

Das Feld `registration_url` existiert bereits im CalendarFormPage. Das Problem ist, dass die Anmelde-URL nur beim **Erstellen/Bearbeiten eines Kalendereintrags** verfügbar ist -- nicht direkt in der Event-Verwaltungsseite. Das Feld funktioniert bereits korrekt. Falls das Problem ist, dass du es nicht findest: Es ist unter `/admin/calendar/{id}` als "Anmelde-URL"-Feld vorhanden.

Falls du das Anmeldeportal **pro Hauptevent direkt in der Events-Admin-Übersicht** bearbeiten willst, werde ich einen Schnellzugriff auf die `registration_url` in der Hauptevent-Karte auf `EventsAdminPage.tsx` einbauen (inline-editierbares URL-Feld).

### 2. Admin-Navigation: Vorstand und Partnervereine als eigenständige Seiten

- **Entfernen** der Tabs "Chronik", "Mitgliedschaft" und "Sektionen" aus `StructuredContentAdminPage.tsx`
- Die Seite `StructuredContentAdminPage` wird **aufgelöst** -- stattdessen zwei eigenständige Admin-Seiten:
  - `/admin/board` -- Vorstandsverwaltung (BoardEditor) mit Übersetzungsfunktion
  - `/admin/partner-clubs` -- Partnervereine (PartnerClubsEditor) mit Übersetzungsfunktion
- **AdminLayout.tsx**: Neue Menüpunkte "Vorstand" und "Partnervereine" statt "Strukturierte Inhalte"
- **App.tsx**: Neue Routen registrieren, alte Route entfernen

### 3. Hardcoded-Übersetzungen für Seiten ohne CMS

Die Seiten "Über uns", "Vereinsgeschichte" und ähnliche verwenden bereits `useContentWithFallback` mit deutschen Fallbacks. Fehlende CZ- und EN-Übersetzungen werden als Fallback-Texte direkt in die jeweiligen Seiten eingebaut:

- **AboutPage.tsx**: CZ/EN-Fallbacks für intro, mission, values
- **HistoryPage.tsx**: CZ/EN-Fallbacks für intro, founding, track
- Alle anderen Seiten prüfen und analog ergänzen

### 4. Mitgliedschaftsseite nach Vorbild der alten Website

Orientiert an https://msc-oberlausitzer-dreilaendereck.eu/mitglied-werden/:

- **Beitrags-Tabelle** mit den 5 Kategorien (Kinder frei, Kinder/Jugendliche 45 EUR, 18-21 Jahre 57 EUR, Erwachsene 100 EUR, Familie 147 EUR)
- **Beitrittserklärung als Download**: Button mit PDF-Download, Dokument über CMS hochladbar (neuer section_key `membership.declaration_document` in `pageContents`, Datei-Upload-Feld)
- **Adresse** für Einsendung (Am Weiher 4, 02791 Oderwitz)
- **Kündigungsfrist-Hinweis** (3 Monate vor Jahresende)
- **Satzungs-Download** (ebenfalls CMS-fähig)
- CZ/EN-Übersetzungen hardcoded als Fallback

### 5. CMS ans Frontend anpassen / Backend Contract erweitern

- **ContentAdminPage.tsx**: Section-Labels für neue event-Keys ergänzen (visitors_admission, visitors_schedule etc.) falls fehlend
- **docs/backend-contract.md**: Neue Felder dokumentieren (membership declaration_document, Satzung)
- Prüfen, dass alle im Frontend genutzten `useContentWithFallback`-Keys auch im CMS-Editor bearbeitbar sind

---

### Technische Details

**Betroffene Dateien:**
- `src/components/admin/AdminLayout.tsx` -- Navigation umbauen
- `src/pages/admin/StructuredContentAdminPage.tsx` -- Auflösen in zwei neue Seiten
- Neue Dateien: `src/pages/admin/BoardAdminPage.tsx`, `src/pages/admin/PartnerClubsAdminPage.tsx`
- `src/pages/admin/EventsAdminPage.tsx` -- Anmelde-URL Schnellzugriff
- `src/pages/club/MembershipPage.tsx` -- Komplett-Redesign mit Tabelle, Downloads, Fallbacks
- `src/pages/club/AboutPage.tsx` -- CZ/EN-Fallbacks
- `src/pages/club/HistoryPage.tsx` -- CZ/EN-Fallbacks
- `src/hooks/usePageContent.ts` -- Neue section_keys für membership
- `src/App.tsx` -- Routen anpassen
- `docs/backend-contract.md` -- Erweitern

