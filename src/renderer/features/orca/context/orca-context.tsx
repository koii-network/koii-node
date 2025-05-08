import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from 'react-query';

import { QueryKeys, checkOrcaMachineExistsAndRuns } from 'renderer/services';

interface OrcaContext {
  data: {
    isPodmanInstalled: boolean | undefined;
    isOrcaVMInstalled: boolean | undefined;
    isOrcaVMRunning: boolean | undefined;
  };
  loadingOrcaPodman: boolean;
  orcaPodmanError: unknown;
}

const Ctx = createContext<OrcaContext | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function OrcaProvider({ children }: PropsType) {
  const {
    data = {
      isPodmanInstalled: undefined,
      isOrcaVMInstalled: undefined,
      isOrcaVMRunning: undefined,
    },
    isLoading: loadingOrcaPodman,
    error: orcaPodmanError,
  } = useQuery(
    QueryKeys.OrcaPodman,
    () => checkOrcaMachineExistsAndRuns(false),
    {
      refetchInterval: 10000,
    }
  );

  const value = useMemo(
    () => ({
      data,
      loadingOrcaPodman,
      orcaPodmanError,
    }),
    [data, loadingOrcaPodman, orcaPodmanError]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrcaContext() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error('useOrcaContext must be used inside OrcaProvider');
  }
  return context;
}
