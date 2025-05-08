import { useEffect, useState } from 'react';

type KeyInputHandler = () => void;

export const useKeyInput = (
  key: string,
  handler: KeyInputHandler,
  disabled = false
) => {
  const [keyPressed, setKeyPressed] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === key) {
      setKeyPressed(true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === key) {
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (keyPressed && handler && !disabled) handler();
  }, [keyPressed, handler, disabled]);
};
