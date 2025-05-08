import { show } from '@ebay/nice-modal-react';

import { NetworkUrlType } from 'renderer/features/shared/constants';

import { NetworkMigrationModal } from '../components/NetworkMigrationModal';

type ParamsType = {
  migrationPhase: 1 | 2;
  newNetworkRpcUrl: NetworkUrlType;
};

export const useNetworkMigrationModal = ({
  migrationPhase,
  newNetworkRpcUrl,
}: ParamsType) => {
  const showModal = () => {
    return show(NetworkMigrationModal, { migrationPhase, newNetworkRpcUrl });
  };

  return {
    showModal,
  };
};
