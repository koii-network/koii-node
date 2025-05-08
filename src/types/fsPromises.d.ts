declare const fsPromises: any;

declare module 'fs/promises' {
  export = fsPromises;
}
