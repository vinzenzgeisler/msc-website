import type { NewsletterLocale } from '@/integrations/event-backend/client';
import type { Locale } from '@/i18n/translations';

export const toNewsletterLocale = (locale: Locale): NewsletterLocale => locale === 'cz' ? 'cs' : locale;

export const newsletterCopy = {
  de: {
    title: 'Nichts mehr verpassen', subtitle: 'Termine, Neuigkeiten und Einblicke aus dem Vereinsleben direkt ins Postfach.',
    email: 'E-Mail-Adresse', submit: 'Newsletter abonnieren', submitting: 'Wird gesendet …',
    privacyPrefix: 'Ich habe die', privacy: 'Datenschutzerklärung', privacySuffix: 'gelesen und stimme der beschriebenen Verarbeitung für den Newsletter zu.',
    successTitle: 'Fast geschafft!', success: 'Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte prüfe auch deinen Spam-Ordner.',
    error: 'Die Anmeldung konnte gerade nicht gesendet werden. Bitte versuche es später erneut.', required: 'Bitte gib eine gültige E-Mail-Adresse ein und bestätige die Einwilligung.',
    unsubscribe: 'Newsletter abbestellen', unsubscribeHint: 'Gib deine E-Mail-Adresse ein. Wir senden dir einen sicheren Abmeldelink.', sendLink: 'Abmeldelink senden',
    linkSent: 'Wenn die Adresse bei uns registriert ist, erhältst du gleich einen Abmeldelink.',
    confirmed: 'Deine Anmeldung ist bestätigt. Willkommen im MSC-Newsletter!', alreadyConfirmed: 'Diese Anmeldung wurde bereits bestätigt.',
    unsubscribed: 'Du wurdest erfolgreich vom Newsletter abgemeldet.', alreadyUnsubscribed: 'Diese Adresse ist bereits abgemeldet.', expired: 'Dieser Link ist abgelaufen. Bitte starte den Vorgang erneut.', invalid: 'Dieser Link ist ungültig.'
  },
  en: {
    title: 'Stay in the loop', subtitle: 'Dates, news and stories from our club, delivered to your inbox.', email: 'Email address', submit: 'Subscribe', submitting: 'Sending …',
    privacyPrefix: 'I have read the', privacy: 'privacy policy', privacySuffix: 'and consent to the processing described there for the newsletter.', successTitle: 'Almost there!', success: 'We sent you a confirmation email. Please also check your spam folder.', error: 'Your request could not be sent. Please try again later.', required: 'Enter a valid email address and confirm your consent.', unsubscribe: 'Unsubscribe', unsubscribeHint: 'Enter your email address and we will send you a secure unsubscribe link.', sendLink: 'Send unsubscribe link', linkSent: 'If the address is registered, an unsubscribe link will arrive shortly.', confirmed: 'Your subscription is confirmed. Welcome!', alreadyConfirmed: 'This subscription has already been confirmed.', unsubscribed: 'You have been unsubscribed successfully.', alreadyUnsubscribed: 'This address is already unsubscribed.', expired: 'This link has expired. Please start again.', invalid: 'This link is invalid.'
  },
  cz: {
    title: 'Ať vám nic neunikne', subtitle: 'Termíny, novinky a dění v klubu přímo do vaší schránky.', email: 'E-mailová adresa', submit: 'Přihlásit k odběru', submitting: 'Odesílání …', privacyPrefix: 'Přečetl/a jsem si', privacy: 'zásady ochrany osobních údajů', privacySuffix: 'a souhlasím se zpracováním popsaným pro newsletter.', successTitle: 'Téměř hotovo!', success: 'Poslali jsme vám potvrzovací e-mail. Zkontrolujte také složku se spamem.', error: 'Požadavek se nepodařilo odeslat. Zkuste to prosím později.', required: 'Zadejte platnou e-mailovou adresu a potvrďte souhlas.', unsubscribe: 'Odhlásit newsletter', unsubscribeHint: 'Zadejte e-mail a pošleme vám bezpečný odhlašovací odkaz.', sendLink: 'Poslat odhlašovací odkaz', linkSent: 'Pokud je adresa registrovaná, brzy obdržíte odhlašovací odkaz.', confirmed: 'Odběr je potvrzen. Vítejte!', alreadyConfirmed: 'Tento odběr již byl potvrzen.', unsubscribed: 'Odběr newsletteru byl úspěšně zrušen.', alreadyUnsubscribed: 'Tato adresa je již odhlášena.', expired: 'Platnost odkazu vypršela. Začněte prosím znovu.', invalid: 'Tento odkaz je neplatný.'
  },
  pl: {
    title: 'Bądź na bieżąco', subtitle: 'Terminy, aktualności i życie klubu prosto do Twojej skrzynki.', email: 'Adres e-mail', submit: 'Zapisz się', submitting: 'Wysyłanie …', privacyPrefix: 'Zapoznałem(-am) się z', privacy: 'polityką prywatności', privacySuffix: 'i wyrażam zgodę na opisane przetwarzanie danych na potrzeby newslettera.', successTitle: 'Prawie gotowe!', success: 'Wysłaliśmy wiadomość z potwierdzeniem. Sprawdź także folder spam.', error: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.', required: 'Podaj prawidłowy adres e-mail i potwierdź zgodę.', unsubscribe: 'Wypisz się', unsubscribeHint: 'Podaj adres e-mail, a wyślemy bezpieczny link do rezygnacji.', sendLink: 'Wyślij link', linkSent: 'Jeśli adres jest zarejestrowany, wkrótce otrzymasz link do rezygnacji.', confirmed: 'Subskrypcja została potwierdzona. Witamy!', alreadyConfirmed: 'Ta subskrypcja została już potwierdzona.', unsubscribed: 'Newsletter został pomyślnie anulowany.', alreadyUnsubscribed: 'Ten adres jest już wypisany.', expired: 'Ten link wygasł. Rozpocznij ponownie.', invalid: 'Ten link jest nieprawidłowy.'
  }
} as const;
