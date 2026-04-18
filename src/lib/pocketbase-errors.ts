import { ClientResponseError } from 'pocketbase';

function extractFieldMessages(error: ClientResponseError) {
  const data = error.response?.data;
  if (!data || typeof data !== 'object') return [];

  return Object.values(data)
    .map((value) => {
      if (value && typeof value === 'object' && 'message' in value) {
        return String(value.message || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

export function getPocketBaseErrorMessage(error: unknown, fallback = 'Speichern fehlgeschlagen') {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const fieldMessages = extractFieldMessages(error);
  if (fieldMessages.length > 0) {
    return fieldMessages.join(' ');
  }

  const message = String(error.response?.message || error.message || '').trim();
  const raw = `${message} ${JSON.stringify(error.response?.data || {})}`;

  if (raw.includes('create rule failure') && raw.includes('sql: no rows in result set')) {
    return 'Die CMS-Sitzung ist wahrscheinlich veraltet oder die Live-PocketBase nutzt noch alte Collection-Rules. Bitte neu anmelden und die PocketBase-Konfiguration auf der Instanz prüfen.';
  }

  if (raw.includes('create rule failure') || raw.includes('update rule failure') || raw.includes('delete rule failure')) {
    return 'Die PocketBase-Zugriffsregel für diesen Datentyp blockiert den Vorgang. Bitte Collections und Rules prüfen.';
  }

  if (error.status === 404 && raw.includes('sql: no rows in result set')) {
    return 'Der benötigte Datensatz oder eine Rule auf der PocketBase-Instanz fehlt. Bitte Migrationen und Collection-Rules prüfen.';
  }

  if (error.status === 404) {
    return 'Die angeforderte PocketBase-Ressource wurde nicht gefunden.';
  }

  if (error.status === 400 && message) {
    return message;
  }

  if (message) {
    return message;
  }

  return fallback;
}
