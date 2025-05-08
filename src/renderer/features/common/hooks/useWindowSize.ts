import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        width: window.innerWidth,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
