import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';

import { ThemeToggle } from '../theme-toggle';

// Mock do hook `useTheme` do `next-themes`
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
    });
  });

  it('renderiza o botão de alternância de tema', () => {
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
