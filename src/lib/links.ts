/**
 * Helpers for advertisement / CMS links that an admin types into the
 * "Link URL" field.
 *
 * Three shapes come in:
 *   "/shop?category=Sarees"    → internal route  → react-router <Link>
 *   "https://instagram.com/…"  → external        → real <a target="_blank">
 *   "www.instagram.com/…"      → external but missing the protocol. Without
 *                                repair the browser treats it as a *relative*
 *                                path, so the click goes nowhere — which is
 *                                why ad links looked "dead" in the UI.
 */

/** Anything that already leaves the site. */
const EXTERNAL_PREFIX = /^(https?:\/\/|mailto:|tel:|sms:|whatsapp:|\/\/)/i;

/** Bare domain with an optional path, e.g. "instagram.com/reel/xyz". */
const BARE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i;

/** True when the value should open outside the SPA. */
export function isExternalLink(link?: string | null): boolean {
  const value = (link || '').trim();
  if (!value) return false;
  if (EXTERNAL_PREFIX.test(value)) return true;
  if (value.startsWith('/') || value.startsWith('#')) return false;
  return BARE_DOMAIN.test(value);
}

/**
 * Clean a link for storage / rendering:
 *  - trims whitespace
 *  - adds `https://` to bare domains
 *  - adds a leading `/` to internal paths
 *  - returns `fallback` when empty
 */
export function normalizeLink(link?: string | null, fallback = ''): string {
  const value = (link || '').trim();
  if (!value) return fallback;

  if (isExternalLink(value)) {
    // Already has a scheme (https:, mailto:, //) — leave it alone.
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return value;
    return `https://${value}`;
  }

  if (value.startsWith('#')) return value;
  return value.startsWith('/') ? value : `/${value}`;
}
