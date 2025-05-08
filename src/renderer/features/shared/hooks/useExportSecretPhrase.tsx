import { show } from '@ebay/nice-modal-react';

import { ExportSecretPhrase } from '../modals/ExportSecretPhrase';

type ParamsType = {
  accountName: string;
  publicKey: string;
};

export const useExportSecretPhrase = ({
  accountName,
  publicKey,
}: ParamsType) => {
  const showModal = () => {
    show(ExportSecretPhrase, { accountName, publicKey });
  };

  return {
    showModal,
  };
};
