import type { LocalizationResource } from '@clerk/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, esES, frFR } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'Glass Installation Workflow HQ',
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localePrefix,
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  es: esES,
  fr: frFR,
};

export const ClerkLocalizations = {
  defaultLocale: esES,
  supportedLocales,
};
