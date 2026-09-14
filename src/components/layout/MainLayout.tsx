import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';

type StructuredDataValue = Record<string, unknown> | Array<Record<string, unknown>>;

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  imageUrl?: string | null;
  imageAlt?: string;
  articlePublishedTime?: string | null;
  articleModifiedTime?: string | null;
  structuredData?: StructuredDataValue;
}

export function MainLayout({
  children,
  title,
  description,
  canonicalPath,
  noindex,
  ogType,
  imageUrl,
  imageAlt,
  articlePublishedTime,
  articleModifiedTime,
  structuredData,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        noindex={noindex}
        ogType={ogType}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        articlePublishedTime={articlePublishedTime}
        articleModifiedTime={articleModifiedTime}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
