const APP_LOCALES = ['uz', 'ru', 'en'] as const;
const SOURCE_LOCALE = 'en';

export type Locale = (typeof APP_LOCALES)[number];

export { APP_LOCALES, SOURCE_LOCALE };
