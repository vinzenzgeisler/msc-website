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
   * Bug gefunden 2026-09-23 (Nutzer-Feedback, in dieser Reihenfolge: "der RacePic Schriftzug
   * unterstützt kein Gelb wenn man auf dem Menüpunkt ist. Da müsste das 'Pic' weiß werden" ->
   * "muss auch bei hovern dunkel [werden]" -> "ich wollte nicht blauen Button Hintergrund sondern
   * weiterhin gelb aber die Schrift soll schwarz, bis auf 'PIC' der soll blau"): der Hintergrund
   * bleibt Akzentgelb (Header.tsx nutzt wieder bg-accent/hover:bg-accent wie jedes andere
   * Nav-Item). "Race" ist fest in der normalen Vordergrundfarbe (im Dark Mode hell) und "Pic" fest
   * in Akzentgelb eingefärbt - beides unlesbar auf demselben Gelb. `active` faerbt "Race" schwarz
   * und "Pic" blau (`text-primary`, dieselbe Markenfarbe wie sonst auf der Seite); der Elternknoten
   * in Header.tsx traegt zusaetzlich `group`, sodass `group-hover:*` denselben Effekt beim Hovern
   * ausloest (ein reiner CSS-Zustand, den diese Komponente nicht als Prop kennen kann).
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
      <span className={cn('group-hover:text-primary', active ? 'text-primary' : 'text-accent')}>Pic</span>
    </span>
  );
}
