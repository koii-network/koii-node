import { useEffect, useState } from 'react';

export function useAnimatedCount(endValue: number, duration = 5000) {
  const [count, setCount] = useState(endValue);

  const easeOutCubic = (x: number): number => {
    return 1 - (1 - x) ** 3;
  };

  useEffect(() => {
    let startTime: number;
    const startValue = count;
    let timeoutId: NodeJS.Timeout;

    const updateInterval = 100;

    const animate = () => {
      const currentTime = Date.now();
      if (!startTime) startTime = currentTime;

      const rawProgress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutCubic(rawProgress);
      const currentCount = startValue + (endValue - startValue) * easedProgress;
      setCount(currentCount);

      if (rawProgress < 1) {
        timeoutId = setTimeout(animate, updateInterval);
      } else {
        setCount(endValue);
      }
    };

    timeoutId = setTimeout(animate, updateInterval);
    return () => clearTimeout(timeoutId);
  }, [endValue, duration]);

  return count?.toFixed?.(5);
}
