import { useEffect } from 'react';

interface Params {
  closeModal: () => void;
}

export const useCloseWithEsc = ({ closeModal }: Params) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeModal]);
};
