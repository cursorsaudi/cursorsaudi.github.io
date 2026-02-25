import ar from "./ar.json";
import en from "./en.json";

const i18n = { ar, en } as const;

export type Language = keyof typeof i18n;
type TranslationKey = keyof typeof ar;

export function getTranslation(lang: Language, key: string): string {
  const dictionary = i18n[lang] as Record<string, string> | undefined;
  return dictionary?.[key] ?? key;
}

export function t(lang: Language, key: TranslationKey): string {
  return i18n[lang][key];
}

