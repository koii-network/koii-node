import {
  useMainAccountBalance,
  useStakingAccountBalance,
} from 'renderer/features/settings';

export function useKoiiToken() {
  const { accountBalance: mainAccountBalance } = useMainAccountBalance();
  const { accountBalance: stakingAccountBalance } = useStakingAccountBalance();
}
