declare module 'puppeteer-chromium-resolver' {
  interface PCRStats {
    executablePath: string;
    // Add other properties as needed
  }

  interface PCROptions {
    revision?: string;
    detectionPath?: string;
    download?: boolean;
  }

  function PCR(options?: PCROptions): Promise<PCRStats>;
  export default PCR;
}
