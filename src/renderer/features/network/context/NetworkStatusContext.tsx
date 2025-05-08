import React, { createContext, useState } from 'react';

import { useInternetConnectionStatus } from 'renderer/features/settings/hooks/useInternetConnectionStatus';

interface Context {
  k2RateLimitError: boolean;
  setK2RateLimitError: React.Dispatch<React.SetStateAction<boolean>>;
  isInternetOnline: boolean;
}

const Ctx = createContext<Context | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function NetworkStatusProvider({ children }: PropsType) {
  const isInternetOnline = useInternetConnectionStatus();
  const [k2RateLimitError, setK2RateLimitError] = useState<boolean>(false);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    k2RateLimitError,
    setK2RateLimitError,
    isInternetOnline,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNetworkStatusContext() {
  const context = React.useContext(Ctx);
  if (!context) {
    throw new Error(
      'useOnboardingContext must be used inside NetworkStatusProvider'
    );
  }
  return context;
}
