/**
 * Whether a nav item's link corresponds to the currently active route,
 * ignoring any '#section' anchor (a page is "current" regardless of which
 * of its anchors was used to reach it).
 */
export function isProductItemActive(pathname: string, href: string): boolean {
  return pathname === href.split('#')[0]
}
