import { render, screen } from '@testing-library/react';
import React from 'react';

import { CountKoii, TOO_SMALL_AMOUNT_PLACEHOLDER } from './CountKoii';

describe('CountKoii', () => {
  test('renders small amount placeholder for very small amounts', () => {
    render(<CountKoii value={0.000000001} />);

    expect(screen.getByText(TOO_SMALL_AMOUNT_PLACEHOLDER)).toBeInTheDocument();
  });

  test('renders CountUp for non-small amounts', () => {
    render(<CountKoii value={1000000000} />);

    const countUp = screen.getAllByText(/1.00/)[0];
    expect(countUp).toBeInTheDocument();
  });
});
