import apis from 'preload/apis';

declare global {
  interface Window {
    main: typeof apis;
  }
}
