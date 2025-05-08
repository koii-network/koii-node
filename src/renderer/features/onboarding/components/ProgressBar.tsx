import React from 'react';

interface ProgressBarProps {
  currentStepNumber: number;
  totalNumberOfSteps: number;
}

export function ProgressBar({
  currentStepNumber,
  totalNumberOfSteps,
}: ProgressBarProps) {
  const progressPercentage = (currentStepNumber / totalNumberOfSteps) * 100;
  const progressStyle = {
    width: `${progressPercentage}%`,
  };

  return (
    <div className="w-96 h-3.5 relative">
      <div
        className="h-3.5 left-0 top-0 absolute bg-finniePurple rounded-lg border border-white transition-all duration-[3000ms] ease-in-out"
        style={progressStyle}
      />
      <div className="w-96 h-3.5 left-0 top-0 absolute rounded-lg border border-white" />
    </div>
  );
}
