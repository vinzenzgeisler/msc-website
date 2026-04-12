import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation, useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { useMainEvent } from '@/hooks/useMainEvent';
import { useEventContent } from '@/hooks/useEventContent';
import { useDownloads } from '@/hooks/useDownloads';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { format } from 'date-fns';
import { de, cs, enUS } from 'date-fns/locale';

const iconMap = {
  bike: Bike,
  car: Car,
  users: Users,
} as const;

export default function EventPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: mainEvent, isLoading } = useMainEvent();
  const { data: eventContent } = useEventContent(mainEvent?.id);
  const { data: downloads } = useDownloads();
  const eventIntro = useContentWithFallback('event', 'intro', {
    title: locale === 'de' ? 'Das Oberlausitzer Dreieck' : locale === 'cz' ? 'Horní Lužický trojúhelník' : 'The Oberlausitz Triangle',
    content:
      locale === 'de'
        ? 'Erleben Sie mitten im Zittauer Gebirge eine spannende Motorshow auf der legendären 5,9 km langen Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf.'
        : locale === 'cz'
          ? 'Zažijte napínavou motoristickou show uprostřed Žitavských hor na legendární 5,9 km dlouhé trati mezi Saalendorfem, Jonsdorfem a Waltersdorfem.'
          : 'Experience an exciting motor show in the heart of the Zittau Mountains on the legendary 5.9 km track between Saalendorf, Jonsdorf and Waltersdorf.',
  });
  const trackMapContent = useContentWithFallback('event', 'track_map', {
    title: locale === 'de' ? 'Streckenkarte' : locale === 'cz' ? 'Mapa tratě' : 'Track map',
    content: '',
  });
  const locationMapContent = useContentWithFallback('event', 'location_map', {
    title: '',
    content: '', // embed URL
  });
  const registrationContent = useContentWithFallback('event', 'registration_info', {
    title: locale === 'de' ? 'Sei dabei!' : locale === 'cz' ? 'Buď u toho!' : 'Join Us!',
    content:
      locale === 'de'
        ? 'Du willst nicht nur zuschauen, sondern selbst Gas geben? Dann melde dich jetzt an und werde Teil des Oberlausitzer Dreiecks! Wir freuen uns auf dich und deine Maschine.'
        : locale === 'cz'
          ? 'Nechceš jen přihlížet, ale sám přidat plyn? Přihlas se a staň se součástí Horního Lužického trojúhelníku! Těšíme se na tebe a tvůj stroj.'
          : 'Don\'t just watch – get behind the handlebars! Register now and become part of the Oberlausitz Triangle. We look forward to seeing you and your machine on the track!',
  });
  const admissionContent = useContentWithFallback('event', 'visitors_admission', {
    title: locale === 'de' ? 'Eintrittspreise' : locale === 'cz' ? 'Vstupné' : 'Admission',
    content: locale === 'de'
      ? 'Tagesticket: 10 € | Wochenendticket: 15 € — Kinder und Jugendliche unter 14 Jahren haben freien Eintritt.'
      : locale === 'cz' ? 'Denní vstupenka: 10 € | Víkendová vstupenka: 15 € — Děti do 14 let mají vstup zdarma.' : 'Day ticket: €10 | Weekend ticket: €15 — Children under 14 get free admission.',
  });
  const scheduleOverviewContent = useContentWithFallback('event', 'visitors_schedule', {
    title: locale === 'de' ? 'Ablauf' : locale === 'cz' ? 'Průběh' : 'Schedule Overview',
    content: locale === 'de'
      ? 'Samstag: 8:00–ca. 18:00 Uhr Trainingsläufe, 20:00 Uhr Abendveranstaltung mit Livemusik. Sonntag: 8:00–ca. 18:00 Uhr Demoläufe.'
      : locale === 'cz'
        ? 'Sobota: 8:00–cca 18:00 tréninky, 20:00 večerní akce s živou hudbou. Neděle: 8:00–cca 18:00 ukázkové jízdy.'
        : 'Saturday: 8:00 AM–approx. 6:00 PM practice runs, 8:00 PM evening event with live music. Sunday: 8:00 AM–approx. 6:00 PM demo runs.',
  });
  const parkingContent = useContentWithFallback('event', 'visitors_parking', {
    title: locale === 'de' ? 'Parkplätze & Shuttle' : locale === 'cz' ? 'Parkování a shuttle' : 'Parking & Shuttle',
    content: locale === 'de'
      ? 'Parkplätze sind ausgeschildert und kostenlos. An der Strecke gibt es kostenlose Shuttlebusse, welche die Besucher zu den Zuschauerbereichen fahren.'
      : locale === 'cz'
        ? 'Parkoviště jsou označena a zdarma. Na trati jsou k dispozici bezplatné autobusy, které návštěvníky zavezou k diváckým zónám.'
        : 'Parking areas are signposted and free of charge. Free shuttle buses run along the track to take spectators to viewing areas.',
  });
  const paddockContent = useContentWithFallback('event', 'visitors_paddock', {
    title: locale === 'de' ? 'Fahrerlager' : locale === 'cz' ? 'Depo' : 'Paddock',
    content: locale === 'de'
      ? 'Die beiden Fahrerlager sind auch für die Zuschauer zugänglich.'
      : locale === 'cz'
        ? 'Obě depa jsou přístupná i pro diváky.'
        : 'Both paddock areas are open to spectators.',
  });
  const photographerContent = useContentWithFallback('event', 'visitors_photographers', {
    title: locale === 'de' ? 'Fotografen' : locale === 'cz' ? 'Fotografové' : 'Photographers',
    content: locale === 'de'
      ? 'Die Fotografenbereiche sind farblich gekennzeichnet und dürfen nur von akkreditierten Fotografen betreten werden. Die Absperrungen dürfen nicht überschritten werden!'
      : locale === 'cz'
        ? 'Fotografické zóny jsou barevně označeny a přístupné pouze akreditovaným fotografům. Zábrany se nesmí překračovat!'
        : 'Photographer zones are color-coded and may only be entered by accredited photographers. Barriers must not be crossed!',
  });
  const privacyNoticeContent = useContentWithFallback('event', 'visitors_privacy', {
    title: locale === 'de' ? 'Datenschutzhinweis' : locale === 'cz' ? 'Ochrana osobních údajů' : 'Privacy Notice',
    content: locale === 'de'
      ? 'Im Rahmen unserer Veranstaltungen behalten wir uns vor, Bild- und Tonaufnahmen von Beteiligten und Gästen zu Zwecken der PR- und Öffentlichkeitsarbeit zu erstellen, zu verarbeiten und zu verbreiten, soweit diese nicht im Einzelfall widersprechen. Mit der Anmeldung/Nennung erklären sich die Teilnehmer damit einverstanden, dass Aufnahmen während der Veranstaltung gemacht werden, die ohne Vergütungsanspruch für diese Zwecke verwendet werden dürfen.'
      : locale === 'cz'
        ? 'V rámci našich akcí si vyhrazujeme právo pořizovat obrazové a zvukové záznamy účastníků a hostů pro účely PR a veřejné komunikace.'
        : 'During our events, we reserve the right to create, process, and distribute photo and audio recordings of participants and guests for PR and public relations purposes, unless individually objected to.',
  });
  const transportContent = useContentWithFallback('event', 'visitors_transport', {
    title: locale === 'de' ? 'Öffentliche Verkehrsmittel' : locale === 'cz' ? 'Veřejná doprava' : 'Public Transport',
    content: locale === 'de'
      ? 'Änderungen der Fahrpläne der öffentlichen Verkehrsmittel werden rechtzeitig aktualisiert.'
      : locale === 'cz'
        ? 'Změny jízdních řádů veřejné dopravy budou včas aktualizovány.'
        : 'Public transport schedule changes will be updated in a timely manner.',
  });
  const siteMapContent = useContentWithFallback('event', 'visitors_site_map', {
    title: locale === 'de' ? 'Lageplan' : locale === 'cz' ? 'Plán areálu' : 'Site Map',
    content: '',
  });
  const galleryContent = useContentWithFallback('event', 'gallery', {
    content:
      locale === 'de'
        ? 'Noch keine Galerie hinterlegt.'
        : locale === 'cz'
          ? 'Zatím není k dispozici žádná galerie.'
          : 'No gallery has been added yet.',
  });
  const archiveContent = useContentWithFallback('event', 'archive', {
    content:
      locale === 'de'
        ? 'Noch keine Archivdaten hinterlegt.'
        : locale === 'cz'
          ? 'Zatím nejsou k dispozici žádná archivní data.'
          : 'No archive data has been added yet.',
  });

  const dateLocale = locale === 'de' ? de : locale === 'cz' ? cs : enUS;

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
  const eventDownloads = (downloads || []).filter((item) => item.category === 'event');

  // Map embed URL: from CMS or fallback to Google Maps link
  const mapEmbedUrl = locationMapContent.content || null;
  const googleMapsLink = locationMapContent.primary_button_url
    || (mainEvent?.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mainEvent.location)}`
      : 'https://maps.app.goo.gl/8ynVfs7AgjRU1Qem6');

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0">
          <div className="racing-stripe h-full w-full" />
        </div>
        <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent" />

        <div className="container relative z-10">
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
              <div className="mt-8">
                <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" asChild>
                  <a
                    href={mainEvent.registration_url || '#registration'}
                    {...(mainEvent.registration_url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <ClipboardList className="h-5 w-5" />
                    {locale === 'de' ? 'Zur Anmeldung' : locale === 'cz' ? 'Přihlásit se' : 'Register Now'}
                    {mainEvent.registration_url && <ExternalLink className="h-4 w-4" />}
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Badge className="mb-4 bg-accent text-accent-foreground">
                {locale === 'de' ? 'Keine Veranstaltung hinterlegt' : locale === 'cz' ? 'Žádná akce není nastavena' : 'No event configured'}
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
              { href: '#registration', label: locale === 'de' ? 'Anmeldung' : locale === 'cz' ? 'Přihláška' : 'Registration', icon: ClipboardList },
              { href: '#visitors', label: t.event.visitors, icon: Info },
              { href: '#downloads', label: t.event.downloads, icon: Download },
              { href: '/event/accommodation', label: locale === 'de' ? 'Übernachtung' : locale === 'cz' ? 'Ubytování' : 'Accommodation', icon: BedDouble, isLink: true },
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
                  (locale === 'de'
                    ? 'Die legendäre 5,9 km lange Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf bietet Motorsport-Fans ein unvergessliches Erlebnis mitten im Zittauer Gebirge.'
                    : locale === 'cz'
                      ? 'Legendární 5,9 km dlouhá trať mezi Saalendorfem, Jonsdorfem a Waltersdorfem nabízí fanouškům motorsportu nezapomenutelný zážitek uprostřed Žitavských hor.'
                      : 'The legendary 5.9 km track between Saalendorf, Jonsdorf and Waltersdorf offers motorsport fans an unforgettable experience in the heart of the Zittau Mountains.')}
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
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {locationMapContent.primary_button_label
                      || (locale === 'de' ? 'In Google Maps öffnen' : locale === 'cz' ? 'Otevřít v Google Maps' : 'Open in Google Maps')}
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
                  title={locale === 'de' ? 'Streckenkarte' : 'Track Map'}
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
            {locale === 'de'
              ? 'In diesen Klassen wird beim Oberlausitzer Dreieck gestartet:'
              : locale === 'cz'
                ? 'V těchto třídách se na Horním Lužickém trojúhelníku závodí:'
                : 'These are the classes competing at the Oberlausitz Triangle:'}
          </p>
          {participantClasses.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {participantClasses.map((cls) => (
                <div key={cls.name} className="flex items-center gap-2 border border-border bg-card px-3 py-2.5">
                  <cls.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{cls.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                {locale === 'de'
                  ? 'Die Klassen werden rechtzeitig vor der Veranstaltung veröffentlicht.'
                  : locale === 'cz'
                    ? 'Třídy budou zveřejněny včas před akcí.'
                    : 'Classes will be published in time before the event.'}
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
            <h2 className="mb-4">
              {registrationContent.title}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {registrationInfo?.content || registrationContent.content}
            </p>
            {mainEvent?.registration_url ? (
              <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" asChild>
                <a href={mainEvent.registration_url} target="_blank" rel="noopener noreferrer">
                  <ClipboardList className="h-5 w-5" />
                  {locale === 'de' ? 'Zur Anmeldung' : locale === 'cz' ? 'K registračnímu portálu' : 'Go to Registration Portal'}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {locale === 'de' ? 'Das Anmeldeportal wird rechtzeitig vor der Veranstaltung freigeschaltet.' : locale === 'cz' ? 'Registrační portál bude otevřen včas před akcí.' : 'The registration portal will be opened in time before the event.'}
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
                {locale === 'de' ? 'Der Zeitplan wurde noch nicht veröffentlicht.' : locale === 'cz' ? 'Harmonogram ještě nebyl zveřejněn.' : 'The schedule has not been published yet.'}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Visitors */}
      <section id="visitors" className="py-16">
        <div className="container">
          <h2 className="mb-10">{t.event.visitors}</h2>

          {/* Key facts — compact highlight bar */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Ticket, title: locale === 'de' ? 'Tagesticket' : 'Day Ticket', value: '10 €' },
              { icon: Ticket, title: locale === 'de' ? 'Wochenende' : 'Weekend', value: '15 €' },
              { icon: Users, title: locale === 'de' ? 'Kinder < 14' : 'Kids < 14', value: locale === 'de' ? 'Frei' : 'Free' },
              { icon: ParkingCircle, title: locale === 'de' ? 'Parkplätze' : 'Parking', value: locale === 'de' ? 'Kostenlos' : 'Free' },
            ].map((fact) => (
              <div key={fact.title} className="flex flex-col items-center border border-border bg-card p-4 text-center">
                <fact.icon className="mb-2 h-6 w-6 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fact.title}</span>
                <span className="mt-1 font-display text-2xl font-bold text-foreground">{fact.value}</span>
              </div>
            ))}
          </div>

          {/* Info items — clean list with accent stripe */}
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

          {/* Site Map & Photographers images (if available from CMS) */}
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
                  <p className="text-sm text-muted-foreground">{locale === 'de' ? 'Lageplan wird noch aktualisiert.' : locale === 'cz' ? 'Plán areálu bude aktualizován.' : 'Site map will be updated.'}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice — collapsible, subtle */}
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

          {/* Link to Accommodation */}
          <Link to="/event/accommodation" className="accent-stripe flex gap-4 border border-border bg-card p-5 pl-6 transition-colors hover:border-primary">
            <BedDouble className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="mb-1 text-base font-bold">{locale === 'de' ? 'Übernachtungsmöglichkeiten' : locale === 'cz' ? 'Ubytování' : 'Accommodation'}</h3>
              <p className="text-sm text-muted-foreground">{locale === 'de' ? 'Hotels, Pensionen und Ferienwohnungen in der Nähe der Rennstrecke.' : locale === 'cz' ? 'Hotely, penziony a apartmány v blízkosti závodní dráhy.' : 'Hotels, guesthouses and holiday apartments near the track.'}</p>
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
              <Card key={download.id} className="group transition-shadow hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-primary/10 p-3"><Download className="h-6 w-6 text-primary" /></div>
                  <div className="min-w-0">
                    <a href={download.file_url} target="_blank" rel="noopener noreferrer" className="font-medium group-hover:text-primary">{download.title}</a>
                    <p className="text-sm text-muted-foreground">{download.file_type?.toUpperCase() || 'DATEI'}</p>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="lg:col-span-4">
                <CardContent className="p-6 text-muted-foreground">
                  {locale === 'de' ? 'Noch keine Downloads verfügbar.' : locale === 'cz' ? 'Zatím nejsou k dispozici žádné soubory.' : 'No downloads available yet.'}
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
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
              <Image className="h-5 w-5" />
              <span>{galleryContent.content}</span>
            </CardContent>
          </Card>
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
