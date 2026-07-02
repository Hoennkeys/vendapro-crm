/** Product identity — GlowUP creator operating system. */
export const PRODUCT_NAME = "GlowUP";
export const PRODUCT_TAGLINE = "O sistema operacional para criadores de conteúdo.";
export const PRODUCT_SUBTITLE = "Plataforma para criadores";
export const PRODUCT_LEGACY_LABEL = "Operação integrada";
export const PAGE_TITLE_SUFFIX = "GlowUP";
export const APPLICATION_NAME = "GlowUP";
export const PLATFORM_TITLE_SUFFIX = "GlowUP Platform";

export const DEFAULT_META_DESCRIPTION =
  "Centralize marcas, campanhas, comunicação, calendário e financeiro — tudo que um creator precisa para operar profissionalmente.";

export function pageTitle(section: string): string {
  return `${section} — ${PAGE_TITLE_SUFFIX}`;
}

export function platformPageTitle(section: string): string {
  return `${section} — ${PLATFORM_TITLE_SUFFIX}`;
}

export function defaultMeta() {
  return [
    { title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}` },
    { name: "description", content: DEFAULT_META_DESCRIPTION },
    { name: "application-name", content: APPLICATION_NAME },
    { name: "author", content: PRODUCT_NAME },
    { property: "og:title", content: PRODUCT_NAME },
    { property: "og:description", content: DEFAULT_META_DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: PRODUCT_NAME },
    { name: "twitter:description", content: DEFAULT_META_DESCRIPTION },
  ];
}
