import { Icon } from '@_koii/koii-styleguide';
import { compare } from 'bcryptjs';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

import WelcomeLinesDiagonal from 'assets/svgs/welcome-lines-diagonal.svg';
import WelcomeWheelBackground from 'assets/svgs/welcome-wheel-background.svg';
import { PinInput } from 'renderer/components/PinInput';
import { useBrandingConfig } from 'renderer/features/common/hooks/useBrandingConfig';
import { useBrandLogo } from 'renderer/features/common/hooks/useBrandLogo';
import { useUserAppConfig } from 'renderer/features/settings/hooks';
import { useDeepLinkingContext } from 'renderer/features/tasks/context/deep-linking-context';
import { useTheme } from 'renderer/theme/ThemeContext';
import { AppRoute } from 'renderer/types/routes';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

export function Unlock() {
  const [hasPinError, setHasPinError] = useState<boolean>(false);
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);

  const { userConfig: settings } = useUserAppConfig();
  const { theme } = useTheme();

  const navigate = useNavigate();

  const { routeToRedirectTo } = useDeepLinkingContext();

  const cachedBrandingConfig = useBrandingConfig();

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;

  //   if (brandingSuccess && restartCountdown !== null) {
  //     if (restartCountdown > 0) {
  //       timer = setTimeout(() => {
  //         setRestartCountdown(restartCountdown - 1);
  //       }, 1000);
  //     } else {
  //       appRelaunch();
  //     }
  //   }

  //   return () => {
  //     if (timer) clearTimeout(timer);
  //   };
  // }, [brandingSuccess, restartCountdown]);

  const handlePinChange = async (enteredPin: string) => {
    setHasPinError(false);
    const finishedTypingPin = enteredPin.length === 6;

    if (finishedTypingPin) {
      const pinMatchesStoredHash = await compare(
        enteredPin,
        settings?.pin || ''
      );

      if (pinMatchesStoredHash) {
        const route = routeToRedirectTo || AppRoute.MyNode;
        navigate(route, { state: { noBackButton: true } });
      } else {
        setHasPinError(true);
      }
    }
  };

  const handleNodeReset = () => {
    navigate(AppRoute.RetrieveNodeAccess);
  };

  const isVip = !!(theme === 'vip');

  const onDrop = async (acceptedFiles: File[]) => {
    setBrandingError(null);
    setBrandingSuccess(false);
    setRestartCountdown(null);

    const firstFile = acceptedFiles[0];
    if (!firstFile?.path) {
      setBrandingError('Invalid folder');
      return;
    }

    const folderPath = firstFile.path.split('/').slice(0, -1).join('/');

    try {
      const isValid = await window.main.validateBrandingFolder(folderPath);
      if (!isValid) {
        setBrandingError('Invalid branding folder structure');
        return;
      }

      await window.main.copyBrandingFolder(folderPath);
      setBrandingSuccess(true);
      setRestartCountdown(5); // Start 5 second countdown
    } catch (error) {
      console.error('Branding error:', error);
      setBrandingError('Failed to process branding folder');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: true,
    useFsAccessApi: false,
    accept: {},
  });

  const BrandLogo = useBrandLogo();

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-full gap-5 overflow-hidden overflow-y-auto text-white ${
        isVip
          ? 'bg-[url(assets/svgs/vip-pattern.svg)] bg-top before:absolute before:inset-0 before:bg-gradient-to-b before:from-[#383838]/70 before:via-black before:to-black before:pointer-events-none before:z-0'
          : 'bg-main-gradient'
      }`}
    >
      <WelcomeWheelBackground className="absolute top-0 -left-[40%] h-[40%] scale-110 text-finnieTeal-100" />

      <Icon source={BrandLogo} className="h-[156px] w-[156px] relative z-10" />
      <h1 className="text-[40px] leading-[48px] text-center font-semibold text-white relative z-10">
        Welcome to the {cachedBrandingConfig?.appName || 'Koii'} Node
      </h1>
      <h2 className="text-lg text-center font-semibold relative z-10">
        The World&apos;s Biggest Supercomputer—Powered by People
      </h2>
      <p className="text-lg text-center relative z-10">
        Enter your security PIN code to unlock your Node
      </p>

      <PinInput
        focus
        onChange={handlePinChange}
        showHideButton
        showHideIconSize={28}
      />
      <div className="h-4 text-xs text-finnieOrange relative z-10">
        {hasPinError && (
          <span>
            Oops! That PIN isn&apos;t quite right. Double check it and try
            again.
          </span>
        )}
      </div>

      {/* <div
        {...getRootProps()}
        className="relative z-10 p-4 mt-4 border-2 border-dashed rounded-lg border-white/30 cursor-pointer"
      >
        <input {...getInputProps()} webkitdirectory="" />
        <p className="text-center text-white/70">
          {isDragActive
            ? 'Drop the branding folder here...'
            : 'Drop your branding folder here to customize the app'}
        </p>
        {brandingError && (
          <p className="mt-2 text-sm text-finnieOrange">{brandingError}</p>
        )}
        {brandingSuccess && (
          <div className="mt-2 text-sm text-green-400">
            <p>Branding applied successfully!</p>
            {restartCountdown !== null && (
              <p>App will restart in {restartCountdown} seconds...</p>
            )}
          </div>
        )}
      </div> */}

      <button
        className="z-50 underline underline-offset-2 relative"
        onClick={handleNodeReset}
      >
        Did you forget your PIN?
      </button>

      <WelcomeLinesDiagonal className="absolute bottom-0 -right-[22.5%] h-full" />
    </div>
  );
}
