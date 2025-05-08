import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import CountUp from 'react-countup';
import { twMerge } from 'tailwind-merge';

import { AccountType } from 'renderer/features/settings/types';
import { TokenItemType } from 'renderer/features/tokens/types';

import { CoinListPlaceholder } from './CoinListPlaceholder';
import { OpenCloseButton } from './OpenCloseButton';

type PropsType = {
  availableTokens: TokenItemType[];
  isLoadingTokensData: boolean;
  isOpened: boolean;
  setIsOpened: (value: boolean) => void;
  walletType: AccountType;
  isBalancesHidden?: boolean;
};

export function CoinList({
  availableTokens,
  isLoadingTokensData,
  isOpened,
  setIsOpened,
  walletType,
  isBalancesHidden,
}: PropsType) {
  const handleFoldClick = () => {
    setIsOpened(!isOpened);
  };

  const sortedTokens = availableTokens.sort((a, b) => b.balance - a.balance);

  const firstEightTokens = useMemo(
    () => sortedTokens.slice(0, 8),
    [sortedTokens]
  );

  const containerVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: { duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.3 },
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.4, ease: 'easeIn' },
        opacity: { duration: 0.2 },
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const headertext = {
    SYSTEM: 'System Key Balance',
    STAKING: 'Staking Key Balance',
    KPL_STAKING: 'KPL Staking Key Balance',
  }[walletType];

  const getFormattedBalance = (decimals: number, balance: number) =>
    (balance / 10 ** decimals).toFixed(2);

  return (
    <div className="">
      <div
        className={twMerge(
          'h-6 text-xs ml-14',
          walletType === 'STAKING' || walletType === 'KPL_STAKING'
            ? 'text-finnieOrange'
            : 'text-finnieEmerald-light'
        )}
      >
        {isOpened && <span>{headertext}</span>}
      </div>

      <motion.div
        initial={{ height: 'auto' }}
        animate={{ height: isOpened ? 'auto' : '40px' }}
        transition={{
          duration: 0.5,
        }}
        className="flex flex-row items-start justify-center gap-2 min-h-[40px]"
      >
        <OpenCloseButton onClick={handleFoldClick} isOpen={isOpened} />

        {isLoadingTokensData ? (
          <CoinListPlaceholder />
        ) : (
          <AnimatePresence>
            {!isOpened && (
              <motion.div className="flex min-w-[360px] ml-2">
                {firstEightTokens.map((token, index) => (
                  <motion.img
                    key={index}
                    src={token.logoURI}
                    alt={token.name}
                    className="w-10 h-10 rounded-full"
                    initial={{ opacity: 1, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    exit={{ opacity: 0, rotate: 360 }}
                  />
                ))}
              </motion.div>
            )}

            {isOpened && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={containerVariants}
                className="flex flex-col min-w-[360px] w-full max-w-[360px] ml-2"
              >
                {sortedTokens.map((token, index) => (
                  <motion.div
                    key={`${token.mint}-${token.name}-${index}`}
                    className="flex items-center justify-between py-2 border-t border-purple-1"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={itemVariants}
                    transition={{
                      duration: 0.5,
                      delay: (sortedTokens.length - index - 1) * 0.1 + 0.3,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={token.logoURI}
                        alt={token.name}
                        className="rounded-full w-9 h-9"
                      />
                      <div className="text-sm font-semibold">{token.name}</div>
                    </div>

                    <div className="flex flex-row items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="self-end text-sm font-semibold">
                          {isBalancesHidden ? (
                            <span>••••••</span>
                          ) : (
                            <CountUp
                              decimals={2}
                              start={0}
                              end={Number(
                                getFormattedBalance(
                                  token.decimals,
                                  token.balance
                                )
                              )}
                              duration={1.5}
                              data-testid="count-koii"
                            />
                          )}
                        </div>
                        {/* TO DO: uncomment once we can fetch actual prices */}
                        {/* <div className="text-xs text-center text-gray-300">
                          $0 USDC
                        </div> */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
