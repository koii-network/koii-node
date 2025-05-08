import React, { useEffect, useState } from 'react';

type PropsType = {
  durationInSeconds: number;
};

function useCountDown({ durationInSeconds }: PropsType) {
  const [timeRemaining, setTimeRemaining] = useState(durationInSeconds);

  useEffect(() => {
    setTimeRemaining(durationInSeconds);
  }, [durationInSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(timeRemaining - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeRemaining]);

  const formatTime = (timeInSeconds: any) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const Counter = (
    <div className="p-1 text-xs">
      <p>{formatTime(timeRemaining)}</p>
    </div>
  );

  return { timeRemaining, Counter };
}

export default useCountDown;
