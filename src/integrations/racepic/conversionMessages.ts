import type { OfferConversionStatus } from './client';

/** Verstaendliche Meldung zu einem Fehlercode des FREE->PAID-Antrags (Backend: api/src/commerce/conversionRoutes.ts). */
export const conversionErrorMessage = (code: string | undefined): string => {
  switch (code) {
    case 'CONVERSION_IMAGE_NOT_ELIGIBLE':
      return 'Mindestens ein Bild kann nicht umgestellt werden. Möglich sind nur eigene, veröffentlichte, kostenlose Bilder mit fertiger Verarbeitung.';
    case 'CONVERSION_IMAGE_ALREADY_PENDING':
      return 'Für mindestens eines dieser Bilder läuft bereits ein Antrag.';
    case 'CONVERSION_INVALID_LICENSE':
      return 'Bitte eine gültige kostenpflichtige Lizenz wählen.';
    case 'CONVERSION_INVALID_PRICE':
      return 'Bitte eine der angebotenen Preisstufen wählen.';
    case 'CONVERSION_RIGHTS_NOT_CONFIRMED':
      return 'Bitte bestätige zuerst deine Rechte an den Bildern.';
    case 'CONVERSION_PHOTOGRAPHER_NOT_ELIGIBLE':
      return 'Dein Zugang ist für kostenpflichtige Angebote noch nicht freigeschaltet.';
    case 'CONVERSION_QUEUE_UNAVAILABLE':
      return 'Die Vorbereitung ist gerade nicht erreichbar. Der Antrag ist gespeichert; bitte erneut absenden.';
    case 'COMMERCE_DISABLED':
      return 'Kostenpflichtige Angebote sind noch nicht freigeschaltet.';
    case 'NOT_AUTHENTICATED':
      return 'Bitte melde dich erneut an.';
    default:
      return 'Der Antrag konnte nicht gesendet werden. Bitte später erneut versuchen.';
  }
};

export const CONVERSION_STATUS_LABEL: Record<OfferConversionStatus, string> = {
  REQUESTED: 'Beantragt',
  PREPARING_ASSETS: 'Dateien werden vorbereitet',
  READY_FOR_REVIEW: 'Wartet auf Prüfung',
  APPROVED: 'Freigegeben',
  REJECTED: 'Abgelehnt',
  FAILED: 'Fehlgeschlagen',
};

/** Antraege, die ein Bild noch fuer neue Antraege sperren. */
export const OPEN_CONVERSION_STATUSES: readonly OfferConversionStatus[] = ['REQUESTED', 'PREPARING_ASSETS', 'READY_FOR_REVIEW'];
