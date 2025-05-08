import { render, screen } from '@testing-library/react';
import React from 'react';

import { TaskErrorMessage } from './TaskErrorMessage';

describe('<TaskErrorMessage />', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<TaskErrorMessage errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single error correctly', () => {
    render(<TaskErrorMessage errors={['fill in this field']} />);
    expect(
      screen.getByText('Make sure you fill in this field.')
    ).toBeInTheDocument();
  });

  it('renders multiple errors correctly', () => {
    render(
      <TaskErrorMessage
        errors={['fill in this field', 'accept the terms and conditions']}
      />
    );
    const expectedTexts = [
      'Make sure you:',
      '• fill in this field',
      '• accept the terms and conditions',
    ];
    expectedTexts.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
