import { show } from '@ebay/nice-modal-react';

import { RentExemptionFlow } from '../modals/RunExemptionFlow';

export const useRunExemptionFlowModal = () => {
  const showModal = () => {
    show(RentExemptionFlow);
  };

  return {
    showModal,
  };
};
