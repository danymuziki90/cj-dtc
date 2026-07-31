import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This includes /api, /_next, /admin, and all files with an extension (e.g. .svg, .png)
  matcher: ['/((?!api|_next|admin|.*\\..*).*)']
};
