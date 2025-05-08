import { FetchAndSaveuPnPBinaryReturnValue } from 'models';

export const fetchAndSaveUPnPBinary =
  (): Promise<FetchAndSaveuPnPBinaryReturnValue> => {
    return window.main.fetchAndSaveUPnPBinary();
  };

export const checkUPnPbinary = (): Promise<boolean> => {
  return window.main.checkUPnPBinary();
};
