export type Locale = 'de' | 'cz' | 'en';

export const translations = {
  de: {
    // Navigation
    nav: {
      home: 'Startseite',
      event: 'Veranstaltung',
      calendar: 'Kalender',
      news: 'News',
      club: 'Verein',
      about: 'Über uns',
      board: 'Vorstand',
      history: 'Geschichte',
      membership: 'Mitglied werden',
      sections: 'Sparten',
      touring: 'Motorradtouristik',
      motocross: 'Motocross',
      trial: 'Trial',
      partners: 'Partner',
      sponsors: 'Sponsoren',
      partnerClubs: 'Partnervereine',
      contact: 'Kontakt',
      imprint: 'Impressum',
      privacy: 'Datenschutz',
    },
    // Hero Section
    hero: {
      eventTitle: '12. Oberlausitzer Dreieck',
      eventDate: '12./13. September 2026',
      countdown: 'Noch',
      days: 'Tage',
      hours: 'Stunden',
      minutes: 'Minuten',
      seconds: 'Sekunden',
      ctaEvent: 'Zur Veranstaltung',
      ctaSchedule: 'Zeitplan ansehen',
      ctaDiscover: 'Entdecken',
    },
    // Club Teaser
    clubTeaser: {
      title: 'MSC Oberlausitzer Dreiländereck e.V.',
      subtitle: 'Motorsport mit Leidenschaft',
      description: 'Seit unserer Gründung leben wir die Begeisterung für den Motorsport im Herzen des Dreiländerecks. Von Motorradtouren bis zum legendären Demolauf – bei uns erlebst du Motorsport hautnah.',
      cta: 'Mehr erfahren',
    },
    // Event
    event: {
      title: 'Oberlausitzer Dreieck',
      subtitle: 'Der legendäre Demolauf',
      description: 'Erlebe Motorsport-Geschichte auf der 5,9 km langen Strecke zwischen Saalendorf, Jonsdorf und Waltersdorf. Kein Rennen – ein unvergessliches Erlebnis!',
      track: 'Strecke & Region',
      schedule: 'Zeitplan',
      visitors: 'Besucherinformationen',
      participants: 'Für Teilnehmer',
      helpers: 'Helfer gesucht',
      downloads: 'Downloads',
      gallery: 'Galerie',
      archive: 'Archiv',
      classes: {
        title: 'Teilnehmerklassen',
        motorcycles: 'Rennmotorräder',
        sidecars: 'Seitenwagen',
        karts: 'Karts',
        formula: 'Formelwagen',
        touring: 'Tourenwagen',
      },
    },
    // Calendar
    calendar: {
      title: 'Termine',
      subtitle: 'Alle Termine des MSC Oberlausitzer Dreiländereck e.V.',
      upcoming: 'Kommende Termine',
      upcomingAll: 'Kommende Termine',
      view: 'Ansicht',
      viewList: 'Liste',
      viewListFull: 'Kommende',
      viewMonth: 'Kalender',
      viewMonthFull: 'Monatsansicht',
      category: 'Kategorie',
      showAllMonth: 'Alle Termine im Monat anzeigen',
      exportCalendar: 'Kalender exportieren (ICS)',
      noEvents: 'Keine Termine gefunden.',
      noEventsHint: 'Wähle einen anderen Monat oder eine andere Kategorie.',
      eventCount: 'Termin',
      eventCountPlural: 'Termine',
      filter: {
        all: 'Allgemein',
        club: 'Verein',
        verein: 'Verein',
        event: 'Veranstaltung',
        veranstaltung: 'Veranstaltung',
        training: 'Training',
        orgTeam: 'Org-Team',
        orga: 'Org-Team',
      },
      mainEvent: 'Hauptevent',
    },
    // News
    news: {
      title: 'Neuigkeiten',
      readMore: 'Weiterlesen',
      categories: {
        club: 'Verein',
        event: 'Veranstaltung',
      },
    },
    // Contact
    contact: {
      title: 'Kontakt',
      name: 'Name',
      email: 'E-Mail',
      subject: 'Betreff',
      message: 'Nachricht',
      send: 'Absenden',
      success: 'Nachricht erfolgreich gesendet!',
    },
    // Footer
    footer: {
      rights: 'Alle Rechte vorbehalten',
      followUs: 'Folge uns',
    },
    // Common
    common: {
      learnMore: 'Mehr erfahren',
      backToTop: 'Nach oben',
      loading: 'Lädt...',
      error: 'Ein Fehler ist aufgetreten',
    },
  },
  cz: {
    // Navigation
    nav: {
      home: 'Domů',
      event: 'Akce',
      calendar: 'Kalendář',
      news: 'Novinky',
      club: 'Klub',
      about: 'O nás',
      board: 'Vedení',
      history: 'Historie',
      membership: 'Členství',
      sections: 'Sekce',
      touring: 'Mototuristika',
      motocross: 'Motokros',
      trial: 'Trial',
      partners: 'Partneři',
      sponsors: 'Sponzoři',
      partnerClubs: 'Partnerské kluby',
      contact: 'Kontakt',
      imprint: 'Impresum',
      privacy: 'Ochrana údajů',
    },
    // Hero Section
    hero: {
      eventTitle: '12. Oberlausitzer Dreieck',
      eventDate: '12./13. září 2026',
      countdown: 'Zbývá',
      days: 'Dní',
      hours: 'Hodin',
      minutes: 'Minut',
      seconds: 'Sekund',
      ctaEvent: 'K akci',
      ctaSchedule: 'Zobrazit harmonogram',
      ctaDiscover: 'Objevit',
    },
    // Club Teaser
    clubTeaser: {
      title: 'MSC Oberlausitzer Dreiländereck e.V.',
      subtitle: 'Motorsport s vášní',
      description: 'Od našeho založení žijeme nadšením pro motorsport v srdci trojmezí. Od mototuristiky po legendární demo jízdu – zažijte motorsport zblízka.',
      cta: 'Více informací',
    },
    // Event
    event: {
      title: 'Oberlausitzer Dreieck',
      subtitle: 'Legendární demo jízda',
      description: 'Zažijte historii motorsportu na 5,9 km dlouhé trati mezi Saalendorfem, Jonsdorfem a Waltersdorfem. Žádný závod – nezapomenutelný zážitek!',
      track: 'Trať a region',
      schedule: 'Harmonogram',
      visitors: 'Informace pro návštěvníky',
      participants: 'Pro účastníky',
      helpers: 'Hledáme pomocníky',
      downloads: 'Ke stažení',
      gallery: 'Galerie',
      archive: 'Archiv',
      classes: {
        title: 'Třídy účastníků',
        motorcycles: 'Závodní motocykly',
        sidecars: 'Sajdkáry',
        karts: 'Motokáry',
        formula: 'Formule',
        touring: 'Cestovní vozy',
      },
    },
    // Calendar
    calendar: {
      title: 'Termíny',
      subtitle: 'Všechny termíny MSC Oberlausitzer Dreiländereck e.V.',
      upcoming: 'Nadcházející události',
      upcomingAll: 'Nadcházející termíny',
      view: 'Zobrazení',
      viewList: 'Seznam',
      viewListFull: 'Nadcházející',
      viewMonth: 'Kalendář',
      viewMonthFull: 'Měsíční zobrazení',
      category: 'Kategorie',
      showAllMonth: 'Zobrazit všechny termíny v měsíci',
      exportCalendar: 'Exportovat kalendář (ICS)',
      noEvents: 'Žádné termíny nenalezeny.',
      noEventsHint: 'Vyberte jiný měsíc nebo jinou kategorii.',
      eventCount: 'termín',
      eventCountPlural: 'termínů',
      filter: {
        all: 'Obecné',
        club: 'Klub',
        verein: 'Klub',
        event: 'Akce',
        veranstaltung: 'Akce',
        training: 'Trénink',
        orgTeam: 'Org-tým',
        orga: 'Org-tým',
      },
      mainEvent: 'Hlavní akce',
    },
    // News
    news: {
      title: 'Novinky',
      readMore: 'Číst dále',
      categories: {
        club: 'Klub',
        event: 'Akce',
      },
    },
    // Contact
    contact: {
      title: 'Kontakt',
      name: 'Jméno',
      email: 'E-mail',
      subject: 'Předmět',
      message: 'Zpráva',
      send: 'Odeslat',
      success: 'Zpráva byla úspěšně odeslána!',
    },
    // Footer
    footer: {
      rights: 'Všechna práva vyhrazena',
      followUs: 'Sledujte nás',
    },
    // Common
    common: {
      learnMore: 'Více informací',
      backToTop: 'Nahoru',
      loading: 'Načítání...',
      error: 'Došlo k chybě',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      event: 'Event',
      calendar: 'Calendar',
      news: 'News',
      club: 'Club',
      about: 'About Us',
      board: 'Board',
      history: 'History',
      membership: 'Become a Member',
      sections: 'Sections',
      touring: 'Motorcycle Touring',
      motocross: 'Motocross',
      trial: 'Trial',
      partners: 'Partners',
      sponsors: 'Sponsors',
      partnerClubs: 'Partner Clubs',
      contact: 'Contact',
      imprint: 'Imprint',
      privacy: 'Privacy Policy',
    },
    // Hero Section
    hero: {
      eventTitle: '12th Oberlausitzer Dreieck',
      eventDate: 'September 12-13, 2026',
      countdown: 'Only',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      ctaEvent: 'View Event',
      ctaSchedule: 'See Schedule',
      ctaDiscover: 'Discover',
    },
    // Club Teaser
    clubTeaser: {
      title: 'MSC Oberlausitzer Dreiländereck e.V.',
      subtitle: 'Motorsport with Passion',
      description: 'Since our founding, we have been living our passion for motorsport in the heart of the three-country region. From motorcycle tours to the legendary demo run – experience motorsport up close.',
      cta: 'Learn More',
    },
    // Event
    event: {
      title: 'Oberlausitzer Dreieck',
      subtitle: 'The Legendary Demo Run',
      description: 'Experience motorsport history on the 5.9 km track between Saalendorf, Jonsdorf, and Waltersdorf. Not a race – an unforgettable experience!',
      track: 'Track & Region',
      schedule: 'Schedule',
      visitors: 'Visitor Information',
      participants: 'For Participants',
      helpers: 'Volunteers Wanted',
      downloads: 'Downloads',
      gallery: 'Gallery',
      archive: 'Archive',
      classes: {
        title: 'Participant Classes',
        motorcycles: 'Racing Motorcycles',
        sidecars: 'Sidecars',
        karts: 'Karts',
        formula: 'Formula Cars',
        touring: 'Touring Cars',
      },
    },
    // Calendar
    calendar: {
      title: 'Events',
      subtitle: 'All events of MSC Oberlausitzer Dreiländereck e.V.',
      upcoming: 'Upcoming Events',
      upcomingAll: 'Upcoming Events',
      view: 'View',
      viewList: 'List',
      viewListFull: 'Upcoming',
      viewMonth: 'Calendar',
      viewMonthFull: 'Month View',
      category: 'Category',
      showAllMonth: 'Show all events in month',
      exportCalendar: 'Export Calendar (ICS)',
      noEvents: 'No events found.',
      noEventsHint: 'Select a different month or category.',
      eventCount: 'event',
      eventCountPlural: 'events',
      filter: {
        all: 'General',
        club: 'Club',
        verein: 'Club',
        event: 'Event',
        veranstaltung: 'Event',
        training: 'Training',
        orgTeam: 'Org Team',
        orga: 'Org Team',
      },
      mainEvent: 'Main Event',
    },
    // News
    news: {
      title: 'News',
      readMore: 'Read More',
      categories: {
        club: 'Club',
        event: 'Event',
      },
    },
    // Contact
    contact: {
      title: 'Contact',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      success: 'Message sent successfully!',
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
      followUs: 'Follow Us',
    },
    // Common
    common: {
      learnMore: 'Learn More',
      backToTop: 'Back to Top',
      loading: 'Loading...',
      error: 'An error occurred',
    },
  },
} as const;

// Use a more flexible type that allows any translation values
export type Translations = {
  nav: {
    home: string;
    event: string;
    calendar: string;
    news: string;
    club: string;
    about: string;
    board: string;
    history: string;
    membership: string;
    sections: string;
    touring: string;
    motocross: string;
    trial: string;
    partners: string;
    sponsors: string;
    partnerClubs: string;
    contact: string;
    imprint: string;
    privacy: string;
  };
  hero: {
    eventTitle: string;
    eventDate: string;
    countdown: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    ctaEvent: string;
    ctaSchedule: string;
    ctaDiscover: string;
  };
  clubTeaser: {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
  };
  event: {
    title: string;
    subtitle: string;
    description: string;
    track: string;
    schedule: string;
    visitors: string;
    participants: string;
    helpers: string;
    downloads: string;
    gallery: string;
    archive: string;
    classes: {
      title: string;
      motorcycles: string;
      sidecars: string;
      karts: string;
      formula: string;
      touring: string;
    };
  };
  calendar: {
    title: string;
    subtitle: string;
    upcoming: string;
    upcomingAll: string;
    view: string;
    viewList: string;
    viewListFull: string;
    viewMonth: string;
    viewMonthFull: string;
    category: string;
    showAllMonth: string;
    exportCalendar: string;
    noEvents: string;
    noEventsHint: string;
    eventCount: string;
    eventCountPlural: string;
    filter: {
      all: string;
      club: string;
      verein: string;
      event: string;
      veranstaltung: string;
      training: string;
      orgTeam: string;
      orga: string;
    };
    mainEvent: string;
  };
  news: {
    title: string;
    readMore: string;
    categories: {
      club: string;
      event: string;
    };
  };
  contact: {
    title: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    success: string;
  };
  footer: {
    rights: string;
    followUs: string;
  };
  common: {
    learnMore: string;
    backToTop: string;
    loading: string;
    error: string;
  };
};
