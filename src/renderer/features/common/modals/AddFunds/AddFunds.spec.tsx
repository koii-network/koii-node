import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import config from 'config';
import { FAUCET_UTM_PARAMS } from 'config/faucet';
import { SidebarActions } from 'renderer/features/sidebar/components';
import { openBrowserWindow } from 'renderer/services';
import { render } from 'renderer/tests/utils';

const { FAUCET_URL } = config.faucet;

const publicKey = 'myPublicKey';

jest.mock('renderer/services', () => ({
  __esModule: true, // necessary to make it work, otherwise it fails trying to set the spy
  ...jest.requireActual('renderer/services'),
  openBrowserWindow: jest.fn(),
}));

const openBrowserWindowMock = openBrowserWindow as jest.Mock;

Object.defineProperty(window, 'main', {
  value: {
    getMainAccountPubKey: jest.fn(() => Promise.resolve(publicKey)),
    openBrowserWindow: jest.fn(),
    verifyMessage: jest.fn(() => Promise.resolve()),
  },
});

const copyToClipboard = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: copyToClipboard,
  },
});

const renderSidebar = () => {
  render(
    <SidebarActions
      onPrimaryActionClick={() => {
        return '';
      }}
      onSecondaryActionClick={() => {
        return '';
      }}
    />
  );
};

describe('AddFunds', () => {
  it('opens the faucet in a new window when clicking on `Go to the faucet` button', async () => {
    renderSidebar();

    const addFundsButton = screen.getByTestId('sidebar_tip_give_button');
    await userEvent.click(addFundsButton);

    const getMyFreeTokensButton = await screen.findByText(/Go to the faucet/i);
    await userEvent.click(getMyFreeTokensButton);

    expect(openBrowserWindowMock).toHaveBeenCalledWith(
      `${FAUCET_URL}?key=${publicKey}&${FAUCET_UTM_PARAMS}`
    );
  });

  it('copies the public key to the clipboard when clicking on the `copy` button', async () => {
    renderSidebar();

    const addFundsButton = screen.getByTestId('sidebar_tip_give_button');
    await userEvent.click(addFundsButton);

    const copyButton = await screen.findByText(publicKey);
    await userEvent.click(copyButton);

    expect(copyToClipboard).toHaveBeenCalledWith(publicKey);
  });
});
