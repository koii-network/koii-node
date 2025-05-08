import { Buffer } from 'buffer';

import { CheckSuccessLine } from '@_koii/koii-styleguide';
import NiceModal from '@ebay/nice-modal-react';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import '@_koii/koii-styleguide/dist/style.css';
import 'tailwindcss/tailwind.css';
import './App.css';

import ExclamationMarkIcon from 'assets/svgs/exclamation-mark-icon.svg';
import AppProvider from 'renderer/Providers/AppProvider';
import { ThemeProvider } from 'renderer/theme/ThemeContext';

import { CustomEvents } from './customEvents';
import { NetworkStatus } from './features/network';
import { NetworkStatusProvider } from './features/network/context/NetworkStatusContext';
import { DeepLinkingProvider } from './features/tasks/context/deep-linking-context';
import AppRoutes from './routing/AppRoutes';
import { parseErrorMessage } from './utils/error';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as { message: string }).message;

          const { errorCode } = parseErrorMessage(errorMessage);
          if (errorCode === '429' || errorCode === '420') {
            const event = new CustomEvent(CustomEvents.K2RateLimitExceeded);
            window.dispatchEvent(event);
          }
        } else if (error instanceof Event) {
          console.log('Event based error', {
            error,
          });
        } else {
          console.error('Unexpected error type:', error);
        }
      },
    },
  },
});
function App(): JSX.Element {
  window.Buffer = Buffer;

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ThemeProvider>
          <NetworkStatusProvider>
            <NiceModal.Provider>
              <DeepLinkingProvider>
                <AppRoutes />
                <Toaster
                  toastOptions={{
                    style: {
                      maxWidth: '100%',
                    },
                    className: 'px-4 text-sm text-[#171753]',
                    duration: 4500,
                    error: {
                      icon: (
                        <ExclamationMarkIcon className="w-6 h-6 text-finnieBlue" />
                      ),
                      style: {
                        backgroundColor: '#FFA6A6',
                      },
                    },
                    success: {
                      icon: <CheckSuccessLine className="w-5 h-5" />,
                      style: {
                        backgroundColor: '#BEF0ED',
                      },
                    },
                  }}
                />
                <NetworkStatus />
              </DeepLinkingProvider>
            </NiceModal.Provider>
          </NetworkStatusProvider>
        </ThemeProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
