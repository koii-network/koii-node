import React from 'react';

type PropsType = {
  children: React.ReactNode;
};

export function Modal({ children }: PropsType) {
  return (
    <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-40">
      <div className="relative rounded-md shadow-lg">{children}</div>
    </div>
  );
}
