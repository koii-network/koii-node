import React from 'react';

import { Button } from 'renderer/components/ui/Button';

type PropsType = {
  onClose: () => void;
};

function SuccessView({ onClose }: PropsType) {
  return (
    <div className="mt-10">
      <p>Well done! You can now run KPL tasks</p>
      <div className="flex justify-center mt-10">
        <Button
          onClick={onClose}
          label="Close"
          className="font-semibold bg-white text-finnieBlue-light w-[220px] h-[48px]"
        />
      </div>
    </div>
  );
}

export default SuccessView;
