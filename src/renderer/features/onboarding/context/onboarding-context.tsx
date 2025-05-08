import React, { createContext, useState } from 'react';

interface Context {
  systemKey: string | undefined;
  newSeedPhrase: string | undefined;
  accountName: string | undefined;
  appPin: string;
  setAccountName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setNewSeedPhrase: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSystemKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAppPin: React.Dispatch<React.SetStateAction<string>>;
  isAttemptingToRunFirstTask: boolean;
  setIsAttemptingToRunFirstTask: React.Dispatch<React.SetStateAction<boolean>>;
}

const Ctx = createContext<Context | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function OnboardingProvider({ children }: PropsType) {
  const [systemKey, setSystemKey] = useState<string>();
  const [accountName, setAccountName] = useState<string>();
  const [newSeedPhrase, setNewSeedPhrase] = useState<string>();
  const [appPin, setAppPin] = useState<string>('');
  const [isAttemptingToRunFirstTask, setIsAttemptingToRunFirstTask] =
    useState(false);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    systemKey,
    setSystemKey,
    newSeedPhrase,
    setNewSeedPhrase,
    accountName,
    setAccountName,
    appPin,
    setAppPin,
    isAttemptingToRunFirstTask,
    setIsAttemptingToRunFirstTask,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboardingContext() {
  const context = React.useContext(Ctx);
  if (!context) {
    throw new Error(
      'useOnboardingContext must be used inside OnboardingProvider'
    );
  }
  return context;
}
