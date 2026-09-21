<!-- Nur die Architektur (racepic-architecture.md) wird 1:1 in allen 3 Repos synchron gehalten. Diese Fortschrittsdatei ist repo-spezifisch und listet nur die Arbeitspakete, die in msc-website passieren. -->
# RacePic – Fortschritt (msc-website)

**Stand:** 2026-09-21 · Architektur: [racepic-architecture.md](./racepic-architecture.md) · Lizenzen: [../racepic/licenses.md](../racepic/licenses.md)

## Arbeitspakete in diesem Repo

| # | Paket | Status | Notiz |
|---|---|---|---|
| 2b | Identität (Website-Teil): `/racepic/studio` Login (Email-OTP), Einladung/Claim-UI, Profil | **erledigt (Email-OTP; Passkeys offen)** | siehe „Paket 2 – Ergebnis“ unten; Backend-Teil siehe MSC-Event-Backend |
| 3b | Upload (Website-Teil): Studio-Uploader (eigener Client statt Uppy, s. u.), Event-/Lizenzwahl | **erledigt** | siehe „Paket 3 – Ergebnis“ unten; Backend-Teil siehe MSC-Event-Backend |
| 8 | Öffentliches RacePic: Routen `/racepic`, `/racepic/:event`, `/racepic/:event/:participant`, `/racepic/fotografen/:slug`; Suche, Galerie, Lightbox, Download-Dialog mit Lizenzanzeige | offen | Routing in `src/App.tsx`, Sitemap in `scripts/generate-sitemap.mjs`, Navigation in `Header.tsx` |
| 10b | Pilot 12. OLD 2026 (Website-Teil): Event veröffentlichen, i18n-Texte | offen | |

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

## Entscheidungen aus diesem Repo

- 2026-09-21: Fotografenbereich liegt auf der Website unter `/racepic/studio` (nicht im Nennungstool-Frontend), da gleiche Marke/Domain wie die öffentliche Galerie und Passkeys an `msc-oberlausitz.de` gebunden sind.
- 2026-09-21: Öffentliche Galerie liest vorberechnete JSON-Manifeste aus CloudFront; Suche läuft clientseitig, kein eigener Suchservice nötig.

## Offene Punkte

- Auswahl/Einbindung einer Lightbox-Bibliothek für die Galerie (Vorschlag im Architekturplan: PhotoSwipe) statt der bisher mehrfach duplizierten Dialog-Lightboxen.
- OG-Bilder pro Teilnehmer sind nicht Teil des MVP (nur ein statisches RacePic-OG-Bild).
- Passkey-Login (WEB_AUTHN) im Studio ist noch nicht implementiert, nur Email-OTP (siehe Paket 2 – Ergebnis). Nachziehen, sobald der Marketplace-Step-up (`strong`) ansteht.
- E-Mail-Änderung im Profil ist bewusst nicht Teil von `PATCH /photographer/me` (braucht Stufe „recent“ + Cognito-Attributänderung, Backend-seitig ebenfalls noch offen).
