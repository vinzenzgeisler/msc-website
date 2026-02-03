import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter } from 'lucide-react';

// Same mock data - in production would come from database
const newsArticles = [
  {
    id: 1,
    slug: 'vorbereitung-2026',
    title: 'Vorbereitungen für das 12. Oberlausitzer Dreieck laufen auf Hochtouren',
    excerpt: 'Das Org-Team hat mit den Planungen für die kommende Jubiläumsveranstaltung begonnen.',
    content: `
      <p>Das Organisationsteam des MSC Oberlausitzer Dreiländereck e.V. hat mit den Vorbereitungen für das 12. Oberlausitzer Dreieck begonnen. Die Jubiläumsveranstaltung findet am 12. und 13. September 2026 statt.</p>
      
      <h2>Sponsorengespräche erfolgreich</h2>
      <p>Erste Gespräche mit unseren langjährigen Partnern verliefen sehr positiv. Wir freuen uns, dass sowohl Havlat als auch DEKRA ihre Unterstützung für 2026 bereits zugesagt haben.</p>
      
      <h2>Genehmigungsverfahren eingeleitet</h2>
      <p>Die notwendigen Genehmigungen bei den Gemeinden Großschönau, Jonsdorf und Waltersdorf sowie beim Landkreis sind beantragt. Wir rechnen mit einer Genehmigung im Frühjahr 2026.</p>
      
      <h2>Helfer gesucht</h2>
      <p>Für die Durchführung der Veranstaltung benötigen wir wieder zahlreiche engagierte Helfer. Wer Interesse hat, kann sich bereits jetzt beim Org-Team melden.</p>
    `,
    date: '2026-01-10',
    category: 'event',
    author: 'Org-Team',
  },
  {
    id: 2,
    slug: 'jahreshauptversammlung-2026',
    title: 'Einladung zur Jahreshauptversammlung 2026',
    excerpt: 'Wir laden alle Mitglieder herzlich zur ordentlichen Jahreshauptversammlung ein.',
    content: `
      <p>Liebe Mitglieder des MSC Oberlausitzer Dreiländereck e.V.,</p>
      
      <p>hiermit laden wir euch herzlich zur ordentlichen Jahreshauptversammlung 2026 ein.</p>
      
      <h2>Termin und Ort</h2>
      <p><strong>Datum:</strong> Freitag, 20. Februar 2026<br>
      <strong>Uhrzeit:</strong> 18:00 Uhr<br>
      <strong>Ort:</strong> Vereinsheim Großschönau</p>
      
      <h2>Tagesordnung</h2>
      <ol>
        <li>Begrüßung und Feststellung der Beschlussfähigkeit</li>
        <li>Genehmigung des Protokolls der letzten Hauptversammlung</li>
        <li>Bericht des Vorstands</li>
        <li>Kassenbericht und Bericht der Kassenprüfer</li>
        <li>Entlastung des Vorstands</li>
        <li>Wahlen</li>
        <li>Ausblick 2026</li>
        <li>Verschiedenes</li>
      </ol>
      
      <p>Wir freuen uns auf eure Teilnahme!</p>
      <p><em>Der Vorstand</em></p>
    `,
    date: '2026-01-05',
    category: 'club',
    author: 'Vorstand',
  },
  {
    id: 3,
    slug: 'rueckblick-2025',
    title: 'Rückblick: 11. Oberlausitzer Dreieck war voller Erfolg',
    excerpt: 'Mit über 5.000 Besuchern war die Veranstaltung 2025 ein großer Erfolg.',
    content: `
      <p>Das 11. Oberlausitzer Dreieck am 13. und 14. September 2025 war ein voller Erfolg! Bei strahlendem Sonnenschein kamen über 5.000 Besucher an die Strecke.</p>
      
      <h2>Highlights des Wochenendes</h2>
      <p>Die Demoläufe aller Klassen boten packende Action auf der 5,9 km langen Bergstrecke zwischen Saalendorf, Jonsdorf und Waltersdorf. Besonders die historischen Rennmotorräder und die spektakulären Seitenwagen-Gespanne begeisterten das Publikum.</p>
      
      <h2>Dank an alle Beteiligten</h2>
      <p>Ein großes Dankeschön geht an:</p>
      <ul>
        <li>Alle Fahrer und Teams für die tollen Vorführungen</li>
        <li>Unsere Sponsoren Havlat, DEKRA, Bergquell und alle weiteren Partner</li>
        <li>Die über 150 ehrenamtlichen Helfer</li>
        <li>Die Gemeinden und Behörden für die reibungslose Zusammenarbeit</li>
        <li>Alle Besucher für die tolle Stimmung</li>
      </ul>
      
      <p>Wir sehen uns beim 12. Oberlausitzer Dreieck am 12./13. September 2026!</p>
    `,
    date: '2025-09-20',
    category: 'event',
    author: 'Org-Team',
  },
];

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslation();

  const article = newsArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <MainLayout>
        <section className="py-20">
          <div className="container text-center">
            <h1 className="mb-4">Artikel nicht gefunden</h1>
            <p className="mb-8 text-muted-foreground">
              Der gesuchte Artikel existiert nicht oder wurde entfernt.
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Link>
            </Button>
          </div>
        </section>
      </MainLayout>
    );
  }

  const categoryLabel = article.category === 'event' ? 'Veranstaltung' : 'Verein';
  const categoryColor = article.category === 'event' 
    ? 'bg-accent text-accent-foreground' 
    : 'bg-primary text-primary-foreground';

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6 text-primary-foreground/80 hover:text-primary-foreground"
            asChild
          >
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <span className={`rounded px-3 py-1 text-xs font-bold uppercase ${categoryColor}`}>
              {categoryLabel}
            </span>
            <span className="flex items-center gap-1 text-sm text-primary-foreground/80">
              <Calendar className="h-4 w-4" />
              {new Date(article.date).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl">{article.title}</h1>
          
          {article.author && (
            <p className="mt-4 text-primary-foreground/70">
              Von {article.author}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {/* Featured Image Placeholder */}
            <div className="mb-8 flex h-64 items-center justify-center rounded-lg bg-muted md:h-96">
              <span className="text-muted-foreground">Artikelbild</span>
            </div>

            {/* Article Content */}
            <article 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Share */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Teilen:</span>
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Alle News anzeigen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
