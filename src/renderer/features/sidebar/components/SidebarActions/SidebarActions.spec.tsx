import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { useFundNewAccountModal } from 'renderer/features/common';

import { SidebarActions } from './SidebarActions';

jest.mock('renderer/features/common');

const useFundNewAccountModalMock =
  useFundNewAccountModal as jest.MockedFunction<typeof useFundNewAccountModal>;

describe('SidebarActions', () => {
  let primaryClickHandler: jest.Mock;
  let secondaryClickHandler: jest.Mock;
  let mockShowModal: jest.Mock;

  beforeEach(() => {
    primaryClickHandler = jest.fn();
    secondaryClickHandler = jest.fn();

    mockShowModal = jest.fn();
    useFundNewAccountModalMock.mockReturnValue({ showModal: mockShowModal });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the primary action click handler and opens the modal when primary action is clicked', () => {
    const { getByTestId } = render(
      <SidebarActions
        onPrimaryActionClick={primaryClickHandler}
        onSecondaryActionClick={secondaryClickHandler}
      />
    );

    const primaryButton = getByTestId('sidebar_tip_give_button');
    fireEvent.click(primaryButton);

    expect(primaryClickHandler).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('calls the secondary action click handler when secondary action is clicked', () => {
    const { getByTestId } = render(
      <SidebarActions
        onPrimaryActionClick={primaryClickHandler}
        onSecondaryActionClick={secondaryClickHandler}
      />
    );

    const secondaryButton = getByTestId('add-line-icon');
    fireEvent.click(secondaryButton);

    expect(secondaryClickHandler).toHaveBeenCalledTimes(1);
  });

  it('changes secondary icon based on `showMyNodeAction` prop', () => {
    const { getByTestId, rerender } = render(
      <SidebarActions
        onPrimaryActionClick={primaryClickHandler}
        onSecondaryActionClick={secondaryClickHandler}
        showMyNodeAction={false}
      />
    );

    let secondaryIcon = getByTestId('add-line-icon');
    expect(secondaryIcon).toBeInTheDocument();

    rerender(
      <SidebarActions
        onPrimaryActionClick={primaryClickHandler}
        onSecondaryActionClick={secondaryClickHandler}
        showMyNodeAction
      />
    );

    secondaryIcon = getByTestId('sidebar_web_cursor_button');
    expect(secondaryIcon).toBeInTheDocument();
  });
});
