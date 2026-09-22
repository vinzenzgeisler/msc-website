import { MainLayout } from '@/components/layout/MainLayout';

export default function StudioTermsPage() {
  return <MainLayout title="RacePic – Bedingungen für Fotograf:innen" noindex>
    <article className="container max-w-3xl space-y-6 py-14 leading-relaxed">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Fassung vom 22. September 2026 · Entwurf</p><h1 className="mt-2 font-heading text-3xl font-bold">Bedingungen für Fotograf:innen</h1></div>
      <p>Mit der Registrierung beantragst du Zugang zum RacePic Studio. Der MSC prüft und vergibt Upload-Rechte je Veranstaltung. Ein Konto allein berechtigt nicht zum Hochladen oder Veröffentlichen.</p>
      <section><h2 className="font-heading text-xl font-bold">Deine Bildrechte</h2><p>Du bestätigst, dass du die nötigen Rechte an hochgeladenen Bildern besitzt und keine Rechte Dritter verletzt. Du behältst deine Urheberrechte. Dem MSC räumst du ein nicht ausschließliches Recht ein, die Bilder für RacePic und die Vereinsberichterstattung zur jeweiligen Veranstaltung anzuzeigen, technisch zu bearbeiten und zur Erkennung von Startnummern und Fahrzeugen automatisiert auszuwerten.</p></section>
      <section><h2 className="font-heading text-xl font-bold">Lizenzen und Veröffentlichung</h2><p>Du wählst die Lizenz für Dritte. Der MSC kann Bilder bei Widersprüchen oder Rechtsbedenken verbergen oder entfernen. Bereits erlaubte Nutzungen unter einer früheren Lizenz werden durch spätere Änderungen nicht rückwirkend aufgehoben. Kostenpflichtige Angebote sind derzeit nur interne Entwürfe und werden nicht verkauft.</p></section>
      <section><h2 className="font-heading text-xl font-bold">Personen und sensible Inhalte</h2><p>Lade nur Bilder hoch, deren Veröffentlichung im Rahmen der Veranstaltung zulässig ist. Nahaufnahmen erkennbarer Personen, bei denen die Person statt Fahrzeug oder Veranstaltung im Vordergrund steht, benötigen besondere Prüfung. RacePic setzt keine Gesichtserkennung ein.</p></section>
      <section><h2 className="font-heading text-xl font-bold">Entfernung und Kontakt</h2><p>Eigene Bilder kannst du verbergen; Entwürfe kannst du löschen. Für weitere Anfragen und Rechtewidersprüche erreichst du den MSC unter info@msc-oberlausitzer-dreilaendereck.eu.</p></section>
      <p className="rounded-lg border bg-muted/50 p-4 text-sm">Dieser Text ist ein Entwurf für interne Tests. Vor einer öffentlichen Freischaltung ist die rechtliche und datenschutzrechtliche Freigabe vorgesehen.</p>
    </article>
  </MainLayout>;
}
