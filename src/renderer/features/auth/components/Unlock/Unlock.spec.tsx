import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Unlock } from 'renderer/features/auth/components/Unlock';
import { render } from 'renderer/tests/utils';

const pinErrorMessage =
  'Oops! That PIN isn’t quite right. Double check it and try again.';

const pin = '111111';
const hashedPin =
  '$2a$10$A6AnKXS0/0eikAGxI9PpL.qwnVJ/x2PDGgH.oJ.8IeKdWszLcQ0Bu';

Object.defineProperty(window, 'main', {
  value: {
    getUserConfig: () =>
      Promise.resolve({
        onboardingCompleted: true,
        pin: hashedPin,
      }),
  },
});

//  TO DO: Optimize and re-enable this test (right now it takes too long, we should probably mock something in the backend logic it consumes)
describe.skip('Unlock', () => {
  const enterPin = async (isCorrectPin: boolean) => {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < 6; index++) {
      const pinCharacterToEnter = isCorrectPin ? pin[index] : String(index);
      const pinInput = screen.getAllByLabelText(/pin-input/i)[index];
      await userEvent.type(pinInput, pinCharacterToEnter);
    }
  };

  // TO DO: assess redirection to MyNode instead
  it('does not fail authentication if the pin entered matches the hash stored', async () => {
    render(<Unlock />);

    await enterPin(true);

    const errorElement = screen.queryByText(pinErrorMessage);
    expect(errorElement).not.toBeInTheDocument();
  });
});
