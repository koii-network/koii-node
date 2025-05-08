import { useEffect, MutableRefObject } from 'react';

export const useOnClickOutside = (
  ref: MutableRefObject<HTMLDivElement>,
  handler: (event: Event) => void,
  portalId?: string
) => {
  useEffect(() => {
    const listener = (event: any) => {
      const path = event.path || (event.composedPath && event.composedPath());
      if (!path) return; // neither method is supported

      // Do nothing if clicking ref's element or descendent elements
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        (portalId && path.includes(document.getElementById(portalId))) ||
        event.target.tagName === 'HTML'
      ) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, portalId]);
};
