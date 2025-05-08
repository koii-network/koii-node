import React from 'react';
import { HashRouter } from 'react-router-dom';

function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return <HashRouter>{children}</HashRouter>;
}

export default AppProvider;
