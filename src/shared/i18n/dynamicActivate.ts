import { i18n } from '@lingui/core';

import { COOKIES } from '@/shared/constants';

import type { Locale } from './config';

import { APP_LOCALES, SOURCE_LOCALE } from './config';
import Cookies from 'js-cookie';

export const dynamicActivate = async (locale: Locale) => {
  if (!APP_LOCALES.includes(locale)) {
    console.warn(`Invalid locale "${locale}", defaulting to "en"`);
    locale = SOURCE_LOCALE;
  }
  const catalog = await import(`../../utils/i18n/locales/${locale}.po`);
  i18n.loadAndActivate({ locale, messages: catalog.messages });
  Cookies.set(COOKIES.LOCALE, locale, { expires: 365 });
};
