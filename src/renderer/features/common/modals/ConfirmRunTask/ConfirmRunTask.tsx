import { CloseLine, Icon } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import ExclamationMarkIcon from 'assets/svgs/exclamation-mark-icon.svg';
import { isEmpty } from 'lodash';
import { ROE, TaskId, TaskPairing } from 'models';
import { LoadingSpinner } from 'renderer/components/ui';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';
import { getKoiiFromRoe } from 'utils';

import { useTasksConsumingVariables } from '../../hooks/useTasksConsumingVariables';

import { ConfirmRunView } from './components/ConfirmRunView';
import { VariablesConflictView } from './components/VariablesConflictView';

export type PropsType = {
  taskName: string;
  stake: ROE;
  onConfirm: () => void;
  ticker?: string;
  decimals?: number;
  isPrivate?: boolean;
  pairedVariables: TaskPairing;
  taskId: TaskId;
};

export const ConfirmRunTask = create<PropsType>(function ConfirmRunTask({
  taskName,
  stake,
  onConfirm,
  ticker,
  decimals,
  isPrivate,
  pairedVariables,
  taskId,
}) {
  const modal = useModal();
  const [ignoreConflicts, setIgnoreConflicts] = React.useState(false);

  const handleConfirm = () => {
    onConfirm();
    modal.remove();
  };

  useCloseWithEsc({ closeModal: modal.remove });

  const stakeAmountToDisplay =
    ticker && decimals ? stake / 10 ** decimals : getKoiiFromRoe(stake);

  const shouldFetchTasksConsumingVariables =
    !!pairedVariables && !isEmpty(pairedVariables) && !!taskId;

  const { tasksPairedWithVariables, isLoadingTasksConsumingVariables } =
    useTasksConsumingVariables({
      pairedVariables,
      taskId,
      enabled: shouldFetchTasksConsumingVariables,
    });

  return (
    <Modal>
      <ModalContent
        theme={Theme.Dark}
        className="text-left px-7 py-5 h-fit rounded text-white flex flex-col gap-4 w-[586px]"
      >
        <div className="flex items-center justify-center w-full gap-4 pt-2 text-2xl font-semibold">
          <Icon source={ExclamationMarkIcon} className="w-11 h-11 text-white" />
          <span>Confirm to Run</span>
          <Icon
            source={CloseLine}
            className="w-8 h-8 ml-auto cursor-pointer"
            onClick={modal.remove}
          />
        </div>

        {isLoadingTasksConsumingVariables ? (
          <div className="flex items-center justify-center w-full min-h-[200px]">
            <LoadingSpinner className="m-auto" />
          </div>
        ) : shouldFetchTasksConsumingVariables &&
          !ignoreConflicts &&
          tasksPairedWithVariables &&
          Object.keys(tasksPairedWithVariables).length > 0 ? (
          <VariablesConflictView
            tasksPairedWithVariables={tasksPairedWithVariables}
            taskName={taskName}
            onIgnore={() => setIgnoreConflicts(true)}
          />
        ) : (
          <ConfirmRunView
            taskName={taskName}
            isPrivate={isPrivate}
            stakeAmountToDisplay={stakeAmountToDisplay}
            ticker={ticker}
            onConfirm={handleConfirm}
          />
        )}
      </ModalContent>
    </Modal>
  );
});
