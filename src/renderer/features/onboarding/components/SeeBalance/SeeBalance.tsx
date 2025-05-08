import React, { useEffect, useRef, useState } from 'react';

import { initializeTasks } from 'renderer/services';

import { RefreshBalance } from './RefreshBalance';
import { ShowBalance } from './ShowBalance';

export function SeeBalance() {
  const [balance, setBalance] = useState<number>();

  const initializeNodeCalled = useRef(false);

  useEffect(() => {
    const initializeNode = async () => {
      if (initializeNodeCalled.current) {
        return;
      }
      console.log('Initializing node...');
      initializeNodeCalled.current = true;
      try {
        initializeTasks();
      } catch (e: any) {
        console.error('Failed to initialize node', e);
      }
    };
    initializeNode();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center justify-center h-full">
        {
          // eslint-disable-next-line eqeqeq
          balance && balance != 0 ? (
            <ShowBalance balance={balance} />
          ) : (
            <RefreshBalance
              onBalanceRefresh={(balance) => setBalance(balance as number)}
            />
          )
        }
      </div>
    </div>
  );
}
