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
    title: locale === 'de' ? 'Teilnehmer-Anmeldung' : locale === 'cz' ? 'Registrace účastníků' : 'Participant Registration',
    content:
      locale === 'de'
        ? 'Vereinsmitglieder des MSC Oberlausitzer Dreiländereck e.V. zahlen kein Nenngeld. Nachwuchsfahrer unter 18 Jahren benötigen eine schriftliche Einverständniserklärung eines Erziehungsberechtigten. Ab 70 Jahren ist ein ärztliches Attest erforderlich.'
        : '',
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

  const schedules = eventContent?.schedules || [];
  const participantClasses =
    eventContent?.classes?.map((item) => ({
      icon: iconMap[item.icon],
      name: item.name,
      description: item.description || '',
    })) || [];
  const trackInfo = eventContent?.infos?.find((item) => item.section === 'track');
  const arrivalInfo = eventContent?.infos?.find((item) => item.section === 'visitors_arrival');
  const admissionInfo = eventContent?.infos?.find((item) => item.section === 'visitors_admission');
  const paddockInfo = eventContent?.infos?.find((item) => item.section === 'visitors_paddock');
  const registrationInfo = eventContent?.infos?.find((item) => item.section === 'registration');
  const eventDownloads = (downloads || []).filter((item) => item.category === 'event');

  // Map embed URL: from CMS or fallback to Google Maps link
  const mapEmbedUrl = locationMapContent.content || null;
  const googleMapsLink = mainEvent?.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mainEvent.location)}`
    : null;

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="racing-stripe h-full w-full" />
        </div>
        <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent opacity-80" />

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
              <div className="mt-8 flex flex-wrap gap-4">
                {mainEvent.registration_url && (
                  <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-10 py-6 glow-accent" asChild>
                    <a href={mainEvent.registration_url} target="_blank" rel="noopener noreferrer">
                      <ClipboardList className="h-5 w-5" />
                      {locale === 'de' ? 'Zur Anmeldung' : locale === 'cz' ? 'Přihlásit se' : 'Register Now'}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {mainEvent.location && (
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <a href={googleMapsLink || '#track'}>
                      <MapPin className="mr-2 h-5 w-5" />
                      {mainEvent.location}
                    </a>
                  </Button>
                )}
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
            ].map((item) => (
              <Button key={item.href} variant="outline" size="sm" asChild>
                <a href={item.href}>
                  <item.icon className="mr-1 h-4 w-4" />
                  {item.label}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Track */}
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
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{mainEvent.location}</span>
                  </li>
                </ul>
              )}
            </div>
            {trackMapContent.image_url ? (
              <img
                src={trackMapContent.image_url}
                alt={trackMapContent.image_alt || trackMapContent.title}
                className="h-64 w-full border border-border object-cover"
              />
            ) : mapEmbedUrl ? (
              <iframe
                title={locale === 'de' ? 'Streckenkarte' : 'Track Map'}
                src={mapEmbedUrl}
                className="h-64 w-full border border-border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : googleMapsLink ? (
              <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
                className="flex h-64 items-center justify-center border border-border bg-muted text-muted-foreground hover:text-primary transition-colors">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8" />
                  <span>{locale === 'de' ? 'Karte öffnen' : locale === 'cz' ? 'Otevřít mapu' : 'Open Map'}</span>
                </div>
              </a>
            ) : (
              <div className="flex h-64 items-center justify-center border border-border bg-muted">
                <span className="text-muted-foreground">{trackMapContent.title}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.classes.title}</h2>
          {participantClasses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {participantClasses.map((cls) => (
                <Card key={cls.name} className="text-center">
                  <CardContent className="p-6">
                    <cls.icon className="mx-auto mb-3 h-10 w-10 text-primary" />
                    <h3 className="mb-1 text-lg font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                {locale === 'de'
                  ? 'Noch keine Teilnehmerklassen hinterlegt.'
                  : locale === 'cz'
                    ? 'Zatím nejsou nastaveny žádné třídy účastníků.'
                    : 'No participant classes have been added yet.'}
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
                {locale === 'de' ? 'Noch kein Zeitplan hinterlegt.' : locale === 'cz' ? 'Zatím není k dispozici žádný harmonogram.' : 'No schedule has been added yet.'}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Visitors */}
      <section id="visitors" className="py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.visitors}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle>{locale === 'de' ? 'Anreise' : locale === 'cz' ? 'Příjezd' : 'Getting There'}</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground"><p>{arrivalInfo?.content || mainEvent?.location || '-'}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{locale === 'de' ? 'Eintritt' : locale === 'cz' ? 'Vstupné' : 'Admission'}</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground"><p>{admissionInfo?.content || '-'}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{locale === 'de' ? 'Fahrerlager' : locale === 'cz' ? 'Depo' : 'Paddock'}</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground"><p>{paddockInfo?.content || '-'}</p></CardContent>
            </Card>
          </div>
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
