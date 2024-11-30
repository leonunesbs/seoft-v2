import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { PageHeading } from '../page-heading';

// Mock BackButton to avoid its internal implementation in these tests
jest.mock('../back-button', () => ({
  BackButton: jest.fn(() => <button>Back</button>),
}));

describe('PageHeading', () => {
  it('renders the heading text', () => {
    render(<PageHeading>Page Title</PageHeading>);

    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Page Title');
  });

  it('renders the BackButton', () => {
    render(<PageHeading>Page Title</PageHeading>);

    const backButton = screen.getByRole('button', { name: 'Back' });

    expect(backButton).toBeInTheDocument();
  });

  it('passes additional props to the heading', () => {
    render(<PageHeading aria-label="Main Heading">Page Title</PageHeading>);

    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toHaveAttribute('aria-label', 'Main Heading');
  });
});
