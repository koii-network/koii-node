import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  const testItems = [
    { id: '1', label: 'Item 1', disabled: false },
    { id: '2', label: 'Item 2', disabled: true },
    { id: '3', label: 'Item 3', disabled: false },
  ];

  test('renders dropdown with placeholder', () => {
    render(<Dropdown items={testItems} />);
    expect(screen.getByText('Select item')).toBeInTheDocument();
  });

  test('renders dropdown with default selected value', () => {
    render(<Dropdown items={testItems} defaultValue={testItems[0]} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
