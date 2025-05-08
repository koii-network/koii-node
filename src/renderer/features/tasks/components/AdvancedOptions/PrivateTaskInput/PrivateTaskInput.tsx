import { CheckSuccessLine, CloseLine, Icon } from '@_koii/koii-styleguide';
import React, { useMemo } from 'react';

import InputField from 'renderer/components/InputField';
import { Button, LoadingSpinner } from 'renderer/components/ui';
import { Task } from 'renderer/types';

type PropsType = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  taskPubkey: string;
  loadingTask: boolean;
  task: Task | null | undefined;
  onClose: () => void;
  alreadyStarted?: boolean;
};

export function PrivateTaskInput({
  onChange,
  taskPubkey,
  loadingTask,
  task,
  onClose,
  alreadyStarted,
}: PropsType) {
  const canRunTask = useMemo(
    () => !!task && !alreadyStarted,
    [task, alreadyStarted]
  );

  return (
    <div className="flex items-center gap-4 pl-4 justify-self-start">
      <Button
        onlyIcon
        icon={<Icon source={CloseLine} size={18} onClick={onClose} />}
        data-testid="private_task_input_close"
      />
      <InputField
        className="w-[420px] mt-4"
        label=""
        name="private-task-pubKey"
        placeholder="Task ID"
        value={taskPubkey}
        onChange={onChange}
      />
      {loadingTask ? (
        <LoadingSpinner />
      ) : (
        canRunTask && (
          <Icon
            source={CheckSuccessLine}
            className="text-finnieTeal"
            size={20}
            aria-label="Check Success"
          />
        )
      )}
    </div>
  );
}
