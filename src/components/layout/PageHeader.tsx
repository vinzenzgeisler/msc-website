import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, imageUrl, imageAlt, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
      {/* Racing stripe pattern */}
      <div className="absolute inset-0">
        <div className="racing-stripe h-full w-full" />
      </div>

      {/* Diagonal accent stripe */}
      <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent" />

      {/* Optional CMS background image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt={imageAlt || title} className="h-full w-full object-cover opacity-20" />
        </div>
      )}

      <div className="container relative z-10">
        <div className="pr-16 sm:pr-24 md:pr-32">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">{title}</h1>
          {subtitle && <p className="text-lg text-primary-foreground/80">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
