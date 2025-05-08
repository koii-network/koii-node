import NiceModal from '@ebay/nice-modal-react';
import {
  RenderOptions,
  RenderResult,
  render as rtlRender,
} from '@testing-library/react';
import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter } from 'react-router-dom';

import { ThemeProvider } from 'renderer/theme/ThemeContext';

const queryClient = new QueryClient();

interface WrapperProps {
  children: ReactNode;
}

export const render = (
  ui: ReactElement,
  renderOptions?: RenderOptions
): RenderResult => {
  const Wrapper: FunctionComponent<WrapperProps> = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <ThemeProvider>
            <NiceModal.Provider>{children}</NiceModal.Provider>
          </ThemeProvider>
        </HashRouter>
      </QueryClientProvider>
    );
  };

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};
