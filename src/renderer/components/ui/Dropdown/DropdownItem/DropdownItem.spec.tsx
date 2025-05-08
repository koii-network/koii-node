import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import { DropdownItem } from './DropdownItem';

// Mock DropdownMenu.Item to enable interaction in Jest environment
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  ...jest.requireActual('@radix-ui/react-dropdown-menu'),
  Item: ({
    onSelect,
    children,
    className,
  }: {
    onSelect?: () => void;
    children: React.ReactNode;
    className: string;
  }) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={className} onClick={onSelect}>
      {children}
    </div>
  ),
}));

describe('DropdownItem', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<DropdownItem label="Test Label" />);
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <DropdownItem label="Test Label" onSelect={onSelect} />
    );
    fireEvent.click(getByText('Test Label'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('applies selected class when isSelected is true', () => {
    const { getByText } = render(
      <DropdownItem label="Test Label" isSelected />
    );
    expect(getByText('Test Label')).toHaveClass(
      'border-purple-1 font-semibold text-finnieTeal-100'
    );
  });
});
