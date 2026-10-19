import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isExternalLink, normalizeLink } from '../lib/links';

interface AdLinkProps {
  /** Raw value from the ad's "Link URL" field. */
  to?: string | null;
  /** Where to go when the ad has no link. Defaults to the shop. */
  fallback?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
  /** Self-closing is fine — the anchor can be a pure click target. */
  children?: ReactNode;
}

/**
 * Renders an ad target as an in-app <Link> for store routes and as a real
 * <a target="_blank" rel="noopener noreferrer"> for external URLs.
 *
 * react-router's <Link> never leaves the SPA, so pointing it at
 * "https://instagram.com/…" silently did nothing — the app tried to match it
 * as a route. This component picks the right element for the URL.
 */
export default function AdLink({ to, fallback = '/shop', children, ...rest }: AdLinkProps) {
  const href = normalizeLink(to, fallback);

  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} {...rest}>
      {children}
    </Link>
  );
}
