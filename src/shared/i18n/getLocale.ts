import Cookies from 'js-cookie';

import { COOKIES } from '@/shared/constants';
import { SOURCE_LOCALE } from './config';

export const getLocale = () => {
  return Cookies.get(COOKIES.LOCALE) || SOURCE_LOCALE;
};
