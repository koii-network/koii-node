import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PinInput } from 'renderer/components/PinInput';
import { Button } from 'renderer/components/ui';
import { Popover } from 'renderer/components/ui/Popover/Popover';
import { usePinUtils } from 'renderer/features/auth/hooks';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { MAINNET_RPC_URL } from 'renderer/features/shared/constants';
import { openBrowserWindow, switchNetwork } from 'renderer/services';
import { Theme } from 'renderer/types/common';
import { AppRoute } from 'renderer/types/routes';

import { useOnboardingContext } from '../../context/onboarding-context';

function CreatePin() {
  const { encryptPin } = usePinUtils();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [focus, setFocus] = useState(true);
  const navigate = useNavigate();
  const { handleSaveUserAppConfig } = useUserAppConfig({
    onConfigSaveSuccess: () =>
      navigate(AppRoute.OnboardingPickKeyCreationMethod),
  });

  const { setAppPin } = useOnboardingContext();

  const handlePinCreate = async () => {
    const hashedPin = await encryptPin(pin);

    /**
     * sets raw pin value to context
     */
    setAppPin(pin);

    await switchNetwork(MAINNET_RPC_URL);
    handleSaveUserAppConfig({
      settings: {
        /**
         * Saves **hashed** pin value to user config
         */
        pin: hashedPin,
        hasCopiedReferralCode: false,
        hasStartedTheMainnetMigration: true,
        hasFinishedTheMainnetMigration: true,
      },
    });
  };

  const pinIsMatching = useMemo(() => pin === pinConfirm, [pin, pinConfirm]);
  const pinsLengthIsMatching = useMemo(
    () => pin.length === 6 && pinConfirm.length === 6,
    [pin, pinConfirm]
  );

  const canLogIn = useCallback(() => {
    if (pinIsMatching && termsAccepted && pin.length === 6) {
      return true;
    }
    return false;
  }, [pin, pinIsMatching, termsAccepted]);

  const disableLogin = !canLogIn();

  const openTermsWindow = () => {
    openBrowserWindow('https://www.koii.network/terms');
  };

  const handlePinSubmit = (pin: string) => {
    setFocus(false);
    setPin(pin);
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center gap-[5vh] md2h:gap-[10vh] transition-all duration-300 ease-in-out">
      <div className="z-50 gap-4 md2h:gap-10 flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
        <div className="text-lg tracking-wide">
          Create an{' '}
          <Popover
            theme={Theme.Light}
            tooltipContent={
              <p className="max-w-[450px] xl:max-w-xl">
                You&apos;ll use this PIN to unlock your node. If you forget it,
                you can always reinstall your account using a secret phrase
              </p>
            }
          >
            <span className="underline underline-offset-4 text-finniePurple">
              Access PIN
            </span>
          </Popover>{' '}
          to secure the Node.
        </div>
        <PinInput focus onComplete={handlePinSubmit} />
      </div>

      <div className="gap-4 md2h:gap-10 flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
        <div className="">Confirm your Access PIN.</div>
        <PinInput
          focus={!pinConfirm && !focus}
          onChange={(pin) => setPinConfirm(pin)}
          key={pin}
        />
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
      </div>
      <div className="flex flex-col items-start pt-4">
        <div className="relative items-center inline-block">
          <input
            id="link-checkbox"
            type="checkbox"
            className="w-3 h-3 terms-checkbox accent-finniePurple"
            onKeyDown={(e) =>
              e.key === 'Enter' && setTermsAccepted(!termsAccepted)
            }
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          />
          <label htmlFor="link-checkbox" className="ml-4 text-sm font-medium ">
            I agree with the{' '}
            <button
              className="underline text-finniePurple"
              onClick={openTermsWindow}
            >
              Terms of Service
            </button>
            .
          </label>
        </div>
        <Button
          disabled={disableLogin}
          label="Log in"
          onClick={handlePinCreate}
          className="mt-6 mr-3 bg-finnieGray-light text-finnieBlue w-60"
        />
      </div>
    </div>
  );
}

export default CreatePin;
