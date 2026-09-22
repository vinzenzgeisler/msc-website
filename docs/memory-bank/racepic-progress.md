<!-- Nur die Architektur (racepic-architecture.md) wird 1:1 in allen 3 Repos synchron gehalten. Diese Fortschrittsdatei ist repo-spezifisch und listet nur die Arbeitspakete, die in msc-website passieren. -->
# RacePic – Fortschritt (msc-website)

**Stand:** 2026-09-22 · Architektur: [racepic-architecture.md](./racepic-architecture.md) · Offene Punkte (konsolidiert): [racepic-open-items.md](./racepic-open-items.md) · Lizenzen: [../racepic/licenses.md](../racepic/licenses.md)

## Arbeitspakete in diesem Repo

| # | Paket | Status | Notiz |
|---|---|---|---|
| 2b | Identität (Website-Teil): `/racepic/studio` Login (Email-OTP), Einladung/Claim-UI, Profil | **erledigt (Email-OTP; Passkeys offen)** | siehe „Paket 2 – Ergebnis“ unten; Backend-Teil siehe MSC-Event-Backend |
| 3b | Upload (Website-Teil): Studio-Uploader (eigener Client statt Uppy, s. u.), Event-/Lizenzwahl | **erledigt** | siehe „Paket 3 – Ergebnis“ unten; Backend-Teil siehe MSC-Event-Backend |
| 8 | Öffentliches RacePic: Routen `/racepic`, `/racepic/:event`, `/racepic/:event/:participant`; Suche, Galerie, Lightbox, Download | **erledigt** | siehe „Paket 8 – Ergebnis" unten; Fotografenprofil siehe Paket 12 |
| 10b | Pilot 12. OLD 2026 (Website-Teil): Event veröffentlichen, i18n-Texte | offen | |
| 12 | Öffentliches Fotografenprofil `/racepic/fotografen/:slug` | **erledigt** | siehe „Paket 12 – Ergebnis" unten; Backend-Teil siehe MSC-Event-Backend |
| 14 | UI/UX-Redesign-Grundlage: RacePic-Wortmarke | **erledigt** | siehe „Paket 14 – Ergebnis" unten; Roadmap Paket 14–18 in [racepic-ux-redesign-plan.md](./racepic-ux-redesign-plan.md) |
| 15 | Studio-Redesign (Website-Teil): Layout, Meine Bilder, Profil, Lizenzseite | **erledigt (ungedeployed)** | siehe „Paket 15 – Ergebnis" unten; Backend-Teil siehe MSC-Event-Backend |

## Paket 2 – Ergebnis (2026-09-21)

- `src/integrations/racepic/client.ts` (neu): RacePic-API-Client, nutzt dieselbe Basis-URL/Proxy-Konfiguration wie `event-backend/client.ts` (RacePic-Routen laufen auf derselben HTTP API).
- `src/integrations/racepic/photographerAuth.ts` (neu): Email-OTP-Login direkt gegen die unauthentifizierte Cognito-IdP-API (`InitiateAuth`/`RespondToAuthChallenge`, `AuthFlow: USER_AUTH`) per `fetch` statt Amplify Auth oder `@aws-sdk/client-cognito-identity-provider` – spart mehrere hundert KB Bundle-Größe auf einer Marketing-Website. **Passkeys (WEB_AUTHN) sind damit noch nicht abgedeckt**, nur der Email-OTP-Pfad (reicht für Einladung/Claim und normalen Login).
- `src/integrations/racepic/session.ts` (neu): einfacher `localStorage`-Token-Store (kein Refresh-Rotation-Flow im MVP).
- `src/pages/racepic/{StudioInvitationPage,StudioLoginPage,StudioPage,useEmailOtpLogin}.tsx` (neu): Einladung/Claim-Flow, Login für wiederkehrende Fotograf:innen, Dashboard-Platzhalter (Upload folgt in Paket 3b).
- Routen in `src/App.tsx`: `/racepic/studio/einladung/:token`, `/racepic/studio/login`, `/racepic/studio` – bewusst **nicht** in der Hauptnavigation und **nicht** in `scripts/generate-sitemap.mjs` (kein öffentlicher Content, `noindex` in `MainLayout`).
- `.env.example`: `VITE_RACEPIC_PHOTOGRAPHER_CLIENT_ID`, `VITE_RACEPIC_AWS_REGION`.
- **Verifiziert:** `tsc --noEmit` fehlerfrei; `vite build` erfolgreich.

## Paket 3 – Ergebnis (2026-09-21)

- **Abweichung vom Architekturplan:** statt `@uppy/aws-s3` ein schlanker eigener Uploader (`useStudioUploader.ts`). Grund: Uppys `AwsS3`-Plugin (v6) geht davon aus, dass der *Client* den S3-Key wählt und der Server nur signiert; unsere Backend-API lässt bewusst den *Server* den Key wählen und bei großen Dateien den Multipart-Upload selbst anlegen (serverseitige Kontrolle über Größe/MIME/Kontingent, bevor irgendein S3-Request signiert wird). Ein Adapter zwischen beiden Modellen wäre zusätzliche, schwer lokal testbare Komplexität gewesen. Kann bei Bedarf später nachgezogen werden.
- `src/integrations/racepic/client.ts`: Endpunkte für Batch/Upload/Teile/Complete/Abort/Bildliste sowie `fetchMyEventAccess`/`fetchLicenses`; `putWithProgress` (XHR statt `fetch`, da `fetch` keinen Upload-Fortschritt liefert).
- `src/pages/racepic/useStudioUploader.ts` (neu): Worker-Pool (3 parallele Dateien), Single-PUT vs. Multipart je nach Backend-Antwort, Teil-Resume innerhalb derselben Session über `listUploadedParts`, manueller Retry pro Datei. **Noch offen:** Resume nach Tab-/Seiten-Reload (IndexedDB-Persistenz laut Architekturplan) ist nicht implementiert, nur Resume innerhalb der laufenden Session.
- `src/pages/racepic/StudioUploadPanel.tsx` (neu): Event-/Lizenzauswahl, Drag&Drop-Zone (JPEG, bis 80 MB), Fortschrittsliste mit Retry/Entfernen, eingebunden in `StudioPage.tsx`.
- **Verifiziert:** `tsc --noEmit` fehlerfrei; `vite build` erfolgreich.

## Paket 8 – Ergebnis (2026-09-21)

- `src/integrations/racepic/publicClient.ts` (neu): liest Manifeste **direkt vom CloudFront-CDN** (`VITE_RACEPIC_CDN_BASE_URL`), kein API-Aufruf zum Durchsuchen der Galerie (Architekturplan Abschnitt B: "Öffentlicher Traffic trifft weder Lambda noch RDS"). Nur `requestDownload` geht an die API (`POST /public/racepic/images/{id}/download`).
- `src/pages/racepic/RacePicHomePage.tsx` (`/racepic`): Liste veröffentlichter Events aus `manifests/events.json`.
- `src/pages/racepic/RacePicEventPage.tsx` (`/racepic/:eventSlug`): lädt `manifests/{slug}/index.json`, **clientseitige** Suche über Name/Startnummer/Fahrzeug/Klasse (kein Suchservice nötig, wie geplant).
- `src/pages/racepic/RacePicParticipantPage.tsx` (`/racepic/:eventSlug/:participantKey`): lädt `manifests/{slug}/p/{participantKey}.json`, Bildergrid mit eigener Dialog-Lightbox (siehe Entscheidung unten) und Download-Buttons für alle vier Größen inkl. Fotograf/Lizenz-Anzeige.
- Route, Sitemap (nur `/racepic` selbst – siehe offener Punkt) und Hauptnavigation (`Header.tsx`, neuer i18n-Schlüssel `nav.racePic` in allen 4 Sprachen) ergänzt.
- `.env.example`: `VITE_RACEPIC_CDN_BASE_URL`.
- **Nicht umgesetzt (siehe Paket 12 unten):** `/racepic/fotografen/:slug` war hier aus Zeitgründen zurückgestellt.
- **Verifiziert:** `tsc --noEmit` und `vite build` fehlerfrei.

## Paket 12 – Ergebnis (2026-09-22)

Schließt die in Paket 8 zurückgestellte Lücke – öffentliches Fotografenprofil.

- `src/pages/racepic/RacePicPhotographerPage.tsx` (neu), Route `/racepic/fotografen/:slug`:
  Name, Copyright-Zeile, Website-/Social-Links, Grid aller veröffentlichten Bilder. Jede Kachel
  verlinkt auf die jeweilige Event-Galerie statt auf eine einzelne Teilnehmerseite – ein Bild
  kann mehreren Fahrern zugeordnet sein (Domain-Modell Abschnitt C), eine eindeutige Zielseite
  gibt es dafür nicht.
- `src/integrations/racepic/publicClient.ts`: `fetchPhotographerProfile` (liest
  `manifests/photographers/{slug}.json` vom CDN, wie die übrigen Manifeste – kein API-Aufruf);
  `RacePicImage.photographer` um `slug` ergänzt.
- `src/pages/racepic/RacePicParticipantPage.tsx`: Fotografenname in der Lightbox verlinkt jetzt
  auf das Profil, wenn ein Slug vorhanden ist (Fotografen ohne Slug – sollte es faktisch nicht
  mehr geben, siehe Backend-Progress – bleiben als reiner Text).
- `src/App.tsx`: Route registriert. Reihenfolge relativ zu `/racepic/:eventSlug` ist wegen React
  Routers Bevorzugung statischer Segmente irrelevant (gleiches Prinzip wie beim
  `/racepic/studio`-Kommentar).
- **Backend-Ergänzung (im MSC-Event-Backend-Repo, nicht hier):** Fotografen-Slug (automatisch bei
  Einladung vergeben) und das neue Manifest gab es vor Paket 12 noch nicht, siehe dortige
  `racepic-progress.md`.
- **Verifiziert:** `tsc --noEmit` und `vite build` (inkl. Sitemap-/Social-Pages-Skripte) fehlerfrei.

## Paket 14 – Ergebnis (2026-09-22)

Erste Umsetzung aus der [UI/UX-Redesign-Roadmap](./racepic-ux-redesign-plan.md) (Pakete 14–18,
nach explizitem Wunsch des Vereins nach dem ersten echten End-to-End-Test).

- `src/components/racepic/RacePicWordmark.tsx` (neu): CSS/Tailwind-Wortmarke ("Race" in der
  Vordergrundfarbe, "Pic" in `text-accent`, `font-heading`/Oswald, leichter Skew), Größen `sm`
  (Nav) und `md`/`lg` (spätere Verwendung, z. B. Hero der Landingpage in Paket 17).
- `src/components/layout/Header.tsx`: Nav-Link zu `/racepic` (Desktop und Mobile) zeigt jetzt die
  Wortmarke statt reinem Text.
- **Verifiziert:** `tsc --noEmit` und `vite build` fehlerfrei.

## Paket 15 – Ergebnis (Website-Teil, 2026-09-22)

Studio-Redesign, siehe [racepic-ux-redesign-plan.md](./racepic-ux-redesign-plan.md). Auf
`feature/racepic-ux-redesign` (nicht `main`, siehe Backend-Progress-Notiz zum selben Paket).

- `src/pages/racepic/StudioLayout.tsx` (neu): Kopfzeile für alle `/racepic/studio/*`-Seiten nach
  dem Login (Wortmarke, Fotografenname, "Abmelden" – bisher nirgends aufrufbar). Bewusst **kein**
  globaler Event-Switcher in der Kopfzeile: `StudioUploadPanel` hat schon eine eigene Event-/
  Lizenzauswahl für den Upload-Zielort, ein zweiter, redundanter Auswahlzustand hätte nur
  verwirrt – "Meine Bilder" hat stattdessen einen eigenen, unabhängigen Event-Filter.
- `src/pages/racepic/StudioPage.tsx`: umgebaut auf `StudioLayout` + Tabs (Hochladen/Meine
  Bilder/Profil) statt einer langen Spalte.
- `src/pages/racepic/StudioImagesPanel.tsx` (neu, "Meine Bilder"): Grid der eigenen Uploads
  (Thumbnail, Verarbeitungsstatus, Sichtbarkeits-Badge), Event-Filter, "Verbergen"-/"Löschen"-
  Aktionen gegen die neuen Backend-Endpunkte. `listMyImages` existierte als API-Client-Funktion
  bereits, wurde aber nirgends verwendet.
- `src/pages/racepic/StudioProfilePanel.tsx` (neu, "Profil"): Formular gegen `updateMyProfile()`
  (Anzeigename, Copyright-Zeile, Website, Instagram/Facebook, Standard-Lizenz), plus eine
  deaktivierte Karte "Zahlungen & Auszahlung – kommt mit dem RacePic-Shop" als Ankündigung ohne
  Versprechen (echte Stripe-Connect-Einbindung folgt erst nach der Rechtsprüfung, siehe
  `racepic-open-items.md`).
- `src/pages/racepic/StudioLicensesPage.tsx` (neu), Route `/racepic/studio/lizenzen`: Karten je
  Lizenz mit Titel/Kurzbeschreibung/Namensnennungs-Hinweis aus `fetchLicenses()` – verlinkt aus
  dem Lizenz-Auswahlfeld im Profil-Formular.
- `src/integrations/racepic/client.ts`: `UploadedImage` um `thumbUrl` ergänzt; neue
  `hideMyImage`/`deleteMyImage`-Funktionen gegen die neuen Backend-Endpunkte.
- **Verifiziert:** `tsc --noEmit` und `vite build` fehlerfrei. Kein Browser-Test in dieser
  Sandbox möglich – bitte lokal gegenprüfen (`npm run dev`, `.env.local` zeigt bereits auf die
  echte Prod-API).

## Entscheidungen aus diesem Repo

- 2026-09-21: Fotografenbereich liegt auf der Website unter `/racepic/studio` (nicht im Nennungstool-Frontend), da gleiche Marke/Domain wie die öffentliche Galerie und Passkeys an `msc-oberlausitz.de` gebunden sind.
- 2026-09-21: Öffentliche Galerie liest vorberechnete JSON-Manifeste aus CloudFront; Suche läuft clientseitig, kein eigener Suchservice nötig.
- 2026-09-21: Lightbox-Frage aus Paket 2 entschieden: eigene, auf dem bestehenden `ImageGallerySection.tsx`-Dialog-Muster basierende Lightbox statt PhotoSwipe – keine neue Abhängigkeit, konsistent mit dem Rest der Website.

## Bugfix (2026-09-22, gefunden beim ersten echten Login-Test gegen prod)

Der Code-Eingabe-Dialog in `StudioLoginPage.tsx`/`StudioInvitationPage.tsx` (Paket 2) hatte
`InputOTP maxLength={6}` – Cognito-`EMAIL_OTP`-Codes sind aber **8-stellig**, nicht 6. Dadurch
ließ sich der Login nie abschließen: das Feld blockierte nach dem sechsten Zeichen, der
tatsächliche Code aus der E-Mail passte nie zu dem (unvollständigen) eingegebenen Wert –
`RespondToAuthChallenge` lieferte `CodeMismatchException`. Auf 8 Zeichen korrigiert (beide
Dateien: `InputOTP`, `InputOTPSlot`-Array, `disabled`-Bedingung des Submit-Buttons).

## Bugfix (2026-09-22, gefunden beim ersten echten Claim-Test gegen prod)

Nach erfolgreichem Login (Login-Bug oben behoben) schlug `POST /photographer/claim` mit 403
fehl (`EMAIL_NOT_VERIFIED`), `GET /photographer/me` mit "Profil konnte nicht geladen werden".
**Ursache:** `client.ts` schickte das **Access-Token** als Bearer-Token. Cognito-Access-Tokens
tragen aber keine `email`/`email_verified`-Claims (nur `sub`, `client_id`, `scope`, `auth_time`
etc.) – `getPhotographerAuthContext` im Backend (`auth.ts`, MSC-Event-Backend) braucht diese
Claims aber direkt aus dem JWT. Das ID-Token hat sie (plus ein echtes `aud`-Claim, das zum
`jwtAudience`-Check des API-Gateway-Authorizers sauber passt statt über die
Cognito-`client_id`-Sonderbehandlung für Access-Tokens zu laufen). **Fix:** neue
`getPhotographerIdToken()` in `session.ts`, `client.ts` sendet jetzt das ID-Token statt des
Access-Tokens als `Authorization`-Header für alle authentifizierten RacePic-Aufrufe.

## Offene Punkte

- OG-Bilder pro Teilnehmer sind nicht Teil des MVP (nur ein statisches RacePic-OG-Bild).
- Dynamische Sitemap-Einträge pro Event/Teilnehmer fehlen (nur der statische `/racepic`-Einstieg ist gelistet) – bräuchte einen Sitemap-Build-Schritt, der das RacePic-CDN-Manifest abfragt.
- Kein Rate-Limiting auf dem Download-Endpunkt (siehe Backend-Progress-Notiz in MSC-Event-Backend).
- Passkey-Login (WEB_AUTHN) im Studio ist noch nicht implementiert, nur Email-OTP (siehe Paket 2 – Ergebnis). Nachziehen, sobald der Marketplace-Step-up (`strong`) ansteht.
- E-Mail-Änderung im Profil ist bewusst nicht Teil von `PATCH /photographer/me` (braucht Stufe „recent“ + Cognito-Attributänderung, Backend-seitig ebenfalls noch offen).
