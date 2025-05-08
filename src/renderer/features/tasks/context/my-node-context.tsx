import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface MyNodeContext {
  fetchMyTasksEnabled: boolean;
  setFetchMyTasksEnabled: Dispatch<SetStateAction<boolean>>;
}

const Ctx = createContext<MyNodeContext | undefined>(undefined);

type PropsType = {
  children: ReactNode;
};

export function MyNodeProvider({ children }: PropsType) {
  const [fetchMyTasksEnabled, setFetchMyTasksEnabled] = useState<boolean>(true);

  const value = useMemo(
    () => ({
      fetchMyTasksEnabled,
      setFetchMyTasksEnabled,
    }),
    [fetchMyTasksEnabled, setFetchMyTasksEnabled]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyNodeContext() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error('useMyNodeContext must be used inside MyNodeProvider');
  }
  return context;
}
