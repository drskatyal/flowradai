/**
 * next/link shim — maps Next.js <Link href="..."> to React Router <Link to="...">.
 */
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
  locale?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, prefetch: _prefetch, replace, scroll: _scroll, shallow: _shallow, passHref: _passHref, legacyBehavior: _legacyBehavior, locale: _locale, ...rest }, ref) => {
    // External URLs fall through to a plain <a>
    if (href?.startsWith('http') || href?.startsWith('//') || href?.startsWith('mailto:')) {
      return (
        <a ref={ref} href={href} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <RouterLink to={href} replace={replace} ref={ref} {...(rest as any)}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = 'Link';

export default Link;
