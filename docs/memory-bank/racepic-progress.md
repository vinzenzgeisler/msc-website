<!-- Nur die Architektur (racepic-architecture.md) wird 1:1 in allen 3 Repos synchron gehalten. Diese Fortschrittsdatei ist repo-spezifisch und listet nur die Arbeitspakete, die in msc-website passieren. -->
# RacePic – Fortschritt (msc-website)

**Stand:** 2026-09-21 · Architektur: [racepic-architecture.md](./racepic-architecture.md) · Lizenzen: [../racepic/licenses.md](../racepic/licenses.md)

## Arbeitspakete in diesem Repo

| # | Paket | Status | Notiz |
|---|---|---|---|
| 2b | Identität (Website-Teil): `/racepic/studio` Login (Amplify Auth, Email-OTP + Passkeys), Einladung/Claim-UI, Profil | offen | Backend-Teil (Photographer-Pool, Claim-API) siehe MSC-Event-Backend |
| 3b | Upload (Website-Teil): Uppy-basierter Studio-Uploader, Batch-/Bildübersicht | offen | Backend-Teil (Multipart-API) siehe MSC-Event-Backend |
| 8 | Öffentliches RacePic: Routen `/racepic`, `/racepic/:event`, `/racepic/:event/:participant`, `/racepic/fotografen/:slug`; Suche, Galerie, Lightbox, Download-Dialog mit Lizenzanzeige | offen | Routing in `src/App.tsx`, Sitemap in `scripts/generate-sitemap.mjs`, Navigation in `Header.tsx` |
| 10b | Pilot 12. OLD 2026 (Website-Teil): Event veröffentlichen, i18n-Texte | offen | |

## Entscheidungen aus diesem Repo

- 2026-09-21: Fotografenbereich liegt auf der Website unter `/racepic/studio` (nicht im Nennungstool-Frontend), da gleiche Marke/Domain wie die öffentliche Galerie und Passkeys an `msc-oberlausitz.de` gebunden sind.
- 2026-09-21: Öffentliche Galerie liest vorberechnete JSON-Manifeste aus CloudFront; Suche läuft clientseitig, kein eigener Suchservice nötig.

## Offene Punkte

- Auswahl/Einbindung einer Lightbox-Bibliothek für die Galerie (Vorschlag im Architekturplan: PhotoSwipe) statt der bisher mehrfach duplizierten Dialog-Lightboxen.
- OG-Bilder pro Teilnehmer sind nicht Teil des MVP (nur ein statisches RacePic-OG-Bild).
