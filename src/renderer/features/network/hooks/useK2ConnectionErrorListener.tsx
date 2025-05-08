import React, { useEffect, useRef, useState } from 'react';
import { useToasterStore } from 'react-hot-toast';

import { renderCustomToast } from 'renderer/features/notifications/toasts/CustomToast';

export function useK2ConnectionErrorListener() {
  const lastCallRef = useRef<number>(0);
  const [toastId, setToastId] = useState<string | null>(null);

  const { toasts } = useToasterStore();

  useEffect(() => {
    const destroy = window.main.onK2ConnectionError(() => {
      const now = Date.now();
      const lastCallIsOlderThan15Minutes =
        now - lastCallRef.current >= 15 * 60 * 1000 ||
        lastCallRef.current === 0;

      if (lastCallIsOlderThan15Minutes) {
        const lastToastIsStillOnScreen = !!toasts.find(
          (t) => t.id === toastId && t.visible
        );
        if (!lastToastIsStillOnScreen) {
          const newToastId = renderCustomToast({
            content: (
              <p className="text-sm">
                The network might be a bit unstable right now
              </p>
            ),
            position: 'bottom-right',
            dismissable: true,
            variant: 'error',
          });
          setToastId(newToastId);
          lastCallRef.current = now;
        }
      }
    });

    return () => {
      destroy();
    };
  }, [toastId, toasts]);
}
