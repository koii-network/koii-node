/* eslint-disable @cspell/spellchecker */

import { checkUpnpBinaryExists } from 'config/upnpPathResolver';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkUPnPBinary(_: Event) {
  const binaryExists = await checkUpnpBinaryExists();
  return binaryExists;
}
