import { Link } from 'react-router-dom';

/** Rueckkehrseite bei abgebrochener oder abgelaufener Stripe Checkout Session (Marketplace-Plan AP15). */
export default function RacePicCheckoutCancelledPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-3xl font-black">Bestellung abgebrochen</h1>
      <p className="mt-4 text-muted-foreground">Es wurde nichts bezahlt. Du kannst es jederzeit erneut versuchen.</p>
      <Link to="/racepic" className="mt-8 inline-block text-sm text-accent hover:underline">
        Zurück zu RacePic
      </Link>
    </main>
  );
}
