import { useEffect } from 'react';

import { CustomEvents } from 'renderer/customEvents';

import { useNetworkStatusContext } from './context/NetworkStatusContext';

export function NetworkStatus() {
  const { setK2RateLimitError } = useNetworkStatusContext();

  useEffect(() => {
    const handleRateLimitExceeded = () => {
      console.log('K2 Rate limit exceeded');
      setK2RateLimitError(true);
    };

    window.addEventListener(
      CustomEvents.K2RateLimitExceeded,
      handleRateLimitExceeded
    );

    return () => {
      window.removeEventListener(
        CustomEvents.K2RateLimitExceeded,
        handleRateLimitExceeded
      );
    };
  }, [setK2RateLimitError]);

  /**
   * render nothing because this component is only responsible for side effects
   * we need encapsulate useNetworkStatusContext in a component, so it will be within the context provider
   */
  return null;
}
