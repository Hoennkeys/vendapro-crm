/** Product identity — Creator OS with integrated legacy CRM. */
export const PRODUCT_NAME = "Creator OS";
export const PRODUCT_LEGACY_LABEL = "CRM integrado";
export const PAGE_TITLE_SUFFIX = "Creator OS";

export function pageTitle(section: string): string {
  return `${section} — ${PAGE_TITLE_SUFFIX}`;
}
