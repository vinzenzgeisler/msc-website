import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function MainLayout({ children, title, description }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO title={title} description={description} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
