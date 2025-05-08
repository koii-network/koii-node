import { Icon, KeyUnlockLine, CloseLine } from '@_koii/koii-styleguide';
import { create, useModal } from '@ebay/nice-modal-react';
import { compare } from 'bcryptjs';
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import { map } from 'lodash';
import { PinInput } from 'renderer/components/PinInput';
import { Button } from 'renderer/components/ui';
import { usePinUtils } from 'renderer/features/auth/hooks';
import { useCloseWithEsc } from 'renderer/features/common/hooks/useCloseWithEsc';
import { Modal, ModalContent } from 'renderer/features/modals';
import { useUserAppConfig } from 'renderer/features/settings/hooks/useUserAppConfig';
import {
  getEncryptedSecretPhraseMap,
  QueryKeys,
  saveEncryptedSecretPhrase,
} from 'renderer/services';
import { Theme } from 'renderer/types/common';

import { encryptSeedPhraseWithNewPin } from './utils';

export const UpdatePinModal = create(function UpdatePinModal() {
  const [oldPinError, setOldPinError] = useState<string>();
  const [oldPinRawValue, setOldPinValue] = useState('');
  const { encryptPin } = usePinUtils();
  const { handleSaveUserAppConfigAsync, isMutating, userConfig } =
    useUserAppConfig({
      onConfigSaveSuccess: () => {
        modal.remove();
      },
    });

  const { data: encryptedSecretPhraseMap, isLoading } = useQuery(
    [QueryKeys.EncryptedSecretPhraseMap],
    getEncryptedSecretPhraseMap
  );

  const [focus, setFocus] = useState(true);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const modal = useModal();
  const encryptedOldPin = userConfig?.pin;
  const pinIsMatching = useMemo(() => pin === pinConfirm, [pin, pinConfirm]);
  const pinsLengthIsMatching = useMemo(
    () => pin.length === 6 && pinConfirm.length === 6,
    [pin, pinConfirm]
  );

  const handlePinCreate = async () => {
    try {
      if (
        pinIsMatching &&
        pinsLengthIsMatching &&
        encryptedOldPin &&
        encryptedSecretPhraseMap
      ) {
        const pinMatchesStoredHash = await compare(
          oldPinRawValue,
          userConfig?.pin || ''
        );

        if (!pinMatchesStoredHash) {
          setOldPinError('Old PIN is incorrect');
          return;
        }

        const hashedPin = await encryptPin(pinConfirm);

        /**
         * Since users with the previous version of the app might have their secret phrases encrypted with the old pin,
         * we need to attempt to decrypt the secret phrases with the decrypted old as well.
         */
        const encryptionTasks = map(
          encryptedSecretPhraseMap,
          async (encryptedSecretPhrase, key) => {
            try {
              const newEncryptedValue = await encryptSeedPhraseWithNewPin(
                oldPinRawValue,
                pinConfirm,
                encryptedSecretPhrase,
                key
              );
              return newEncryptedValue;
            } catch (error) {
              try {
                if (!userConfig?.pin) {
                  console.log('No old pin found in userConfig');
                  throw new Error('No old pin found in userConfig');
                }
                /**
                 * Attempt to decode the secret phrase with the old pin (hashed) from user settings
                 */
                const newEncryptedValue = await encryptSeedPhraseWithNewPin(
                  userConfig?.pin,
                  pinConfirm,
                  encryptedSecretPhrase,
                  key
                );
                return newEncryptedValue;
              } catch (secondError) {
                console.error(
                  `Decryption of the seedphrase for the Public Key ${key} failed for both raw and hashed pins:`
                );
                throw new Error(
                  `Decryption of the seedphrase for the Public Key ${key} failed`
                );
              }
            }
          }
        );

        try {
          // Await all encryption tasks to complete
          const newSecretPhraseEncryptions = await Promise.all(
            Object.values(encryptionTasks)
          );

          // Transform the array back to the object with the same keys
          const newEncryptedSecretPhraseMap = Object.keys(
            encryptedSecretPhraseMap
          ).reduce<Record<string, string>>((acc, publicKey, index) => {
            acc[publicKey] = newSecretPhraseEncryptions[index];
            return acc;
          }, {});

          // Save new pin and encrypted secret phrases
          await handleSaveUserAppConfigAsync({
            settings: { pin: hashedPin, hasCopiedReferralCode: false },
          });

          await saveEncryptedSecretPhrase(newEncryptedSecretPhraseMap);
          console.log('Encryptions updated successfully');
        } catch (error) {
          throw new Error(error as string);
        }
      }
    } catch (error) {
      console.error('Operation failed, no changes were applied:', error);
      setOldPinError((error as any).message);
    }
  };

  const handlePinSubmit = (pin: string) => {
    setFocus(false);
    setPin(pin);
  };

  const handleClose = () => {
    modal.remove();
  };

  useCloseWithEsc({ closeModal: handleClose });

  if (isLoading) {
    return null;
  }

  return (
    <Modal>
      <ModalContent
        theme={Theme.Dark}
        className="w-[680px] text-white pt-4 pb-6"
      >
        <div className="flex justify-between p-3">
          <div className="flex items-center justify-between pl-9">
            <Icon source={KeyUnlockLine} className="w-6 h-8 mr-5 text-white" />
            <span className="text-2xl">Update PIN</span>
          </div>
          <Icon
            source={CloseLine}
            className="w-8 h-8 cursor-pointer"
            onClick={handleClose}
          />
        </div>

        <div className="flex flex-col items-center justify-center mt-4">
          <div className="flex flex-col gap-6">
            <div className="">
              <div className="mb-2 text-md w-fit">Old PIN.</div>
              <PinInput
                focus
                onComplete={(value) => {
                  setOldPinValue(value);
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="">
                <div className="mb-2 text-md w-fit">New PIN</div>
                <PinInput onComplete={handlePinSubmit} />
              </div>

              <div>
                <div className="mb-2 text-md w-fit">Confirm New PIN.</div>
                <PinInput
                  focus={!pinConfirm && !focus}
                  onChange={(pin) => setPinConfirm(pin)}
                  key={pin}
                />
              </div>
            </div>
          </div>

          {oldPinError ? (
            <div className="pt-4 text-xs text-finnieRed">{oldPinError}</div>
          ) : (
            <div className="pt-4 text-xs text-finnieOrange">
              {!pinIsMatching && pinsLengthIsMatching ? (
                <span>
                  Oops! These PINs don’t match. Double check it and try again.
                </span>
              ) : (
                <span>
                  If you forgot your PIN you’ll need to reimport your wallet.
                </span>
              )}
            </div>
          )}

          <Button
            disabled={!pinIsMatching || !pinsLengthIsMatching || isMutating}
            label="Confirm PIN"
            onClick={handlePinCreate}
            className="py-2 mt-6 mr-3 bg-finnieGray-light text-finnieBlue w-60"
            loading={isMutating}
          />
        </div>
      </ModalContent>
    </Modal>
  );
});
