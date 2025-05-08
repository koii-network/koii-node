import React from 'react';

type PropsType = {
  children: React.ReactNode;
};

export function OnboardingStepContentWrapper({ children }: PropsType) {
  return (
    <div className="relative z-50 flex flex-col items-center justify-center min-h-screen text-white">
      {children}
    </div>
  );
}
