import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'de', 'it','hi','fr','es','ja','ko','pt','ru','zh'],
  defaultLocale: 'en'
});