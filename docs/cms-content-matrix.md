# CMS Soll-Matrix (Frontend <-> PocketBase)

Stand: 11.04.2026  
Prinzip: `DE ist führend`, EN/CZ als Übersetzungen pro Datensatz (`locale`).

## Global (Layout)
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Logo (Header/Footer) | `logo` | `siteSettings` | optional |
| Logo-Alt | `logoAlt` | `siteSettings` | optional |
| Vereinsname | `siteName` | `siteSettings` | required |
| Kurzname (Fallback-Badge) | `siteShortName` | `siteSettings` | optional |
| Kontakt-E-Mail global | `contactEmail` | `siteSettings` | required |
| Kontakt-Telefon | `contactPhone` | `siteSettings` | optional |
| Adresse | `address` | `siteSettings` | optional |
| Facebook-Link | `facebookUrl` | `siteSettings` | optional |
| Instagram-Link | `instagramUrl` | `siteSettings` | optional |
| Gründungsjahr (Stats) | `foundingYear` | `siteSettings` | optional |
| Mitgliederzahl (Stats) | `memberCount` | `siteSettings` | optional |
| Sektionszahl (Stats) | `sectionCount` | `siteSettings` | optional |

## Startseite (`/`)
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Hero-Titel (ohne Hauptevent) | `title` (`pageKey=home`,`sectionKey=hero`) | `pageContents` | required |
| Hero-Untertitel (ohne Hauptevent) | `subtitle` (`home/hero`) | `pageContents` | required |
| Hero bei Hauptevent: Titel | `title` | `calendarEvents` | required |
| Hero bei Hauptevent: Datum/Countdown | `startDt`,`endDt`,`isMainEvent`,`published` | `calendarEvents` | required |
| Hero bei Hauptevent: Beschreibung | `description` | `calendarEvents` | optional |
| Club-Teaser Titel | `title` (`home/club_teaser`) | `pageContents` | required |
| Club-Teaser Untertitel | `subtitle` (`home/club_teaser`) | `pageContents` | optional |
| Club-Teaser Text | `content` (`home/club_teaser`) | `pageContents` | optional |
| Club-Teaser Bild | `image`,`imageAlt` (`home/club_teaser`) | `pageContents` | optional |
| Upcoming-Sektion Überschrift | `title` (`home/upcoming_events`) | `pageContents` | required |
| Upcoming-Sektion Unterzeile | `subtitle` (`home/upcoming_events`) | `pageContents` | optional |
| News-Sektion Überschrift | `title` (`home/news`) | `pageContents` | required |
| News-Sektion Unterzeile | `subtitle` (`home/news`) | `pageContents` | optional |
| Sponsors-Sektion Überschrift | `title` (`home/sponsors`) | `pageContents` | required |
| Sponsors-Sektion Unterzeile | `subtitle` (`home/sponsors`) | `pageContents` | optional |

## News
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| News-Listing Header Titel | `title` (`news/intro`) | `pageContents` | required |
| News-Listing Header Unterzeile | `subtitle` (`news/intro`) | `pageContents` | optional |
| News-Titel | `title` | `posts` | required |
| News-Slug | `slug` (unique je locale) | `posts` | required |
| News-Teaser | `excerpt` | `posts` | optional |
| News-Body | `content` | `posts` | optional |
| News-Kategorie | `category` | `posts` | optional |
| News-Bild | `image` | `posts` | optional |
| Pinnung | `isPinned` | `posts` | optional |
| Sichtbarkeit | `published` | `posts` | required |

## Kalender
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Kalender Header Titel | `title` (`calendar/intro`) | `pageContents` | required |
| Kalender Header Unterzeile | `subtitle` (`calendar/intro`) | `pageContents` | optional |
| Termin-Titel | `title` | `calendarEvents` | required |
| Termin-Slug | `slug` (unique je locale) | `calendarEvents` | required |
| Start/Ende | `startDt`,`endDt` | `calendarEvents` | `startDt` required |
| Ort | `location` | `calendarEvents` | optional |
| Beschreibung | `description` | `calendarEvents` | optional |
| Kategorie | `category` | `calendarEvents` | optional |
| Hauptevent-Flag | `isMainEvent` | `calendarEvents` | optional |
| Kontaktmail | `contactEmail` | `calendarEvents` | optional |
| Registrierungslink | `registrationUrl` | `calendarEvents` | optional |
| Sichtbarkeit | `published` | `calendarEvents` | required |

## Veranstaltungsseite (`/event`)
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Fallback-Titel ohne Hauptevent | `title` (`event/intro`) | `pageContents` | optional |
| Fallback-Text ohne Hauptevent | `content` (`event/intro`) | `pageContents` | optional |
| Streckenkarte Bild | `image`,`imageAlt` (`event/track_map`) | `pageContents` | optional |
| Streckenkarte Label/Text | `title`,`content` (`event/track_map`) | `pageContents` | optional |
| **Karten-Embed URL** | `content` (`event/location_map`) | `pageContents` | optional |
| **Anmelde-Hinweise Titel** | `title` (`event/registration_info`) | `pageContents` | optional |
| **Anmelde-Hinweise Text** | `content` (`event/registration_info`) | `pageContents` | optional |
| Galerie-Fallbacktext | `content` (`event/gallery`) | `pageContents` | optional |
| Archiv-Fallbacktext | `content` (`event/archive`) | `pageContents` | optional |
| Zeitplan je Tag | `dayLabel`,`dayNumber`,`entries`,`locale` | `eventSchedules` | required |
| Besucherinfos (Anreise/Eintritt/Fahrerlager) | `section`,`content`,`locale` | `eventInfos` | optional |
| Teilnehmerklassen | `name`,`description`,`icon`,`sortOrder`,`locale` | `participantClasses` | optional |
| Event-Downloads | `title`,`file`,`category=event` | `downloads` | optional |

## Verein
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Über uns Intro | `title`,`subtitle`,`content`,`image`,`imageAlt` (`about/intro`) | `pageContents` | required |
| Über uns Mission | `title`,`content` (`about/mission`) | `pageContents` | optional |
| Über uns Werte | `title`,`content` (`about/values`) | `pageContents` | optional |
| Vorstand Intro | `subtitle`,`content` (`board/intro`) | `pageContents` | optional |
| Vorstand Zusatztext | `content` (`board/members`) | `pageContents` | optional |
| Vorstandsliste | `name`,`role`,`photo`,`email`,`phone`,`sortOrder` | `boardMembers` | required (`name`,`role`) |
| Historie Intro | `subtitle` (`history/intro`) | `pageContents` | optional |
| Historie Timeline | `content` (`history/timeline`) | `pageContents` | required |
| Mitgliedschaft Intro | `subtitle`,`content` (`membership/intro`) | `pageContents` | optional |
| Mitgliedschaft Vorteile Überschrift | `title` (`membership/benefits`) | `pageContents` | optional |
| Mitgliedschaft Beitritt Überschrift | `title` (`membership/how_to_join`) | `pageContents` | optional |
| **Mitgliedschaft CTA** | `title`,`content`,`primaryButtonLabel`,`primaryButtonUrl` (`membership/cta`) | `pageContents` | optional |

## Sektionen
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Motocross Intro/Training/Events | `title`,`subtitle`,`content`,`image`,`imageAlt` je SectionKey | `pageContents` | optional |
| Trial Intro/Training/Events | `title`,`subtitle`,`content`,`image`,`imageAlt` je SectionKey | `pageContents` | optional |
| Touring Intro/Tours/Community | `title`,`subtitle`,`content`,`image`,`imageAlt` je SectionKey | `pageContents` | optional |

## Partner
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Sponsoren Header | `title`,`subtitle` (`sponsors/intro`) | `pageContents` | optional |
| Sponsoren CTA Text | `title`,`content` (`sponsors/cta`) | `pageContents` | optional |
| Sponsoring Kontaktadresse | `sponsoringEmail` | `siteSettings` | optional |
| Sponsoreneinträge | `name`,`logo`,`website`,`tier`,`active`,`sortOrder` | `sponsors` | required (`name`,`tier`) |
| Partnervereine Header/Content | `title`,`subtitle`,`content`,`image`,`imageAlt` (`partner_clubs/intro`) | `pageContents` | optional |

## Kontakt & Recht
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Kontaktseiten-Titel/Unterzeile | `title`,`subtitle` (`contact/intro`) | `pageContents` | optional |
| Kontaktseitentext | `content` (`contact/info`) | `pageContents` | optional |
| Kartenhinweistext | `title`,`content` (`contact/map`) | `pageContents` | optional |
| Karten-Embed | `contactMapEmbedUrl` | `siteSettings` | optional |
| Karten-Link | `contactMapLink` | `siteSettings` | optional |
| Karten-Label | `contactMapLabel` | `siteSettings` | optional |
| Impressum | `title`,`content` (`imprint/content`) | `pageContents` | required |
| Datenschutz | `title`,`content` (`privacy/content`) | `pageContents` | required |

## SEO (aktuell nur CMS-seitig gepflegt)
| Frontend-Element | CMS-Feld | Collection | Pflicht |
|---|---|---|---|
| Seiten-Meta global | `metaTitle`,`metaDescription`,`defaultOgImage` | `siteSettings` | optional |
| Content-Meta pro Seite | `seoTitle`,`seoDescription`,`ogImage` | `pageContents` | optional |
| News/Event-Meta | `seoTitle`,`seoDescription`,`ogImage` | `posts`,`calendarEvents` | optional |

Hinweis: Diese SEO-Felder sind aktuell im Frontend nur eingeschränkt bzw. noch nicht als Meta-Tags verdrahtet.
