import en from './en.json';
import hi from './hi.json';
import ar from './ar.json';
import fr from './fr.json';
import es from './es.json';

export type Locale = 'en' | 'hi' | 'ar' | 'fr' | 'es';

type TranslationMap = Record<string, string>;
type TranslatorFn = (key: string) => string;

const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'hi', 'ar', 'fr', 'es'];

const translations: Record<Locale, TranslationMap> = { en, hi, ar, fr, es };

/**
 * Returns a translator function for the given locale.
 *
 * Fallback chain:
 *   1. translations[locale][key]  — if non-empty string, return it
 *   2. translations['en'][key]    — if non-empty string, return it
 *   3. raw key string             — last resort so UI never shows empty labels
 *
 * Any unrecognised `lang` value falls back to 'en'.
 */
export function useTranslations(lang: string): TranslatorFn {
  const locale: Locale = (SUPPORTED_LOCALES as readonly string[]).includes(lang)
    ? (lang as Locale)
    : 'en';

  return function t(key: string): string {
    const localeValue = translations[locale][key];
    if (localeValue !== undefined && localeValue !== '') {
      return localeValue;
    }

    const enValue = translations['en'][key];
    if (enValue !== undefined && enValue !== '') {
      return enValue;
    }

    return key;
  };
}
