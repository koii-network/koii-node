import { show } from '@ebay/nice-modal-react';

import {
  PropsType,
  RecoverStakingAccount,
} from '../modals/RecoverStakingAccount';

export const useRecoverStakingAccount = ({
  isKPLStakingAccount,
}: PropsType) => {
  const showModal = () => {
    return show(RecoverStakingAccount, { isKPLStakingAccount });
  };

  return {
    showModal,
  };
};
