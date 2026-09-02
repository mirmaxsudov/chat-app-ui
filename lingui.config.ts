import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['uz', 'ru', 'en', 'uz-Cyrl'],
  catalogs: [
    {
      path: '<rootDir>/src/utils/i18n/locales/{locale}',
      include: ['src']
    }
  ],
  format: formatter({
    origins: false,
    lineNumbers: false
  })
});
