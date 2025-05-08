import React from 'react';

type PropsType = {
  roundNumber: number;
  roundTime: string;
};

export function RoundDisplay({ roundNumber, roundTime }: PropsType) {
  return <div>{`${roundNumber} | ${roundTime}`}</div>;
}
