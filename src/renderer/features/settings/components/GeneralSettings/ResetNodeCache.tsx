import { Button, ButtonSize, ButtonVariant } from '@_koii/koii-styleguide';
import React from 'react';

import { useConfirmModal } from 'renderer/features/shared';

export function ResetNodeCache() {
  const { showModal: confirmCacheReset } = useConfirmModal({
    header: 'Reset Node Cache',
    content: 'Are you sure you want to reset the node cache?',
  });

  const resetNodeCache = () => {
    confirmCacheReset().then(async (confirmed) => {
      if (confirmed) {
        await window.main.resetTasksCache();
        window.location.reload();
      }
    });
  };

  return (
    <div className="flex justify-end w-fit mr-auto">
      <Button
        onClick={resetNodeCache}
        label="Reset Cache"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.SM}
        buttonClassesOverrides="!border-white !text-white text-sm px-6 py-6"
      />
    </div>
  );
}
