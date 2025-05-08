/* eslint-disable @cspell/spellchecker */
import { screen, waitFor } from '@testing-library/react';
import React from 'react';

import { render } from 'renderer/tests/utils';

import { StakeInfoBox } from './StakeInfoBox';

describe('<StakeInfoBox />', () => {
  it('displays the total staked amount correctly', async () => {
    render(<StakeInfoBox totalStaked={{ KOII: 100000000000 }} />);
    await waitFor(
      () => expect(screen.getByText('100.00')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getByText('Total Staked')).toBeInTheDocument();
  });
});
