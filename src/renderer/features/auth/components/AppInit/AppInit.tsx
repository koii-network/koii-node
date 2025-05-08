import React from 'react';
import { Navigate } from 'react-router-dom';

import { LoadingScreen } from 'renderer/components';

import { useAppInit } from '../../hooks/useAppInit';

export function AppInit(): JSX.Element {
  const { initializingNode } = useAppInit();

  if (initializingNode) {
    return <LoadingScreen />;
  }

  return <Navigate to="/unlock" replace />;
}
