import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  localeDetection: true
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/en/:path*']
};