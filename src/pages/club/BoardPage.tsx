import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

// Mock board members
const boardMembers = [
  {
    id: 1,
    name: 'Max Mustermann',
    role: '1. Vorsitzender',
    email: 'vorsitzender@msc-oberlausitzer-dreilaendereck.de',
  },
  {
    id: 2,
    name: 'Erika Musterfrau',
    role: '2. Vorsitzende',
    email: 'stellvertreter@msc-oberlausitzer-dreilaendereck.de',
  },
  {
    id: 3,
    name: 'Hans Schmidt',
    role: 'Schatzmeister',
    email: 'finanzen@msc-oberlausitzer-dreilaendereck.de',
  },
  {
    id: 4,
    name: 'Anna Müller',
    role: 'Schriftführerin',
    email: 'info@msc-oberlausitzer-dreilaendereck.de',
  },
  {
    id: 5,
    name: 'Peter Weber',
    role: 'Sportwart',
    email: 'sport@msc-oberlausitzer-dreilaendereck.de',
  },
];

export default function BoardPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.board}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Unser Vorstandsteam
          </p>
        </div>
      </section>

      {/* Board Members */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {boardMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                {/* Avatar Placeholder */}
                <div className="flex h-48 items-center justify-center bg-muted">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="mb-4 text-primary">{member.role}</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
