import { show } from '@ebay/nice-modal-react';

import { ConfirmRunTask, PropsType } from '../modals/ConfirmRunTask';

export const useConfirmRunTask = ({
  taskName,
  stake,
  onConfirm,
  ticker,
  decimals,
  isPrivate,
  pairedVariables,
  taskId,
}: PropsType) => {
  const showModal = () => {
    show(ConfirmRunTask, {
      taskName,
      taskId,
      pairedVariables,
      stake,
      onConfirm,
      ticker,
      decimals,
      isPrivate,
    });
  };

  return {
    showModal,
  };
};
