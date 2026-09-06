/**
 * Ambient module declarations so TypeScript understands the non-TS imports that
 * Expo's Metro bundler handles at build time (CSS / CSS Modules used by the
 * starter template's web components). Without this, `tsc --noEmit` reports
 * "Cannot find module" for `*.css` imports even though the app runs fine.
 */

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
