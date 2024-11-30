import { type HTMLAttributes, type ReactNode } from 'react';

import { BackButton } from './back-button';

interface PageHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function PageHeading({ children, ...rest }: PageHeadingProps): ReactNode {
  return (
    <div className="flex">
      <BackButton />
      <h1 className="text-lg font-semibold" {...rest}>
        {children}
      </h1>
    </div>
  );
}
