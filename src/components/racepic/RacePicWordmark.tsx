import { cn } from '@/lib/utils';

/**
 * RacePic-Wortmarke (Paket 14): reines CSS/Tailwind statt SVG/Bild, damit sie bei jeder Größe
 * scharf bleibt und automatisch mit dem Light-/Dark-Theme mitzieht. Baut bewusst auf der
 * bestehenden Bildsprache der Website auf (Oswald/`font-heading`, `--accent`-Gelb, `--radius: 0`)
 * statt eine neue Submarke von Grund auf zu erfinden - "Race" in der normalen Vordergrundfarbe,
 * "Pic" in Akzentgelb, mit einem leichten Skew für den Racing-Charakter.
 */
const sizeClasses = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-5xl sm:text-6xl',
} as const;

export type RacePicWordmarkSize = keyof typeof sizeClasses;

export function RacePicWordmark({ size = 'md', className }: { size?: RacePicWordmarkSize; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex -skew-x-6 items-baseline font-heading font-black uppercase tracking-tight',
        sizeClasses[size],
        className,
      )}
    >
      <span className="text-foreground">Race</span>
      <span className="text-accent">Pic</span>
    </span>
  );
}
