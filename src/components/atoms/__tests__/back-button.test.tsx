import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { BackButton } from '../back-button';

// Mock the Next.js useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('BackButton', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    jest.clearAllMocks();
  });

  it('renders the button', () => {
    render(<BackButton />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls router.back when no path is provided', () => {
    render(<BackButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls router.push with the provided path', () => {
    const path = '/custom-path';
    render(<BackButton path={path} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(path);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('passes additional props to the button', () => {
    render(<BackButton aria-label="Go Back" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Go Back');
  });
});
