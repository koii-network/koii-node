import { DeleteTrashXlLine, Icon } from '@_koii/koii-styleguide';
import React, { useState } from 'react';

import { Button } from 'renderer/components/ui';
import {
  LoadingSpinner,
  LoadingSpinnerSize,
} from 'renderer/components/ui/LoadingSpinner';
import { Tooltip } from 'renderer/components/ui/Tooltip';
import { useDeleteAccountModal } from 'renderer/features/shared/hooks/useDeleteAccountModal';

type PropsType = {
  accountName: string;
  onAccountDelete: () => Promise<void>;
};

export function RemoveAccount({ onAccountDelete, accountName }: PropsType) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showModal: showConfirmModal } = useDeleteAccountModal({
    accountName,
  });
  const handleDeleteAccount = async () => {
    const isConfirmed = await showConfirmModal();
    if (isConfirmed) {
      setIsDeleting(true);
      await onAccountDelete();
    }
  };

  return isDeleting ? (
    <LoadingSpinner size={LoadingSpinnerSize.Medium} />
  ) : (
    <Tooltip placement="top-left" tooltipContent="Delete account">
      <Button
        disabled={isDeleting}
        onClick={handleDeleteAccount}
        icon={
          <Icon source={DeleteTrashXlLine} className="w-6 h-6 text-finnieRed" />
        }
        className="w-6.5 h-6.5 rounded-full bg-transparent outline-none mr-0"
      />
    </Tooltip>
  );
}
