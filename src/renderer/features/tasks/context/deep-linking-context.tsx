import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DeepLinkRoute } from 'renderer/types/routes';

const allowedAppRoutes = Object.values(DeepLinkRoute);

interface DeepLinkingContext {
  routeToRedirectTo: string;
}

const Ctx = createContext<DeepLinkingContext | undefined>(undefined);

type PropsType = {
  children: React.ReactNode;
};

export function DeepLinkingProvider({ children }: PropsType) {
  const [routeToRedirectTo, setRouteToRedirectTo] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    const canRedirectDirectly = allowedAppRoutes.includes(currentPath);
    const destroy = window.main.onDeepLinkNavigation((_, route) => {
      if (canRedirectDirectly) {
        console.log('Redirecting to:', route);
        navigate(route);
      } else {
        console.log('Setting up for redirection after login:', route);
        setRouteToRedirectTo(route);
      }
    });

    return () => {
      destroy();
    };
  }, [navigate, location.pathname]);

  const value = useMemo(() => ({ routeToRedirectTo }), [routeToRedirectTo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDeepLinkingContext() {
  const context = React.useContext(Ctx);
  if (!context) {
    throw new Error(
      'useDeepLinkingContext must be used inside DeepLinkingProvider'
    );
  }
  return context;
}
