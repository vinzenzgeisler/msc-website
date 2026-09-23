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

export function RacePicWordmark({
  size = 'md',
  className,
  active = false,
}: {
  size?: RacePicWordmarkSize;
  className?: string;
  /**
   * Bug gefunden 2026-09-23 (Nutzer-Feedback: "der RacePic Schriftzug unterstützt kein Gelb wenn
   * man auf dem Menüpunkt ist. Da müsste das 'Pic' weiß werden", spaeter: "muss auch bei hovern
   * dunkel [werden]. generell bei gelben hintergrund komplett schwarz"): "Pic" ist fest in
   * Akzentgelb eingefärbt, "Race" in der normalen Vordergrundfarbe (die im Dark Mode hell ist) -
   * beides wird auf einem Akzent-/Hover-Hintergrund (in Header.tsx bewusst zu Blau statt Gelb
   * geaendert, siehe dort) unlesbar. `active` faerbt BEIDE Woerter schwarz; der Elternknoten in
   * Header.tsx traegt zusaetzlich `group`, sodass `group-hover:text-black` denselben Effekt beim
   * Hovern auslöst (ein reiner CSS-Zustand, den diese Komponente nicht als Prop kennen kann).
   */
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex -skew-x-6 items-baseline font-heading font-black uppercase tracking-tight',
        sizeClasses[size],
        className,
      )}
    >
      <span className={cn('group-hover:text-black', active ? 'text-black' : 'text-foreground')}>Race</span>
      <span className={cn('group-hover:text-black', active ? 'text-black' : 'text-accent')}>Pic</span>
    </span>
  );
}
