import React from 'react';

import ChevronArrow from 'assets/svgs/ChevronArrowCircledUp.svg'; // eslint-disable-line import/no-unresolved

type PropsType = {
  onClick: () => void;
  isOpen: boolean;
  disabled?: boolean;
};

export function OpenCloseButton({
  onClick,
  isOpen,
  disabled = false,
}: PropsType) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 bg-transparent border-none focus:outline-none transition-transform duration-300 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <ChevronArrow
        className={`w-10 h-10 transform transition-all duration-300 text-white/80 hover:text-white  ${
          isOpen ? 'rotate-0' : 'rotate-180'
        }`}
      />
    </button>
  );
}
