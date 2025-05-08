import React, { useState } from 'react';

import { ColumnsLayout } from 'renderer/components/ui';

import { AddPrivateTask } from './AddPrivateTask/AddPrivateTask';
import { AdvancedButton } from './AdvancedButton';

interface Props {
  columnsLayout: ColumnsLayout;
}

export function AdvancedOptions({ columnsLayout }: Props) {
  const [isAddPrivateTaskVisible, setIsAddPrivateTaskVisible] = useState(false);

  const handleAdvancedButtonClick = () => {
    setIsAddPrivateTaskVisible((prevState) => !prevState);
  };

  const handleAddPrivateTaskClose = () => {
    setIsAddPrivateTaskVisible(false);
  };

  const animationClasses = isAddPrivateTaskVisible
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-95';

  return (
    <div className="z-50">
      <div
        className={`transition-all duration-500 ease-in-out transform ${animationClasses}`}
      >
        {isAddPrivateTaskVisible && (
          <div>
            <AddPrivateTask
              columnsLayout={columnsLayout}
              onClose={handleAddPrivateTaskClose}
            />
          </div>
        )}
      </div>
      {!isAddPrivateTaskVisible && (
        <div className="pt-4 pl-4">
          <AdvancedButton onClick={handleAdvancedButtonClick} />
        </div>
      )}
    </div>
  );
}
