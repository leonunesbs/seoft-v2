import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { RippleLoader } from '../ripple-loader';

describe('RippleLoader', () => {
  it('renders the loader with default size', () => {
    render(<RippleLoader />);

    const loader = screen.getByRole('presentation');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveStyle({
      width: '35px',
      height: '35px',
    });
  });
});
