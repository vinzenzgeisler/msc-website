import { toAbsoluteUrl } from '@/lib/seo';

const dedicatedSocialImages: Record<string, string> = {
  'mitteilung-12-oberlausitzer-dreieck': '/social/news/mitteilung-12-oberlausitzer-dreieck.png',
};

export function getNewsSocialImageUrl(slug: string): string | null {
  const imagePath = dedicatedSocialImages[slug];
  return imagePath ? toAbsoluteUrl(imagePath) : null;
}
