import {
  Icon,
  CloseLine,
  SettingsLine,
  WarningTriangleFill,
} from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import React from 'react';

import { Button } from 'renderer/components/ui';
import { Modal, ModalContent } from 'renderer/features/modals';
import { Theme } from 'renderer/types/common';

export const RentExemptionFlow = create(function EditTaskVariable() {
  const modal = useModal();

  return (
    <Modal>
      <ModalContent
        theme={Theme.Dark}
        className="text-left p-5 pl-10 w-max h-fit rounded text-white flex flex-col gap-4 min-w-[740px]"
      >
        <div className="w-full flex justify-center items-center gap-4 text-2xl font-semibold pt-2">
          <Icon source={SettingsLine} className="h-8 w-8" />
          <span>Rent Exemption</span>
          <Icon
            source={CloseLine}
            className="h-8 w-8 ml-auto cursor-pointer"
            onClick={modal.remove}
          />
        </div>

        <div className="w-[668px] leading-8 ">
          <p>
            During every task one node is selected to submit the rewards list.
            To submit this list, the node must have some KOII in its staking
            account.
          </p>
          <div className="h-2" />
          <p>
            For now, just 0.5 KOII in the staking account is plenty to make sure
            you don’t pay to submit. The node that submits the list earns a
            larger percentage of the bounty.
          </p>
        </div>

        <div className="text-orange-2 bg-purple-5 rounded-md p-2 flex items-center text-sm gap-2 mb-8">
          <Icon source={WarningTriangleFill} color="#FFC78F" size={14} />
          <p>
            Not having enough tokens to submit this list can cause you to lose
            reputation.
          </p>
        </div>

        <Button
          label="Got It"
          onClick={modal.remove}
          className="m-auto font-semibold bg-finnieGray-tertiary text-finnieBlue-light w-56 h-12"
        />
      </ModalContent>
    </Modal>
  );
});
