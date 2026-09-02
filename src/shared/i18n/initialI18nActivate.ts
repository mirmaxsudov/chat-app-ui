import Cookies from 'js-cookie';
import { COOKIES } from '@/shared/constants';
import { APP_LOCALES, type Locale, SOURCE_LOCALE } from './config';
import { dynamicActivate } from './dynamicActivate';

export const initialI18nActivate = () => {
  const locale = (Cookies.get(COOKIES.LOCALE) || SOURCE_LOCALE) as Locale;

  if (APP_LOCALES.includes(locale)) Cookies.set(COOKIES.LOCALE, locale, { expires: 365 });
  else Cookies.set(COOKIES.LOCALE, SOURCE_LOCALE, { expires: 365 });

  void dynamicActivate(locale);
};
