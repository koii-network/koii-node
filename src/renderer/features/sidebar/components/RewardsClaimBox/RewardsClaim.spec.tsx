import { screen, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from 'renderer/tests/utils';

import { RewardsClaimBox } from './RewardsClaimBox';

describe('RewardsClaimBox', () => {
  it('should display the correct rewards amount', async () => {
    const REWARDS_AMOUNT_IN_ROE = 10000000000;
    render(
      <RewardsClaimBox
        rewardsAmount={{ KOII: REWARDS_AMOUNT_IN_ROE }}
        onRewardClaimClick={jest.fn()}
      />
    );
    await waitFor(
      () => expect(screen.getAllByText('10.00')[0]).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('should display the claim rewards button when reward is claimable', () => {
    render(<RewardsClaimBox rewardClaimable onRewardClaimClick={jest.fn()} />);
    const claimRewardsButton = screen.getByTestId('claim-rewards-button');
    expect(claimRewardsButton).toBeInTheDocument();
    expect(claimRewardsButton).toHaveTextContent('Claim Rewards');
  });

  it('should display the loading text when reward is not claimable', () => {
    render(
      <RewardsClaimBox rewardClaimable={false} onRewardClaimClick={jest.fn()} />
    );
    expect(screen.getByText('Add a task to earn')).toBeInTheDocument();
  });
});
