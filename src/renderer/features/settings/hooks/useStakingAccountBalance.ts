import { useAccountBalance } from './useAccountBalance';
import { useStakingAccount } from './useStakingAccount';

export function useStakingAccountBalance() {
  const { data: stakingAccount } = useStakingAccount();
  return useAccountBalance(stakingAccount);
}
