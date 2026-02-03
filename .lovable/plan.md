
# Supabase Backend Integration

## Übersicht
Anbindung deines selbst gehosteten Supabase-Backends an das bestehende Admin-Interface mit Authentifizierung und Datenbank-Integration.

---

## Voraussetzungen

Du benötigst folgende Angaben von deinem Supabase-Projekt:
- **Supabase URL** (z.B. `https://deinprojekt.supabase.co`)
- **Anon Key** (öffentlicher API-Schlüssel)

Diese Keys sind **öffentlich nutzbar** und können sicher im Code gespeichert werden.

---

## Implementierungsschritte

### Schritt 1: Supabase Client einrichten
Erstellen einer Supabase-Client-Konfiguration:

```text
src/
└── integrations/
    └── supabase/
        ├── client.ts      # Supabase Client-Instanz
        └── types.ts       # TypeScript-Typen für Tabellen
```

### Schritt 2: Authentifizierung umstellen
Der aktuelle `AuthContext` mit Mock-Usern wird auf echte Supabase-Authentifizierung umgestellt:

- Login über `supabase.auth.signInWithPassword()`
- Logout über `supabase.auth.signOut()`
- Session-Verwaltung mit `onAuthStateChange`
- Benutzerrollen aus einer `profiles`-Tabelle laden

### Schritt 3: Datenbank-Schema erstellen
SQL-Migrationen für die benötigten Tabellen:

| Tabelle | Beschreibung |
|---------|--------------|
| `profiles` | Benutzerprofile mit Rollen (admin/editor) |
| `posts` | News-Artikel |
| `calendar_events` | Kalendertermine |
| `sponsors` | Sponsoren |
| `downloads` | Download-Dateien |
| `media_albums` | Medien-Alben |
| `media_files` | Einzelne Mediendateien |

### Schritt 4: Admin-Seiten mit echten Daten verbinden
Die Mock-Daten in den Admin-Seiten werden durch Supabase-Queries ersetzt:

- React Query Hooks für Datenabruf
- CRUD-Operationen (Erstellen, Lesen, Aktualisieren, Löschen)
- Echtzeit-Updates bei Datenänderungen

### Schritt 5: Row Level Security (RLS)
Sicherheitsregeln für jede Tabelle:

- Öffentliche Inhalte: Jeder kann lesen
- Admin/Editor: Können schreiben basierend auf ihrer Rolle

---

## Datenbank-Schema (SQL)

```text
-- Benutzerprofile
profiles
├── id (UUID, FK zu auth.users)
├── email (TEXT)
├── full_name (TEXT)
├── role (TEXT: 'admin' | 'editor')
└── created_at (TIMESTAMP)

-- News-Artikel
posts
├── id (UUID)
├── title (TEXT)
├── slug (TEXT, UNIQUE)
├── content (TEXT)
├── excerpt (TEXT)
├── category (TEXT)
├── image_url (TEXT)
├── status (TEXT: 'draft' | 'published')
├── author_id (UUID, FK zu profiles)
├── published_at (TIMESTAMP)
└── created_at (TIMESTAMP)

-- Kalendertermine
calendar_events
├── id (UUID)
├── title (TEXT)
├── description (TEXT)
├── category (TEXT)
├── date (DATE)
├── time (TEXT)
├── location (TEXT)
└── created_at (TIMESTAMP)

-- Sponsoren
sponsors
├── id (UUID)
├── name (TEXT)
├── logo_url (TEXT)
├── website (TEXT)
├── tier (TEXT: 'main' | 'partner' | 'supporter')
├── active (BOOLEAN)
└── created_at (TIMESTAMP)
```

---

## Technische Details

### Supabase Client Konfiguration
```text
Datei: src/integrations/supabase/client.ts

- Import von createClient aus @supabase/supabase-js
- Konfiguration mit URL und Anon Key
- Export der Client-Instanz
```

### AuthContext Anpassungen
```text
Datei: src/contexts/AuthContext.tsx

- Entfernung der Mock-User-Daten
- Integration von supabase.auth Methoden
- Laden der Benutzerrolle aus profiles-Tabelle
- onAuthStateChange für Session-Management
```

### Neue React Query Hooks
```text
Datei: src/hooks/useSupabase.ts

- useNews() - Posts laden/erstellen/aktualisieren
- useCalendarEvents() - Termine verwalten
- useSponsors() - Sponsoren verwalten
- useMedia() - Mediendateien verwalten
```

---

## Erforderliche Aktionen

1. **Supabase URL und Anon Key bereitstellen** - Ich benötige diese Werte, um den Client zu konfigurieren
2. **Datenbank-Schema ausführen** - SQL-Befehle in deinem Supabase Dashboard ausführen
3. **Ersten Admin-User erstellen** - Über Supabase Authentication einen User anlegen und in profiles als 'admin' eintragen

---

## Zeitplan

| Phase | Beschreibung | Aufwand |
|-------|--------------|---------|
| 1 | Client-Setup + Auth | Schnell |
| 2 | Datenbank-Schema | Schnell |
| 3 | News-Verwaltung | Mittel |
| 4 | Kalender + Sponsoren | Mittel |
| 5 | Medien-Upload | Mittel |

---

## Nächster Schritt

Bitte teile mir deine **Supabase URL** und den **Anon Key** mit, damit ich mit der Implementierung beginnen kann.
