import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation, useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  Download,
  Image,
  Clock,
  Car,
  Bike,
  Info,
  ExternalLink,
  ClipboardList,
  Ticket,
  ParkingCircle,
  Bus,
  Camera,
  Shield,
  Map,
  BedDouble,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMainEvent } from '@/hooks/useMainEvent';
import { useEventContent } from '@/hooks/useEventContent';
import { useDownloads } from '@/hooks/useDownloads';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useMediaAlbums, useMediaFiles } from '@/hooks/useMedia';
import { useContentWithFallback, useSectionContent } from '@/hooks/usePageContent';
import { useSettings } from '@/hooks/useSettings';
import { parseSelectedDownloadIds } from '@/lib/download-selection';
import { format } from 'date-fns';
import { getDateFnsLocale, localize } from '@/i18n/locale-utils';
import { trackEvent } from '@/lib/analytics';

const iconMap = {
  bike: Bike,
  car: Car,
  users: Users,
} as const;

export default function EventPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: mainEvent, isLoading } = useMainEvent();
  const { data: settings } = useSettings();
  const { data: allEvents } = useCalendarEvents(false);
  const { data: eventContent } = useEventContent(mainEvent?.id);
  const { data: downloads } = useDownloads();
  const { data: selectedDownloadsContent } = useSectionContent('event', 'downloads');
  const { data: albums } = useMediaAlbums();
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const l = <T,>(values: { de: T; cz: T; en: T; pl: T }) => localize(locale, values);
  const eventIntro = useContentWithFallback('event', 'intro', {
    title: l({
      de: 'Das Oberlausitzer Dreieck',
      cz: 'Oberlausitzer Dreieck',
      en: 'The Oberlausitzer Dreieck',
      pl: 'Oberlausitzer Dreieck',
    }),
    content: l({
      de: 'Erleben Sie mitten im Zittauer Gebirge eine spannende Motorshow auf der legendaeren 5,9 km langen Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf.',
      cz: 'Zazijte napinavou motoristickou show uprostred Zitavskych hor na legendarni 5,9 km dlouhe trati mezi Saalendorfem, Jonsdorfem a Waltersdorfem.',
      en: 'Experience an exciting motor show in the heart of the Zittau Mountains on the legendary 5.9 km track between Saalendorf, Jonsdorf and Waltersdorf.',
      pl: 'Poznaj emocjonujace show motorsportowe w samym sercu Gor Zytawskich na legendarnej trasie 5,9 km pomiedzy Saalendorfem, Jonsdorfem i Waltersdorfem.',
    }),
  });
  const trackMapContent = useContentWithFallback('event', 'track_map', {
    title: l({ de: 'Streckenkarte', cz: 'Mapa trate', en: 'Track map', pl: 'Mapa trasy' }),
    content: '',
  });
  const locationMapContent = useContentWithFallback('event', 'location_map', {
    title: '',
    content: '',
  });
  const registrationContent = useContentWithFallback('event', 'registration_info', {
    title: l({ de: 'Sei dabei!', cz: 'Bud u toho!', en: 'Join Us!', pl: 'Dolacz do nas!' }),
    content: l({
      de: 'Du willst nicht nur zuschauen, sondern selbst Gas geben? Dann melde dich jetzt an und werde Teil des Oberlausitzer Dreiecks! Wir freuen uns auf dich und deine Maschine.',
      cz: 'Nechces jen prihlizet, ale sam pridat plyn? Prihlas se a stan se soucasti Horniho Luzickeho trojuhelniku! Tesime se na tebe a tvuj stroj.',
      en: 'Don\'t just watch - get behind the handlebars! Register now and become part of the Oberlausitz Triangle. We look forward to seeing you and your machine on the track!',
      pl: 'Nie chcesz tylko patrzec, ale sam dodac gazu? Zarejestruj sie i zostan czescia Oberlausitzer Dreieck! Czekamy na ciebie i twoja maszyne.',
    }),
  });
  const admissionContent = useContentWithFallback('event', 'visitors_admission', {
    title: l({ de: 'Eintrittspreise', cz: 'Vstupne', en: 'Admission', pl: 'Cennik' }),
    content: l({
      de: 'Tagesticket: 10 EUR | Wochenendticket: 15 EUR - Kinder und Jugendliche unter 14 Jahren haben freien Eintritt.',
      cz: 'Denni vstupenka: 10 EUR | Vikendova vstupenka: 15 EUR - Deti do 14 let maji vstup zdarma.',
      en: 'Day ticket: EUR10 | Weekend ticket: EUR15 - Children under 14 get free admission.',
      pl: 'Bilet jednodniowy: 10 EUR | Bilet weekendowy: 15 EUR - Dzieci do 14 lat wchodza za darmo.',
    }),
  });
  const scheduleOverviewContent = useContentWithFallback('event', 'visitors_schedule', {
    title: l({ de: 'Ablauf', cz: 'Prubeh', en: 'Schedule Overview', pl: 'Przebieg wydarzenia' }),
    content: l({
      de: 'Samstag: 8:00-ca. 18:00 Uhr Trainingslaeufe, 20:00 Uhr Abendveranstaltung mit Livemusik. Sonntag: 8:00-ca. 18:00 Uhr Demolaeufe.',
      cz: 'Sobota: 8:00-cca 18:00 treninky, 20:00 vecerni akce s zivou hudbou. Nedele: 8:00-cca 18:00 ukazkove jizdy.',
      en: 'Saturday: 8:00 AM-approx. 6:00 PM practice runs, 8:00 PM evening event with live music. Sunday: 8:00 AM-approx. 6:00 PM demo runs.',
      pl: 'Sobota: 8:00-ok. 18:00 treningi, 20:00 wieczorne wydarzenie z muzyka na zywo. Niedziela: 8:00-ok. 18:00 przejazdy pokazowe.',
    }),
  });
  const parkingContent = useContentWithFallback('event', 'visitors_parking', {
    title: l({ de: 'Parkplaetze & Shuttle', cz: 'Parkovani a shuttle', en: 'Parking & Shuttle', pl: 'Parking i shuttle' }),
    content: l({
      de: 'Parkplaetze sind ausgeschildert und kostenlos. An der Strecke gibt es kostenlose Shuttlebusse, welche die Besucher zu den Zuschauerbereichen fahren.',
      cz: 'Parkoviste jsou oznacena a zdarma. Na trati jsou k dispozici bezplatne autobusy, ktere navstevniky zavezou k divackym zonam.',
      en: 'Parking areas are signposted and free of charge. Free shuttle buses run along the track to take spectators to viewing areas.',
      pl: 'Parkingi sa oznaczone i bezplatne. Wzdluz trasy kursuja bezplatne busy shuttle dowozace widzow do stref kibica.',
    }),
  });
  const paddockContent = useContentWithFallback('event', 'visitors_paddock', {
    title: l({ de: 'Fahrerlager', cz: 'Depo', en: 'Paddock', pl: 'Padok' }),
    content: l({
      de: 'Die beiden Fahrerlager sind auch fuer die Zuschauer zugaenglich.',
      cz: 'Obe depa jsou pristupna i pro divaky.',
      en: 'Both paddock areas are open to spectators.',
      pl: 'Obie strefy padoku sa dostepne rowniez dla widzow.',
    }),
  });
  const photographerContent = useContentWithFallback('event', 'visitors_photographers', {
    title: l({ de: 'Fotografen', cz: 'Fotografove', en: 'Photographers', pl: 'Fotografowie' }),
    content: l({
      de: 'Die Fotografenbereiche sind farblich gekennzeichnet und dürfen nur von akkreditierten Fotografen betreten werden. Die Absperrungen dürfen nicht überschritten werden!',
      cz: 'Fotograficke zony jsou barevne oznaceny a pristupne pouze akreditovanym fotografum. Zabrany se nesmi prekracovat!',
      en: 'Photographer zones are color-coded and may only be entered by accredited photographers. Barriers must not be crossed!',
      pl: 'Strefy dla fotografow sa oznaczone kolorami i dostepne tylko dla akredytowanych fotografow. Nie wolno przekraczac barierek!',
    }),
  });
  const privacyNoticeContent = useContentWithFallback('event', 'visitors_privacy', {
    title: l({ de: 'Datenschutzhinweis', cz: 'Ochrana osobnich udaju', en: 'Privacy Notice', pl: 'Informacja o ochronie danych' }),
    content: l({
      de: 'Im Rahmen unserer Veranstaltungen behalten wir uns vor, Bild- und Tonaufnahmen von Beteiligten und Gaesten zu Zwecken der PR- und Oeffentlichkeitsarbeit zu erstellen, zu verarbeiten und zu verbreiten, soweit diese nicht im Einzelfall widersprechen. Mit der Anmeldung/Nennung erklaeren sich die Teilnehmer damit einverstanden, dass Aufnahmen waehrend der Veranstaltung gemacht werden, die ohne Verguetungsanspruch fuer diese Zwecke verwendet werden duerfen.',
      cz: 'V ramci nasich akci si vyhrazujeme pravo porizovat obrazove a zvukove zaznamy ucastniku a hostu pro ucely PR a verejne komunikace.',
      en: 'During our events, we reserve the right to create, process, and distribute photo and audio recordings of participants and guests for PR and public relations purposes, unless individually objected to.',
      pl: 'W ramach naszych wydarzen zastrzegamy sobie prawo do tworzenia, przetwarzania i publikowania zdjec oraz nagran audio uczestnikow i gosci do celow PR i komunikacji publicznej, o ile nie zloza oni indywidualnego sprzeciwu.',
    }),
  });
  const transportContent = useContentWithFallback('event', 'visitors_transport', {
    title: l({ de: 'Oeffentliche Verkehrsmittel', cz: 'Verejna doprava', en: 'Public Transport', pl: 'Transport publiczny' }),
    content: l({
      de: 'Aenderungen der Fahrplaene der oeffentlichen Verkehrsmittel werden rechtzeitig aktualisiert.',
      cz: 'Zmeny jizdnich radu verejne dopravy budou vcas aktualizovany.',
      en: 'Public transport schedule changes will be updated in a timely manner.',
      pl: 'Zmiany w rozkladach jazdy transportu publicznego beda aktualizowane na biezaco.',
    }),
  });
  const siteMapContent = useContentWithFallback('event', 'visitors_site_map', {
    title: l({ de: 'Lageplan', cz: 'Plan arealu', en: 'Site Map', pl: 'Plan terenu' }),
    content: '',
  });
  const galleryContent = useContentWithFallback('event', 'gallery', {
    content: l({
      de: 'Noch keine Galerie hinterlegt.',
      cz: 'Zatim neni k dispozici zadna galerie.',
      en: 'No gallery has been added yet.',
      pl: 'Galeria nie zostala jeszcze dodana.',
    }),
  });
  const archiveContent = useContentWithFallback('event', 'archive', {
    content: l({
      de: 'Noch keine Archivdaten hinterlegt.',
      cz: 'Zatim nejsou k dispozici zadna archivni data.',
      en: 'No archive data has been added yet.',
      pl: 'Nie dodano jeszcze zadnych danych archiwalnych.',
    }),
  });

  const dateLocale = getDateFnsLocale(locale);
  const germanMainEvent = (allEvents || []).find((event) => event.locale === 'de' && event.is_main_event && event.published);
  const galleryAlbumSlug = germanMainEvent?.slug ? `event-${germanMainEvent.slug}` : mainEvent?.slug ? `event-${mainEvent.slug}` : null;
  const galleryAlbum = galleryAlbumSlug ? albums?.find((album) => album.slug === galleryAlbumSlug) : null;
  const { data: galleryFiles, isLoading: galleryFilesLoading } = useMediaFiles(galleryAlbum?.id);
  const openGalleryImage = (index: number) => setSelectedGalleryIndex(index);
  const closeGalleryImage = () => setSelectedGalleryIndex(null);
  const showPreviousGalleryImage = () => {
    if (!galleryFiles || selectedGalleryIndex === null) return;
    setSelectedGalleryIndex((selectedGalleryIndex - 1 + galleryFiles.length) % galleryFiles.length);
  };
  const showNextGalleryImage = () => {
    if (!galleryFiles || selectedGalleryIndex === null) return;
    setSelectedGalleryIndex((selectedGalleryIndex + 1) % galleryFiles.length);
  };

  const formatEventDate = (startDt: string, endDt: string | null) => {
    const start = new Date(startDt);
    const end = endDt ? new Date(endDt) : null;
    if (end) {
      return `${format(start, 'd.', { locale: dateLocale })}/${format(end, 'd. MMMM yyyy', { locale: dateLocale })}`;
    }
    return format(start, 'd. MMMM yyyy', { locale: dateLocale });
  };

  const defaultClasses = [
    { name: 'Klasse 1 Motorräder bis Bj. 1949', icon: Bike, description: '' },
    { name: 'Klasse 2 Rennmotorräder 50–80 cm³ bis Bj. 1995', icon: Bike, description: '' },
    { name: 'Klasse 3 Rennmotorräder 125–175 cm³ bis Bj. 1995', icon: Bike, description: '' },
    { name: 'Klasse 4 Rennmotorräder 250 cm³ bis Bj. 1995', icon: Bike, description: '' },
    { name: 'Klasse 5 Rennmotorräder 350–400 cm³ bis Bj. 1995', icon: Bike, description: '' },
    { name: 'Klasse 6 Rennmotorräder 500–1000 cm³ bis Bj. 1995', icon: Bike, description: '' },
    { name: 'Klasse 7 Seitenwagen offen', icon: Car, description: '' },
    { name: 'Klasse 8 Rennmotorräder offen für Aktive und Ehemalige', icon: Bike, description: '' },
    { name: 'Klasse 9 Formelwagen bis Baujahr 1995', icon: Car, description: '' },
    { name: 'Klasse 10 Tourenwagen geschlossen bis Bj. 1995', icon: Car, description: '' },
    { name: 'Klasse 11 Kart', icon: Car, description: '' },
    { name: 'Nachwuchs', icon: Users, description: '' },
    { name: 'Sonderlauf', icon: Users, description: '' },
  ];

  const schedules = eventContent?.schedules || [];
  const participantClasses =
    eventContent?.classes?.length
      ? eventContent.classes.map((item) => ({
          icon: iconMap[item.icon],
          name: item.name,
          description: item.description || '',
        }))
      : defaultClasses;
  const trackInfo = eventContent?.infos?.find((item) => item.section === 'track');
  const arrivalInfo = eventContent?.infos?.find((item) => item.section === 'visitors_arrival');
  const admissionInfo = eventContent?.infos?.find((item) => item.section === 'visitors_admission');
  const paddockInfo = eventContent?.infos?.find((item) => item.section === 'visitors_paddock');
  const registrationInfo = eventContent?.infos?.find((item) => item.section === 'registration');
  const selectedDownloadIds = parseSelectedDownloadIds(selectedDownloadsContent?.content);
  const selectedEventDownloads = selectedDownloadIds
    .map((id) => (downloads || []).find((item) => item.id === id))
    .filter(Boolean);
  const eventDownloads = selectedEventDownloads.length > 0
    ? selectedEventDownloads
    : (downloads || []).filter((item) => item.category === 'event');

  const mapEmbedUrl = locationMapContent.content || null;
  const googleMapsLink = locationMapContent.primary_button_url
    || (mainEvent?.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mainEvent.location)}`
      : 'https://maps.app.goo.gl/8ynVfs7AgjRU1Qem6');

  const eventStructuredData = mainEvent ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: mainEvent.title,
    description: mainEvent.description || eventIntro.content || undefined,
    startDate: mainEvent.start_dt,
    endDate: mainEvent.end_dt || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: mainEvent.location ? {
      '@type': 'Place',
      name: mainEvent.location,
      address: mainEvent.location,
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.',
      url: 'https://www.msc-oberlausitz.de',
    },
    image: settings?.default_og_image_url ? [settings.default_og_image_url] : undefined,
    url: 'https://www.msc-oberlausitz.de/event',
  } : undefined;

  return (
      <MainLayout
        title={mainEvent?.title || eventIntro.title}
        description={mainEvent?.description || eventIntro.content || undefined}
        canonicalPath="/event"
        structuredData={eventStructuredData}
      >
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
          <div className="absolute inset-0">
            <div className="racing-stripe h-full w-full" />
          </div>
          <div className="absolute -right-36 top-0 h-full w-40 skew-x-[-15deg] bg-accent" />

          <div className="container relative z-10 pr-16 sm:pr-24 md:pr-32">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-40 mb-4 bg-primary-foreground/20" />
                <Skeleton className="h-16 w-96 mb-4 bg-primary-foreground/20" />
                <Skeleton className="h-8 w-[600px] bg-primary-foreground/20" />
              </>
            ) : mainEvent ? (
              <>
                <Badge className="mb-4 bg-accent text-accent-foreground">
                  {formatEventDate(mainEvent.start_dt, mainEvent.end_dt)}
                </Badge>
                <h1 className="mb-4 text-5xl font-black uppercase md:text-6xl">
                  {mainEvent.title}
                </h1>
                <p className="max-w-2xl text-xl text-primary-foreground/80">
                  {mainEvent.description || eventIntro.content}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" asChild>
                    {mainEvent.registration_url ? (
                      <a
                        href={mainEvent.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('event_registration_click', { category: 'conversion', label: 'event_hero' })}
                      >
                        <ClipboardList className="h-5 w-5" />
                        {l({ de: 'Zur Anmeldung', cz: 'Prihlasit se', en: 'Register Now', pl: 'Do rejestracji' })}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <a href="#registration">
                        <ClipboardList className="h-5 w-5" />
                        {l({ de: 'Zur Anmeldung', cz: 'Prihlasit se', en: 'Register Now', pl: 'Do rejestracji' })}
                      </a>
                    )}
                  </Button>
                  {registrationContent.isLoading ? (
                    <Skeleton className="h-12 w-64 bg-primary-foreground/20" />
                  ) : (registrationContent.attachment_url || registrationContent.secondary_button_url) && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold"
                      asChild
                    >
                      <a
                        href={registrationContent.attachment_url || registrationContent.secondary_button_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('event_download', { category: 'engagement', label: 'event_page:registration_document' })}
                      >
                        <Download className="h-5 w-5" />
                        {registrationContent.secondary_button_label
                          || registrationContent.attachment_name
                          || l({ de: 'Download Ausschreibung', cz: 'Stahnout propozice', en: 'Download Regulations', pl: 'Pobierz regulamin' })}
                      </a>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Badge className="mb-4 bg-accent text-accent-foreground">
                  {l({ de: 'Keine Veranstaltung hinterlegt', cz: 'Zadna akce neni nastavena', en: 'No event configured', pl: 'Nie skonfigurowano zadnego wydarzenia' })}
                </Badge>
                <h1 className="mb-4 text-5xl font-black uppercase md:text-6xl">
                  {eventIntro.title}
                </h1>
                <p className="max-w-2xl text-xl text-primary-foreground/80">
                  {eventIntro.content}
                </p>
              </>
            )}
          </div>
        </section>

        {/* Navigation bar */}
        <section className="border-b border-border bg-muted/50 py-4">
          <div className="container">
            <div className="flex flex-wrap gap-2">
              {[
                { href: '#track', label: t.event.track, icon: MapPin },
                { href: '#schedule', label: t.event.schedule, icon: Clock },
                { href: '#classes', label: t.event.classes.title, icon: Users },
                { href: '#registration', label: l({ de: 'Anmeldung', cz: 'Prihlaska', en: 'Registration', pl: 'Rejestracja' }), icon: ClipboardList },
                { href: '#visitors', label: t.event.visitors, icon: Info },
                { href: '#downloads', label: t.event.downloads, icon: Download },
                { href: '/event/accommodation', label: l({ de: 'Übernachtung', cz: 'Ubytovani', en: 'Accommodation', pl: 'Noclegi' }), icon: BedDouble, isLink: true },
              ].map((item) => {
                if ('isLink' in item && item.isLink) {
                  return (
                    <Button key={item.href} variant="outline" size="sm" asChild>
                      <Link to={item.href}>
                        <item.icon className="mr-1 h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                }
                return (
                  <Button key={item.href} variant="outline" size="sm" asChild>
                    <a href={item.href}>
                      <item.icon className="mr-1 h-4 w-4" />
                      {item.label}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Track & Region */}
        <section id="track" className="py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.track}</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-4 text-lg text-muted-foreground">
                  {trackInfo?.content ||
                    trackMapContent.content ||
                    l({
                      de: 'Die legendaere 5,9 km lange Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf bietet Motorsport-Fans ein unvergessliches Erlebnis mitten im Zittauer Gebirge.',
                      cz: 'Legendarni 5,9 km dlouha trat mezi Saalendorfem, Jonsdorfem a Waltersdorfem nabizi fanouskum motorsportu nezapomenutelny zazitek uprostred Zitavskych hor.',
                      en: 'The legendary 5.9 km track between Saalendorf, Jonsdorf and Waltersdorf offers motorsport fans an unforgettable experience in the heart of the Zittau Mountains.',
                      pl: 'Legendarna trasa 5,9 km pomiedzy Saalendorfem, Jonsdorfem i Waltersdorfem oferuje fanom motorsportu niezapomniane wrazenia w samym sercu Gor Zytawskich.',
                    })}
                </p>
                {mainEvent?.location && (
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{mainEvent.location}</span>
                    </li>
                  </ul>
                )}
                {googleMapsLink && (
                  <Button className="mt-2" asChild>
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('map_click', { category: 'outbound', label: 'event_page:google_maps' })}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {locationMapContent.primary_button_label
                        || l({ de: 'In Google Maps oeffnen', cz: 'Otevrit v Google Maps', en: 'Open in Google Maps', pl: 'Otworz w Google Maps' })}
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
              <div className="relative">
                {trackMapContent.image_url ? (
                  <img
                    src={trackMapContent.image_url}
                    alt={trackMapContent.image_alt || trackMapContent.title}
                    className="h-80 w-full border border-border object-cover"
                  />
                ) : (
                  <iframe
                    title={l({ de: 'Streckenkarte', cz: 'Mapa trate', en: 'Track Map', pl: 'Mapa trasy' })}
                    src={mapEmbedUrl || 'https://umap.openstreetmap.de/de/map/oberlausitzer-dreieck_132460?scaleControl=false&miniMap=false&scrollWheelZoom=true&zoomControl=false&editMode=disabled&moreControl=false&searchControl=false&tilelayersControl=false&embedControl=false&datalayersControl=false&onLoadPanel=none&captionBar=false&captionMenus=false&homeControl=false&fullscreenControl=false&captionControl=false'}
                    className="h-80 w-full border border-border rounded-md"
                    loading="lazy"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Classes */}
        <section id="classes" className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.classes.title}</h2>
            <p className="mb-6 text-muted-foreground">
              {l({
                de: 'In diesen Klassen wird beim Oberlausitzer Dreieck gestartet:',
                cz: 'V techto tridach se na Hornim Luzickem trojuhelniku zavodi:',
                en: 'These are the classes competing at the Oberlausitz Triangle:',
                pl: 'W tych klasach startuja uczestnicy Oberlausitzer Dreieck:',
              })}
            </p>
            {participantClasses.length > 0 ? (
              <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                <CarouselContent className="-ml-3">
                  {participantClasses.map((cls, i) => (
                    <CarouselItem key={cls.name} className="pl-3 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-5 text-center">
                        <cls.icon className="mb-3 h-8 w-8 text-primary" />
                        {i < 11 && (
                          <span className="mb-1 text-xs font-bold text-primary">Klasse {i + 1}</span>
                        )}
                        <span className="text-sm font-medium leading-tight">
                          {cls.name.replace(/^Klasse \d+\s*/, '')}
                        </span>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 border-primary text-primary" />
                <CarouselNext className="-right-4 border-primary text-primary" />
              </Carousel>
            ) : (
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  {l({
                    de: 'Die Klassen werden rechtzeitig vor der Veranstaltung veröffentlicht.',
                    cz: 'Tridy budou zverejneny vcas pred akci.',
                    en: 'Classes will be published in time before the event.',
                    pl: 'Klasy zostana opublikowane odpowiednio wczesnie przed wydarzeniem.',
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Registration */}
        <section id="registration" className="relative overflow-hidden py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <ClipboardList className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h2 className="mb-4">{registrationContent.title}</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {registrationInfo?.content || registrationContent.content}
              </p>
              {mainEvent?.registration_url ? (
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" asChild>
                  <a
                    href={mainEvent.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('event_registration_click', { category: 'conversion', label: 'event_registration_section' })}
                  >
                    <ClipboardList className="h-5 w-5" />
                    {l({ de: 'Zur Anmeldung', cz: 'K registracnimu portalu', en: 'Go to Registration Portal', pl: 'Przejdz do portalu rejestracji' })}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {l({ de: 'Das Anmeldeportal wird rechtzeitig vor der Veranstaltung freigeschaltet.', cz: 'Registracni portal bude otevren vcas pred akci.', en: 'The registration portal will be opened in time before the event.', pl: 'Portal rejestracyjny zostanie uruchomiony odpowiednio wczesnie przed wydarzeniem.' })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section id="schedule" className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.schedule}</h2>
            {schedules.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-2">
                {schedules.map((day) => (
                  <Card key={`${day.day_label}-${day.day_number}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {day.day_label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {day.entries.map((item, index) => (
                          <li key={`${day.day_number}-${index}`} className="flex gap-4 border-b border-border pb-3 last:border-0">
                            <span className="w-14 shrink-0 font-mono text-sm font-semibold text-primary">{item.time}</span>
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  {l({ de: 'Der Zeitplan wurde noch nicht veröffentlicht.', cz: 'Harmonogram jeste nebyl zverejnen.', en: 'The schedule has not been published yet.', pl: 'Harmonogram nie zostal jeszcze opublikowany.' })}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Visitors */}
        <section id="visitors" className="py-16">
          <div className="container">
            <h2 className="mb-10">{t.event.visitors}</h2>

            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: Ticket, title: l({ de: 'Tagesticket', cz: 'Denni vstupenka', en: 'Day Ticket', pl: 'Bilet jednodniowy' }), value: '10 €' },
                { icon: Ticket, title: l({ de: 'Wochenende', cz: 'Vikend', en: 'Weekend', pl: 'Weekend' }), value: '15 €' },
                { icon: Users, title: l({ de: 'Kinder < 14', cz: 'Deti < 14', en: 'Kids < 14', pl: 'Dzieci < 14' }), value: l({ de: 'Frei', cz: 'Zdarma', en: 'Free', pl: 'Gratis' }) },
                { icon: ParkingCircle, title: l({ de: 'Parkplaetze', cz: 'Parkovani', en: 'Parking', pl: 'Parking' }), value: l({ de: 'Kostenlos', cz: 'Zdarma', en: 'Free', pl: 'Gratis' }) },
              ].map((fact) => (
                <div key={fact.title} className="flex flex-col items-center border border-border bg-card p-4 text-center">
                  <fact.icon className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fact.title}</span>
                  <span className="mt-1 font-display text-2xl font-bold text-foreground">{fact.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-10">
              {[
                { icon: Clock, title: scheduleOverviewContent.title, content: scheduleOverviewContent.content },
                { icon: ParkingCircle, title: parkingContent.title, content: parkingContent.content },
                { icon: Car, title: paddockContent.title, content: paddockContent.content },
                { icon: Bus, title: transportContent.title, content: transportContent.content },
                { icon: Camera, title: photographerContent.title, content: photographerContent.content, image: photographerContent.image_url, imageAlt: photographerContent.image_alt },
              ].filter((item) => item.content).map((item) => (
                <div key={item.title} className="accent-stripe flex gap-4 border border-border bg-card p-5 pl-6">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                    {'image' in item && item.image && (
                      <img src={item.image} alt={item.imageAlt || item.title} className="mt-3 max-h-64 w-auto border border-border" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(siteMapContent.image_url || siteMapContent.content) && (
              <Card className="mb-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    {siteMapContent.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {siteMapContent.content && <p className="mb-4 text-muted-foreground">{siteMapContent.content}</p>}
                  {siteMapContent.image_url ? (
                    <img src={siteMapContent.image_url} alt={siteMapContent.image_alt || siteMapContent.title} className="w-full border border-border" />
                  ) : (
                    <p className="text-sm text-muted-foreground">{l({ de: 'Lageplan wird noch aktualisiert.', cz: 'Plan arealu bude aktualizovan.', en: 'Site map will be updated.', pl: 'Plan terenu zostanie jeszcze zaktualizowany.' })}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <details className="group mb-10 border border-border bg-card">
              <summary className="flex cursor-pointer items-center gap-3 p-5 font-semibold">
                <Shield className="h-5 w-5 text-muted-foreground" />
                {privacyNoticeContent.title}
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-5 pb-5 pt-3 text-sm text-muted-foreground">
                <p>{privacyNoticeContent.content}</p>
              </div>
            </details>

            <Link
              to="/event/accommodation"
              onClick={() => trackEvent('event_navigation_click', { category: 'navigation', label: 'event_page:accommodation' })}
              className="accent-stripe flex gap-4 border border-border bg-card p-5 pl-6 transition-colors hover:border-primary"
            >
              <BedDouble className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h3 className="mb-1 text-base font-bold">{l({ de: 'Übernachtungsmöglichkeiten', cz: 'Ubytovani', en: 'Accommodation', pl: 'Noclegi' })}</h3>
                <p className="text-sm text-muted-foreground">{l({ de: 'Hotels, Pensionen und Ferienwohnungen in der Naehe der Rennstrecke.', cz: 'Hotely, penziony a apartmany v blizkosti zavodni drahy.', en: 'Hotels, guesthouses and holiday apartments near the track.', pl: 'Hotele, pensjonaty i apartamenty wakacyjne w poblizu trasy.' })}</p>
              </div>
              <ExternalLink className="mt-0.5 ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Downloads */}
        <section id="downloads" className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.downloads}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {eventDownloads.length > 0 ? eventDownloads.map((download) => (
                <a
                  key={download.id}
                  href={download.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('event_download', { category: 'engagement', label: `event_page:${download.title}` })}
                  className="group block"
                >
                  <Card className="h-full transition-shadow hover:shadow-lg hover:border-primary">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="bg-primary/10 p-3"><Download className="h-6 w-6 text-primary" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium group-hover:text-primary">{download.title}</p>
                        <p className="text-sm text-muted-foreground">{download.file_type?.toUpperCase() || 'DATEI'}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </a>
              )) : (
                <Card className="lg:col-span-4">
                  <CardContent className="p-6 text-muted-foreground">
                    {l({ de: 'Noch keine Downloads verfuegbar.', cz: 'Zatim nejsou k dispozici zadne soubory.', en: 'No downloads available yet.', pl: 'Brak plikow do pobrania.' })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.gallery}</h2>
            {galleryFilesLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
                ))}
              </div>
            ) : galleryFiles && galleryFiles.length > 0 ? (
              <div className="space-y-6">
                <Carousel opts={{ align: 'start', loop: galleryFiles.length > 1 }} className="w-full px-12">
                  <CarouselContent className="-ml-4">
                    {galleryFiles.map((file, index) => (
                      <CarouselItem key={file.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <button
                          type="button"
                          onClick={() => openGalleryImage(index)}
                          className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-muted">
                            <img
                              src={file.file_url}
                              alt={file.alt_text || mainEvent?.title || t.event.gallery}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {galleryFiles.length > 1 ? (
                    <>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </>
                  ) : null}
                </Carousel>

                <Dialog open={selectedGalleryIndex !== null} onOpenChange={(open) => !open && closeGalleryImage()}>
                  <DialogContent className="max-w-6xl border-none bg-transparent p-0 shadow-none">
                    {selectedGalleryIndex !== null && galleryFiles[selectedGalleryIndex] ? (
                      <div className="relative">
                        <img
                          src={galleryFiles[selectedGalleryIndex].file_url}
                          alt={galleryFiles[selectedGalleryIndex].alt_text || mainEvent?.title || t.event.gallery}
                          className="max-h-[82vh] w-full object-contain"
                        />
                        {galleryFiles.length > 1 ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
                              onClick={showPreviousGalleryImage}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
                              onClick={showNextGalleryImage}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        ) : null}
                        {galleryFiles[selectedGalleryIndex].alt_text ? (
                          <p className="mt-3 text-center text-sm text-white/80">
                            {galleryFiles[selectedGalleryIndex].alt_text}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
                  <Image className="h-5 w-5" />
                  <span>{galleryContent.content}</span>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Archive */}
        <section className="bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8">{t.event.archive}</h2>
            <Card>
              <CardContent className="p-6 text-muted-foreground">{archiveContent.content}</CardContent>
            </Card>
          </div>
        </section>
      </MainLayout>
  );
}
