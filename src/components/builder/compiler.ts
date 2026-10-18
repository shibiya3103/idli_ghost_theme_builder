import { ThemeDocument, BuilderBlock } from "../../types/theme";
import { componentRegistry } from "@/editor/components/registry";
import { getBackgroundCSS } from "@/editor/components/shared/background";
import { CASPER_ICON_PARTIALS } from "./casperIcons";

/**
 * Resolves a responsive style property (using desktop value by default for server-side theme files)
 */
function resolveStyleValue(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "desktop" in val) {
    return (val as { desktop?: string }).desktop || undefined;
  }
  return undefined;
}

/**
 * Formats custom AST styles into inline HTML style attribute strings.
 */
function getInlineStyles(block: BuilderBlock): string {
  const styles = block.styles || {};
  const stylePairs: string[] = [];

  // 1. Typography
  if (styles.fontSize) {
    const val = resolveStyleValue(styles.fontSize);
    if (val) stylePairs.push(`font-size: ${val}`);
  }
  if (styles.textColor) {
    let val = resolveStyleValue(styles.textColor);
    if (val === "#171717" || val === "#000000" || val === "#111111") {
      val = "var(--color-fg)";
    }
    if (val) stylePairs.push(`color: ${val}`);
  }
  if (styles.fontWeight) {
    const val = resolveStyleValue(styles.fontWeight);
    if (val) stylePairs.push(`font-weight: ${val}`);
  }
  if (styles.letterSpacing) {
    const val = resolveStyleValue(styles.letterSpacing);
    if (val) stylePairs.push(`letter-spacing: ${val}`);
  }
  if (styles.textAlign) {
    const val = resolveStyleValue(styles.textAlign);
    if (val) stylePairs.push(`text-align: ${val}`);
  }

  // 2. Layout & Spacing
  if (styles.marginBottom) {
    const val = resolveStyleValue(styles.marginBottom);
    if (val) stylePairs.push(`margin-bottom: ${val}`);
  }
  if (styles.paddingTop) {
    const val = resolveStyleValue(styles.paddingTop);
    if (val) stylePairs.push(`padding-top: ${val}`);
  }
  if (styles.paddingBottom) {
    const val = resolveStyleValue(styles.paddingBottom);
    if (val) stylePairs.push(`padding-bottom: ${val}`);
  }
  if (styles.paddingLeft) {
    const val = resolveStyleValue(styles.paddingLeft);
    if (val) stylePairs.push(`padding-left: ${val}`);
  }
  if (styles.paddingRight) {
    const val = resolveStyleValue(styles.paddingRight);
    if (val) stylePairs.push(`padding-right: ${val}`);
  }
  if (styles.width) {
    const val = resolveStyleValue(styles.width);
    if (val) {
      stylePairs.push(`width: ${val}`);
      stylePairs.push(`max-width: 100%`);
      const align = (block.props?.alignment as string) || (styles.textAlign as string) || "center";
      if (align === "left") {
        stylePairs.push(`margin-left: 0`);
        stylePairs.push(`margin-right: auto`);
      } else if (align === "right") {
        stylePairs.push(`margin-left: auto`);
        stylePairs.push(`margin-right: 0`);
      } else {
        stylePairs.push(`margin-left: auto`);
        stylePairs.push(`margin-right: auto`);
      }
      stylePairs.push(`box-sizing: border-box`);
    }
  }

  // 3. Backgrounds & Borders & Shadows
  const isLogoCloud = block.type === "logo-cloud";
  const glassBlur = isLogoCloud ? undefined : resolveStyleValue(styles.backdropBlur);
  const glassEnabled = !!glassBlur && glassBlur !== "none" && glassBlur !== "0px";

  const selfRendering = [
    "header", "footer", "hero", "newsletter", "post-grid", "testimonials",
    "faq", "grid-gallery", "logo-cloud", "related-posts", "stats", "team",
    "cards", "container", "columns", "section"
  ].includes(block.type);

  if (!selfRendering) {
    const hasCustomBg = Boolean(
      styles.backgroundColor ||
      (styles.backgroundType && styles.backgroundType !== "solid") ||
      styles.backgroundImage ||
      styles.bgImageUrl
    );
    if (hasCustomBg) {
      const rawBgCss = getBackgroundCSS(styles);
      if (rawBgCss) {
        const pairs = rawBgCss.split(";").map((s) => s.trim()).filter(Boolean);
        stylePairs.push(...pairs);
      }
    } else if (glassEnabled) {
      stylePairs.push(`background-color: rgba(255, 255, 255, 0.75)`);
    }
  }
  if (styles.borderRadius) {
    const val = resolveStyleValue(styles.borderRadius);
    if (val) stylePairs.push(`border-radius: ${val}`);
  }
  if (styles.boxShadow && !isLogoCloud) {
    const val = resolveStyleValue(styles.boxShadow);
    if (val && val !== "none") stylePairs.push(`box-shadow: ${val}`);
  }
  if (styles.borderWidth && styles.borderWidth !== "0px") {
    const w = resolveStyleValue(styles.borderWidth);
    const c = resolveStyleValue(styles.borderColor) || "#e2e8f0";
    stylePairs.push(`border: ${w} solid ${c}`);
  }
  if (glassEnabled && glassBlur) {
    stylePairs.push(`backdrop-filter: blur(${glassBlur})`);
    stylePairs.push(`-webkit-backdrop-filter: blur(${glassBlur})`);
  }
  if (styles.opacity) {
    const o = resolveStyleValue(styles.opacity);
    if (o) stylePairs.push(`opacity: ${o}`);
  }

  if (stylePairs.length === 0) return "";
  return ` style="${stylePairs.join("; ")}"`;
}

/**
 * Returns CSS classes for visual hover micro-animations.
 */
function getHoverClass(block: BuilderBlock): string {
  if (block.type === "heading") return "";
  const effect = block.styles?.hoverEffect;
  if (!effect) return "";
  const val = typeof effect === "string" ? effect : (effect.desktop || "");
  if (val === "scale") return " hover-effect-scale";
  if (val === "float") return " hover-effect-float";
  if (val === "glow") return " hover-effect-glow";
  return "";
}

/**
 * Parses two CSS inline-style strings into property→value maps and merges
 * them.  `incoming` values (the generic Style-panel overrides) win over
 * `existing` values (the component's own hardcoded defaults), eliminating
 * duplicate property declarations in the final `style="..."` attribute.
 */
function mergeStyleStrings(existing: string, incoming: string): string {
  const parse = (s: string): Record<string, string> => {
    const map: Record<string, string> = {};
    s.split(";").forEach((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return;
      const prop = decl.substring(0, idx).trim();
      const val = decl.substring(idx + 1).trim();
      if (prop && val) map[prop] = val;
    });
    return map;
  };
  // incoming (Style panel) wins over existing (component defaults)
  const merged = { ...parse(existing), ...parse(incoming) };
  return Object.entries(merged)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

/**
 * Compiles a specific visual builder block to its Handlebars/HTML string.
 */
function compileBlockToHbs(blockId: string, blocks: Record<string, BuilderBlock>, isPageContext: boolean = false): string {
  const block = blocks[blockId];
  if (!block) return "";

  let compiledChildren = "";
  if (block.childrenIds && block.childrenIds.length > 0) {
    compiledChildren = block.childrenIds
      .map((cid) => compileBlockToHbs(cid, blocks, isPageContext))
      .join("\n");
  }

  const def = componentRegistry[block.type];
  if (def) {
    let markup = def.compileToHbs(block, compiledChildren, isPageContext, blocks);
    const inline = getInlineStyles(block);
    const hover = getHoverClass(block);

    if (inline || hover) {
      // Find the first non-style HTML opening tag to inject attributes
      const tagRegex = /<([a-zA-Z0-9-]+)([^>]*)>/g;
      let tagMatch: RegExpExecArray | null = null;
      let m: RegExpExecArray | null;
      while ((m = tagRegex.exec(markup)) !== null) {
        if (m[1].toLowerCase() !== "style") {
          tagMatch = m;
          break;
        }
      }

      if (tagMatch) {
        const tagName = tagMatch[1];
        let attributes = tagMatch[2];
        const matchIndex = tagMatch.index;
        const matchLength = tagMatch[0].length;

        if (hover) {
          if (attributes.includes('class="')) {
            attributes = attributes.replace('class="', `class="${hover.trim()} `);
          } else {
            attributes = `${attributes} class="${hover.trim()}"`;
          }
        }

        if (inline) {
          const styleMatch = inline.match(/style="([^"]+)"/);
          if (styleMatch) {
            const inlineStylesStr = styleMatch[1];
            if (attributes.includes('style="')) {
              // Deduplicate: parse both the existing attribute and incoming
              // styles into maps, letting Style-panel values win.
              const existingMatch = attributes.match(/style="([^"]*)"/);
              if (existingMatch) {
                const merged = mergeStyleStrings(existingMatch[1], inlineStylesStr);
                attributes = attributes.replace(/style="[^"]*"/, `style="${merged}"`);
              }
            } else {
              attributes = `${attributes} style="${inlineStylesStr}"`;
            }
          }
        }

        markup = markup.substring(0, matchIndex) + `<${tagName}${attributes}>` + markup.substring(matchIndex + matchLength);
      }
    }
    return markup;
  }
  return `<!-- WARNING: unknown block type "${block.type}" (id: ${block.id}) — this block will not render. Check componentRegistry in registry.ts for the correct type name. -->`;
}

/**
 * Checks whether a block or any of its descendants is a header or footer.
 */
function isHeaderOrFooterBlock(blockId: string, blocks: Record<string, BuilderBlock>): boolean {
  const block = blocks[blockId];
  if (!block) return false;
  if (block.type === "header" || block.type === "footer") return true;
  if (block.childrenIds && block.childrenIds.length > 0) {
    return block.childrenIds.some((cid) => isHeaderOrFooterBlock(cid, blocks));
  }
  return false;
}

/**
 * Compiles a page definition section list to a complete Handlebars markup string.
 */
export function compilePageToHbs(pageName: string, doc: ThemeDocument): string {
  const page = doc.pages[pageName];
  if (!page) return "";

  const isPageContext = pageName === "page" || pageName.startsWith("custom-");
  const mainContent = page.sections
    .filter((sectionId) => !isHeaderOrFooterBlock(sectionId, doc.blocks))
    .map((sectionId) => compileBlockToHbs(sectionId, doc.blocks, isPageContext))
    .join("\n");

  if (pageName === "post") {
    return `{{!< default}}\n\n{{#post}}\n${mainContent}\n{{/post}}`;
  }
  // FIX: "page" AND any custom-* template both need {{#post}} context —
  // Ghost renders custom page templates against the same Page resource as
  // page.hbs, just selected via the admin "Template" dropdown instead of
  // being the default. Previously only the literal string "page" got this
  // wrapper; custom-* fell through to the bare fallback below with no
  // context at all, so {{title}}/{{content}}/{{feature_image}} silently
  // resolved to nothing.
  if (pageName === "page" || pageName.startsWith("custom-")) {
    const hasTitleOrHeading =
      mainContent.includes("{{title}}") ||
      mainContent.includes("heading") ||
      mainContent.includes("post-header");

    const headerMarkup = !hasTitleOrHeading
      ? `\n{{#if @page.show_title_and_feature_image}}\n  <header class="page-header py-8 max-w-2xl mx-auto px-6">\n    <h1 class="text-3xl font-bold tracking-tight">{{title}}</h1>\n  </header>\n{{/if}}`
      : (!mainContent.includes("@page.show_title_and_feature_image")
          ? `\n{{#if @page.show_title_and_feature_image}}\n  {{!-- Page title managed via visual builder blocks --}}\n{{/if}}`
          : "");

    return `{{!< default}}\n\n{{#post}}${headerMarkup}\n${mainContent}\n{{/post}}`;
  }

  if (pageName === "author") {
    return `{{!< default}}\n\n${mainContent}`;
  }
  if (pageName === "tag") {
    return `{{!< default}}\n\n${mainContent}`;
  }

  return `{{!< default}}\n\n${mainContent}`;
}

/**
 * Returns basic premium global styles to be packaged alongside theme templates.
 */
export function getSkeletonCss(doc?: ThemeDocument): string {
  const settings = doc?.settings;
  const tokens = settings?.designTokens;

  const fontHeading = tokens?.typography?.headingFont || settings?.fontFamily || "'Geist', 'Inter', sans-serif";
  const fontBody = tokens?.typography?.bodyFont || settings?.fontFamily || "'Geist', 'Inter', sans-serif";
  const colorBackground = tokens?.colors?.background || '#fafafa';
  const colorForeground = tokens?.colors?.foreground || '#171717';
  const colorPrimary = tokens?.colors?.primary || settings?.primaryColor || '#171717';
  const colorMuted = tokens?.colors?.muted || '#4d4d4d';
  const colorAccent = settings?.accentColor || tokens?.colors?.accent || '#0070f3';
  const containerWidthVal = settings?.containerWidth ? `${settings.containerWidth}px` : '1200px';

  return `
/* 1. CSS Reset & Base Typography */
*, *::before, *::after {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: var(--gh-font-body, var(--font-body));
  background-color: var(--color-bg);
  color: var(--color-fg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--gh-font-heading, var(--font-heading));
  margin-top: 0;
  margin-bottom: 0.5em;
  color: var(--color-fg);
}
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}
a:hover {
  color: var(--ghost-accent-color, var(--color-accent));
}
ul.nav, ul.nav-secondary {
  list-style: none;
  margin: 0;
  padding: 0;
}
.site-footer .footer-bottom ul.nav,
.site-footer .footer-bottom ul.nav-secondary,
.site-footer .footer-secondary-nav ul.nav,
.site-footer .footer-secondary-nav ul.nav-secondary,
.site-footer .footer-nav-column ul.nav,
.site-footer .footer-nav-column ul.nav-secondary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.site-footer .footer-nav-column ul.nav,
.site-footer .footer-nav-column ul.nav-secondary {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}
.site-footer .footer-bottom ul.nav li,
.site-footer .footer-bottom ul.nav-secondary li,
.site-footer .footer-secondary-nav ul.nav li,
.site-footer .footer-secondary-nav ul.nav-secondary li,
.site-footer .footer-nav-column ul.nav li,
.site-footer .footer-nav-column ul.nav-secondary li {
  display: inline-flex;
  margin: 0;
  padding: 0;
}

/* 2. Design Tokens */
:root {
  --gh-font-heading: ${fontHeading};
  --gh-font-body: ${fontBody};
  --font-heading: var(--gh-font-heading);
  --font-body: var(--gh-font-body);
  --color-bg: ${colorBackground};
  --color-fg: ${colorForeground};
  --color-primary: ${colorPrimary};
  --color-muted: ${colorMuted};
  --color-mute: var(--color-muted);
  --ghost-accent-color: ${colorAccent};
  --color-accent: var(--ghost-accent-color, ${colorAccent});
  --color-link: var(--color-accent);
  --color-canvas: var(--color-bg);
  --color-ink: var(--color-fg);
  --color-hairline: #ebebeb;
  --color-canvas-soft: #fafafa;
  --color-body: ${colorMuted};
  --color-border: #ebebeb;
  --color-on-primary: #ffffff;
  
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-section: 5rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 9999px;

  --container-width: ${containerWidthVal};
  --content-width: 720px;
}

html.dark {
  --color-bg: #111111;
  --color-fg: #ffffff;
  --color-primary: #ffffff;
  --color-on-primary: #000000;
  --color-muted: #a3a3a3;
  --color-mute: #a3a3a3;
  --color-body: #a3a3a3;
  --color-hairline: #333333;
  --color-border: #333333;
  --color-canvas: #111111;
  --color-canvas-soft: #1a1a1a;
  --color-ink: #ffffff;
}

/* Global dark mode logo toggle */
.gh-logo-dark { display: none; }
html.dark .gh-logo-light { display: none !important; }
html.dark .gh-logo-dark { display: inline-block !important; }

/* 1.1. Core Site Layout Wrappers */
/* 1.1. Core Site Layout Wrappers */
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: clip;
}
.gh-head-wrapper,
.gh-head,
#gh-head {
  position: relative !important;
  z-index: 9999 !important;
  overflow: visible !important;
}
.site-main {
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-block {
  position: relative;
  z-index: 1;
}
.nav-dropdown-card {
  z-index: 10000 !important;
}
.site-main > * {
  width: 100%;
}

/* Ensure sections and buttons adapt cleanly in Ghost dark mode */
html.dark .section,
html.dark .hero,
html.dark .hero-section,
html.dark .footer,
html.dark .footer-section,
html.dark .site-footer,
html.dark .featured-posts,
html.dark .featured-posts-section,
html.dark .testimonials,
html.dark .testimonials-section,
html.dark .pricing,
html.dark .pricing-section,
html.dark .newsletter,
html.dark .newsletter-section,
html.dark .newsletter-block,
html.dark .faq,
html.dark .faq-section,
html.dark .stats,
html.dark .stats-section,
html.dark .logo-cloud-section,
html.dark .cards,
html.dark .cards-section,
html.dark .cards-block {
  background-color: var(--color-bg);
  color: var(--color-fg);
}

/* Heading and text dark mode adaptation */
html.dark .heading-dark-adaptive,
html.dark .text-dark-adaptive,
html.dark .text-dark-adaptive p {
  color: var(--color-fg, #ffffff) !important;
}

html.dark .btn-primary {
  background-color: var(--ghost-accent-color, var(--color-accent)) !important;
  color: #ffffff !important;
}

html.dark .btn-secondary {
  background-color: var(--color-bg) !important;
  color: var(--color-fg) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Header Burger & Actions Theme Adaptation */
.gh-head-actions {
  background: transparent !important;
  background-color: transparent !important;
}
html.dark .gh-head-actions {
  background: transparent !important;
  background-color: transparent !important;
}
.gh-head-open .gh-head-actions {
  margin-top: auto !important;
  background: transparent !important;
  background-color: transparent !important;
}
.gh-head-open .gh-head-btn {
  order: 1 !important;
  width: 100% !important;
  max-width: 280px !important;
}
.gh-head-open :is(.gh-head-link, .gh-signout) {
  order: 2 !important;
}
.gh-burger {
  color: inherit;
}
.gh-burger svg {
  stroke: currentColor;
}
html.dark .gh-burger {
  color: #ffffff !important;
}
html.dark .gh-burger svg {
  stroke: #ffffff !important;
}

/* Base Navigation Dropdown Rules */
.nav-dropdown-parent {
  position: relative;
}
.nav-accordion {
  display: none !important;
}
@media (max-width: 767px) {
  .nav-dropdown-card {
    display: none !important;
  }
}

/* 3. Ghost Native Post & Page Share (#/share) */
.gh-share-wrapper {
  display: flex;
  align-items: center;
  margin: 1.25rem 0;
  width: 100%;
  box-sizing: border-box;
}

/* Alignment */
.gh-share-align-left {
  justify-content: flex-start;
  text-align: left;
}
.gh-share-align-center {
  justify-content: center;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.gh-share-align-right {
  justify-content: flex-end;
  text-align: right;
}

/* Primary Share Trigger Button */
.gh-share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, inherit);
  font-weight: 500;
  text-decoration: none !important;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 1;
  border-radius: 9999px;
  white-space: nowrap;
  box-sizing: border-box;
}
.gh-share-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}

/* Button Sizing */
.gh-share-btn.gh-share-sm {
  font-size: 0.75rem;
  padding: 0.4rem 0.85rem;
  gap: 0.375rem;
}
.gh-share-btn.gh-share-md {
  font-size: 0.8125rem;
  padding: 0.5rem 1.1rem;
  gap: 0.5rem;
}
.gh-share-btn.gh-share-lg {
  font-size: 0.875rem;
  padding: 0.65rem 1.35rem;
  gap: 0.625rem;
}

/* Variant: Pill (Filled) */
.gh-share-btn.gh-share-pill {
  background-color: var(--color-primary, #171717);
  color: #ffffff !important;
  border: 1px solid transparent;
}
.gh-share-btn.gh-share-pill:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

/* Variant: Outline */
.gh-share-btn.gh-share-outline {
  background-color: transparent;
  border: 1px solid currentColor;
  color: var(--color-fg, #171717) !important;
}
.gh-share-btn.gh-share-outline:hover {
  border-color: var(--color-primary, #171717);
  background-color: rgba(0, 0, 0, 0.03);
}

/* Variant: Ghost */
.gh-share-btn.gh-share-ghost {
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--color-fg, #171717) !important;
}
.gh-share-btn.gh-share-ghost:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Variant: Icon Only */
.gh-share-btn.gh-share-icon-only {
  padding: 0.55rem !important;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: var(--color-fg, #171717) !important;
  background-color: transparent;
}
.gh-share-btn.gh-share-icon-only:hover {
  border-color: var(--color-primary, #171717);
}

/* Dark Mode */
html.dark .gh-share-btn.gh-share-pill {
  background-color: var(--color-primary) !important;
  color: var(--color-on-primary) !important;
}
html.dark .gh-share-btn.gh-share-outline {
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}
html.dark .gh-share-btn.gh-share-ghost {
  color: #ffffff !important;
}
html.dark .gh-share-btn.gh-share-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
html.dark .gh-share-btn.gh-share-icon-only {
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff !important;
}


/* 3. Shared Structural Utilities & Hover Micro-Interactions */
.hover-effect-scale {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
}
.hover-effect-scale:hover {
  transform: scale(1.02) !important;
  z-index: 30 !important;
}

.hover-effect-float {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
}
.hover-effect-float:hover {
  transform: translateY(-4px) !important;
  z-index: 30 !important;
}

.hover-effect-glow {
  transition: box-shadow 0.25s ease, transform 0.25s ease !important;
}
.hover-effect-glow:hover {
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08) !important;
  z-index: 30 !important;
}

.container-width {
  max-width: var(--container-width);
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-primary);
  color: #fff;
  padding: 8px;
  z-index: 9999;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}

/* 3.1. Ghost Comments Section */
.gh-comments-section {
  width: 100%;
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
  padding: 2.5rem 1.5rem;
  box-sizing: border-box;
  color: #171717;
  color-scheme: light;
  background: transparent !important;
  background-color: transparent !important;
}

#ghost-comments-root {
  width: 100%;
  background: transparent !important;
  background-color: transparent !important;
  color-scheme: light;
}

.gh-comments-section iframe,
#ghost-comments-root iframe,
iframe[data-frame="comments"],
iframe[title="comments-frame"] {
  width: 100%;
  background: transparent !important;
  background-color: transparent !important;
  color-scheme: light;
  border: none;
}

html.dark .gh-comments-section,
.gh-comments-section.dark {
  color: #ffffff !important;
  color-scheme: dark !important;
  background: transparent !important;
  background-color: transparent !important;
}

html.dark #ghost-comments-root,
#ghost-comments-root.dark {
  color: #ffffff !important;
  color-scheme: dark !important;
  background: transparent !important;
  background-color: transparent !important;
}

html.dark .gh-comments-section iframe,
html.dark #ghost-comments-root iframe,
html.dark iframe[data-frame="comments"],
html.dark iframe[title="comments-frame"],
.gh-comments-section.dark iframe,
#ghost-comments-root.dark iframe {
  background: transparent !important;
  background-color: transparent !important;
  color-scheme: dark !important;
}
.gh-comments-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-hairline, #ebebeb);
}
.gh-comments-icon {
  width: 18px;
  height: 18px;
  color: var(--color-ink, #171717);
  flex-shrink: 0;
}
.gh-comments-heading {
  font-family: var(--gh-font-heading, inherit);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-ink, #171717);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}
.gh-comments-count {
  font-weight: 400;
  color: var(--color-muted, #737373);
}
html.dark .gh-comments-header {
  border-bottom-color: var(--color-hairline, #333333);
}
html.dark .gh-comments-icon,
html.dark .gh-comments-heading {
  color: var(--color-ink, #ffffff) !important;
}
html.dark .gh-comments-count {
  color: var(--color-muted, #a3a3a3) !important;
}

/* 4. Ghost .gh-canvas Container */
.gh-canvas {
  width: 100%;
  max-width: var(--container-width, 1200px);
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  box-sizing: border-box;
}

.gh-content {
  font-size: 1.125rem;
  line-height: 1.7;
}

.gh-content > * + * {
  margin-top: 1.5em;
  margin-bottom: 0;
}

.gh-content p {
  margin: 0 0 1.5em 0;
}

.gh-content h2, .gh-content h3, .gh-content h4 {
  margin-top: 2em;
}

.gh-content a {
  color: var(--ghost-accent-color, var(--color-accent));
  text-decoration: underline;
  text-decoration-color: var(--ghost-accent-color, var(--color-accent));
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: opacity 0.15s ease;
}
.gh-content a:hover {
  opacity: 0.8;
}

.gh-content ul, .gh-content ol {
  padding-left: 1.5em;
  margin-bottom: 1.5em;
}

.gh-content blockquote {
  margin: 1.5em 0;
  padding: 0 1.5em;
  border-left: 3px solid var(--ghost-accent-color, var(--color-accent));
  font-style: italic;
}

.gh-content .kg-blockquote-alt {
  font-size: 1.5em;
  font-style: italic;
  text-align: center;
  border: none;
  padding: 0;
  color: var(--color-muted);
}

.gh-content hr {
  border: 0;
  border-top: 1px solid rgba(0,0,0,0.1);
  margin: 3em 0;
}

/* Ghost Image Cards */
.gh-content .kg-image-card, 
.gh-content .kg-gallery-card {
  margin: 2em 0;
}
.gh-content .kg-image-card figcaption,
.gh-content .kg-gallery-card figcaption {
  font-size: 0.85em;
  color: var(--color-muted);
  text-align: center;
  margin-top: 0.5em;
}
.gh-content .kg-image {
  max-width: 100%;
  height: auto;
}
.gh-content .kg-width-wide {
  position: relative;
  width: calc(100vw - 3rem);
  max-width: 1040px;
  margin-left: 50%;
  transform: translateX(-50%);
  display: block;
}
.gh-content .kg-width-full {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  max-width: 100vw;
  display: block;
}
.gh-content .kg-width-full img {
  border-radius: 0 !important;
  width: 100%;
}

/* 4. Global Radius & Layout Utilities */
.rounded-none { border-radius: 0px !important; }
.rounded-sm { border-radius: 4px !important; }
.rounded-md { border-radius: 8px !important; }
.rounded-lg { border-radius: 12px !important; }
.rounded-xl { border-radius: 16px !important; }
.rounded-2xl { border-radius: 24px !important; }
.rounded-full { border-radius: 9999px !important; }
.overflow-hidden { overflow: hidden !important; }
.object-cover { object-fit: cover !important; }
.object-contain { object-fit: contain !important; }
.object-fill { object-fit: fill !important; }

/* Ghost Gallery Cards */
.gh-content .kg-gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.gh-content .kg-gallery-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1em;
}
.gh-content .kg-gallery-image img {
  display: block;
  margin: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

/* Ghost Embed Cards */
.gh-content .kg-embed-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2em 0;
  width: 100%;
}
.gh-content .kg-embed-card iframe {
  max-width: 100%;
}

/* Ghost Bookmark Cards */
.gh-content .kg-bookmark-card {
  margin: 2em 0;
  width: 100%;
  background: var(--color-bg);
}
.gh-content .kg-bookmark-container {
  display: flex;
  color: var(--color-fg);
  text-decoration: none;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.gh-content .kg-bookmark-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1.5em;
  justify-content: flex-start;
}
.gh-content .kg-bookmark-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 0.5em;
}
.gh-content .kg-bookmark-description {
  font-size: 0.9em;
  color: var(--color-muted);
  line-height: 1.5;
  margin-bottom: 1em;
}
.gh-content .kg-bookmark-metadata {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.8em;
  margin-top: auto;
}
.gh-content .kg-bookmark-icon {
  width: 20px;
  height: 20px;
}
.gh-content .kg-bookmark-author, 
.gh-content .kg-bookmark-publisher {
  color: var(--color-muted);
}
.gh-content .kg-bookmark-thumbnail {
  position: relative;
  min-width: 33%;
  max-height: 100%;
}
.gh-content .kg-bookmark-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}
@media (max-width: 600px) {
  .gh-content .kg-bookmark-container {
    flex-direction: column;
  }
  .gh-content .kg-bookmark-thumbnail {
    min-height: 200px;
    order: -1;
  }
}

/* Ghost Callout Cards */
.gh-content .kg-callout-card {
  display: flex;
  padding: 1.25em 1.75em;
  border-radius: var(--radius-md);
  margin: 1.5em 0;
  background: rgba(0,0,0,0.03);
}
.gh-content .kg-callout-card-accent {
  background: var(--color-accent);
  color: #fff;
}
.gh-content .kg-callout-emoji {
  margin-right: 1em;
  font-size: 1.5em;
}
.gh-content .kg-callout-text {
  font-size: 1em;
  line-height: 1.5;
}

/* Ghost Button Cards */
.gh-content .kg-button-card {
  display: flex;
  margin: 2em 0;
}
.gh-content .kg-button-card.kg-align-center {
  justify-content: center;
}
.gh-content .kg-btn {
  display: inline-block;
  padding: 0.8em 1.5em;
  font-weight: bold;
  text-decoration: none;
  border-radius: var(--radius-pill);
  background: var(--ghost-accent-color, var(--color-accent));
  color: #fff;
  transition: opacity 0.2s;
}
.gh-content .kg-btn-accent {
  background: var(--ghost-accent-color, var(--color-accent));
  color: #fff;
}
.gh-content .kg-btn:hover {
  opacity: 0.9;
}

/* Ghost Toggle Cards */
.gh-content .kg-toggle-card {
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: var(--radius-md);
  padding: 1.25em;
  margin: 1.5em 0;
}
.gh-content .kg-toggle-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.gh-content .kg-toggle-heading-text {
  margin: 0;
  font-size: 1.1em;
}
.gh-content .kg-toggle-card-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  color: var(--color-muted);
}
.gh-content .kg-toggle-card[data-kg-toggle-state="close"] .kg-toggle-content {
  display: none;
}
.gh-content .kg-toggle-content {
  margin-top: 1em;
  font-size: 0.95em;
  color: var(--color-muted);
}

/* Ghost Header Cards */
.gh-content .kg-header-card {
  padding: 4em 2em;
  text-align: center;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-md);
  margin: 2em 0;
}
.gh-content .kg-header-card-header {
  font-size: 2.5em;
  margin-bottom: 0.25em;
}
.gh-content .kg-header-card-subheader {
  font-size: 1.25em;
  font-weight: normal;
  opacity: 0.8;
}

/* Ghost Signup Cards */
.gh-content .kg-signup-card {
  background: rgba(0,0,0,0.03);
  border-radius: var(--radius-md);
  padding: 2em;
  margin: 2em 0;
  text-align: center;
}
.gh-content .kg-signup-card-heading {
  font-size: 1.5em;
  margin-bottom: 0.5em;
}
.gh-content .kg-signup-card-subheading {
  font-size: 1.1em;
  color: var(--color-muted);
  margin-bottom: 1.5em;
}
.gh-content .kg-signup-card-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 400px;
  margin: 0 auto;
}
.gh-content .kg-signup-card-input {
  padding: 0.75em 1em;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-sm);
  font-family: inherit;
}
.gh-content .kg-signup-card-button {
  padding: 0.75em 1em;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: bold;
  cursor: pointer;
}
.gh-content .kg-signup-card-disclaimer {
  font-size: 0.85em;
  color: var(--color-muted);
  margin-top: 1em;
}

/* Ghost File/Audio Cards */
.gh-content .kg-audio-card, 
.gh-content .kg-file-card {
  display: flex;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: var(--radius-md);
  padding: 1em;
  margin: 1.5em 0;
}
.gh-content .kg-file-card-container {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  width: 100%;
}
.gh-content .kg-file-card-contents {
  flex-grow: 1;
}
.gh-content .kg-file-card-title {
  font-weight: bold;
}
.gh-content .kg-file-card-caption,
.gh-content .kg-file-card-metadata {
  font-size: 0.85em;
  color: var(--color-muted);
}
.gh-content .kg-file-card-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}

/* Ghost Code/Pre */
.gh-content pre {
  background: #111;
  color: #fff;
  padding: 1.5em;
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9em;
  margin: 1.5em 0;
}
.gh-content code {
  background: rgba(0,0,0,0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}
.gh-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

/* Ghost Tables */
.gh-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
}
.gh-content th, .gh-content td {
  padding: 0.75em;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  text-align: left;
}
.gh-content th {
  font-weight: bold;
}

/* Micro-Interactions: Hover Effects */
.hover-effect-scale {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
}
.hover-effect-scale:hover {
  transform: scale(1.02) !important;
  z-index: 30 !important;
}
.hover-effect-float {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
}
.hover-effect-float:hover {
  transform: translateY(-4px) !important;
  z-index: 30 !important;
}
.hover-effect-glow {
  transition: box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.hover-effect-glow:hover {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.12), 0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08) !important;
  z-index: 30 !important;
}
html.dark .hover-effect-glow:hover {
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.15), 0 12px 32px -4px rgba(0, 0, 0, 0.6) !important;
}

/* 4. Ghost Article Header, Byline & Layout */
.article {
  width: 100%;
  padding: 1.5rem 0 3rem 0;
  box-sizing: border-box;
}
.article-header {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2.5rem auto;
  text-align: center;
  padding: 0 1.5rem;
  box-sizing: border-box;
}
.article-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.article-tag,
.article-tag a,
a.article-tag {
  font-size: 0.8125rem;
  font-family: var(--font-mono, monospace);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ghost-accent-color, var(--color-accent)) !important;
  text-decoration: none;
}
.article-featured-badge,
.article-featured-flag {
  font-size: 0.6875rem;
  font-family: var(--font-mono, monospace);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill, 9999px);
  background-color: var(--ghost-accent-color, var(--color-accent)) !important;
  color: #ffffff !important;
}
.article-title {
  font-family: var(--gh-font-heading, var(--font-heading));
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin: 0 0 1rem 0;
  color: var(--color-ink, var(--color-fg));
}
.article-excerpt {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-muted);
  max-width: 640px;
  margin: 0 auto 1.5rem auto;
}
.article-byline {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-hairline, #ebebeb);
  border-bottom: 1px solid var(--color-hairline, #ebebeb);
}
.article-byline-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.author-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}
.author-list-item {
  position: relative;
  margin-right: -8px;
}
.author-avatar {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-bg, #ffffff);
  background-color: var(--color-bg, #ffffff);
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.author-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: bold;
  font-family: monospace;
  font-size: 0.875rem;
  background-color: var(--color-canvas, #fafafa);
  color: var(--color-primary);
}
.article-byline-meta {
  text-align: left;
}
.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.15rem 0;
  color: var(--color-ink, var(--color-fg));
}
.byline-meta-content {
  font-size: 0.75rem;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.article-image {
  margin: 2rem auto 2.5rem auto;
  max-width: 56rem;
  width: calc(100% - 3rem);
  box-sizing: border-box;
}
.article-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--color-hairline, #ebebeb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  max-height: 520px;
  object-fit: cover;
}
.article-image figcaption {
  font-size: 0.6875rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-muted, #737373);
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
}
.gh-content {
  width: calc(100% - 3rem);
  max-width: var(--content-width, 720px);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--color-fg);
}
.gh-content-narrow {
  max-width: 640px;
}
.gh-content-wide {
  max-width: 840px;
}
.author-card {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-hairline, #ebebeb);
  border-radius: var(--radius-md, 8px);
  background-color: var(--color-bg, #ffffff);
  margin: 3rem auto;
  max-width: var(--content-width, 720px);
  width: calc(100% - 3rem);
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.author-card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--color-hairline, #ebebeb);
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.author-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.author-card-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-canvas, #fafafa);
  color: var(--color-primary);
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  font-size: 1.125rem;
}
.author-card-content {
  flex: 1;
  min-width: 0;
}
.author-card-eyebrow {
  display: block;
  font-size: 0.625rem;
  font-family: var(--font-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted, #737373);
  font-weight: 600;
}
.author-card-name {
  margin: 0.25rem 0 0 0;
  font-size: 0.9375rem;
  font-weight: 700;
}
.author-card-name a {
  color: var(--color-ink, var(--color-fg));
  text-decoration: none;
}
.author-card-name a:hover {
  color: var(--color-primary);
}
.author-card-bio {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: var(--color-muted, #737373);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 640px) {
  .author-card {
    padding: 1.25rem 1rem;
    margin: 2rem auto;
    width: calc(100% - 2rem);
    gap: 1rem;
  }
  .article-title {
    font-size: 1.875rem;
    line-height: 1.2;
  }
  .article-excerpt {
    font-size: 0.9375rem;
  }
  .article-header {
    margin-bottom: 1.5rem;
    width: calc(100% - 2rem);
    padding: 0;
  }
  .article-image {
    width: calc(100% - 2rem);
    margin: 1.5rem auto 2rem auto;
  }
  .gh-content {
    width: calc(100% - 2rem);
    font-size: 0.9375rem;
  }
}
html.dark .author-card {
  background-color: var(--color-bg, #111111);
  border-color: var(--color-hairline, #333333);
}
html.dark .author-card-avatar {
  border-color: var(--color-hairline, #333333);
}
html.dark .author-card-initial {
  background-color: #222222;
  color: #ffffff;
}
html.dark .author-card-name a {
  color: var(--color-ink, #ffffff);
}
html.dark .author-card-bio,
html.dark .author-card-eyebrow {
  color: var(--color-muted, #a3a3a3);
}

/* 5. Casper Layout & Container Utilities */
.outer {
  position: relative;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
}
.inner {
  margin: 0 auto;
  max-width: min(var(--container-width, 1200px), 100%);
  width: 100%;
  box-sizing: border-box;
}
.container-inner {
  width: 100%;
  max-width: min(var(--container-width, 1200px), 100%);
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2.5rem);
  box-sizing: border-box;
}
.fluid-grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: clamp(1.25rem, 2.5vw, 2rem);
  width: 100%;
  box-sizing: border-box;
}
.fluid-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.25rem, 2.5vw, 2rem);
  width: 100%;
  box-sizing: border-box;
}
@media (min-width: 640px) {
  .fluid-grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .fluid-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
.divider-hairline {
  border: none;
  border-top: 1px solid var(--color-hairline, #ebebeb);
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}
html.dark .divider-hairline {
  border-top-color: var(--color-hairline, #333333);
}

/* 6. Typography Scale & Heading Hierarchy */
h1, h2, h3, h4, h5, h6,
.heading,
.font-heading,
.site-title,
.gh-site-title,
.hero-title,
.hero-heading,
.post-title,
.article-title,
.page-title,
.gh-post-card-title,
.faq-heading,
.faq-question,
.pricing-plan-title,
.pricing-tier-name,
.pricing-price,
.tier-price,
.newsletter-title,
.newsletter-heading,
.stats-number,
.stats-value,
.stats-heading,
.team-name,
.card-title,
.tag-title,
.author-name,
.author-card-name,
.gh-tag-header-title,
.gh-testimonials-title,
.gh-content h1,
.gh-content h2,
.gh-content h3,
.gh-content h4,
.gh-content h5,
.gh-content h6 {
  font-family: var(--gh-font-heading, var(--font-heading)) !important;
}

.heading {
  font-family: var(--gh-font-heading, var(--font-heading));
  line-height: 1.2;
  color: var(--color-fg);
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.heading-h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; }
.heading-h2 { font-size: 1.875rem; font-weight: 700; letter-spacing: -0.025em; line-height: 1.2; }
.heading-h3 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.015em; line-height: 1.25; }
.heading-h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; }
.heading-h5 { font-size: 1.125rem; font-weight: 600; line-height: 1.35; }
.heading-h6 { font-size: 1rem; font-weight: 600; line-height: 1.4; }
@media (min-width: 640px) {
  .heading-h1 { font-size: 3rem; }
  .heading-h2 { font-size: 2.25rem; }
  .heading-h3 { font-size: 1.875rem; }
  .heading-h4 { font-size: 1.5rem; }
  .heading-h5 { font-size: 1.25rem; }
  .heading-h6 { font-size: 1.125rem; }
}

/* 7. Text Variants & Prose Utilities */
body,
p,
li,
a,
button,
input,
textarea,
select,
.text-content,
.font-body,
.gh-content,
.gh-content p,
.gh-content li,
.faq-answer-text,
.hero-subtitle,
.newsletter-description,
.pricing-feature-item,
.card-desc,
.post-excerpt,
.article-excerpt,
.testimonial-quote,
.gh-testimonials-subtitle,
.gh-testimonials-quote,
.author-bio,
.author-card-bio {
  font-family: var(--gh-font-body, var(--font-body));
}

.text-content {
  font-family: var(--gh-font-body, var(--font-body));
  color: var(--color-fg);
  line-height: 1.6;
}
.text-content.text-lead, .text-content .text-lead, p.lead {
  font-size: 1.125rem;
  line-height: 1.625;
  font-weight: 400;
}
.text-content.text-caption, .text-content .text-caption, span.caption {
  font-size: 0.75rem;
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.8;
}
.text-content.text-quote, .text-content .text-quote, blockquote.text-content {
  font-size: 1.125rem;
  font-style: italic;
  border-left: 2px solid currentColor;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.text-content.text-body, .text-content .text-body {
  font-size: 1rem;
  line-height: 1.6;
}
.space-y-4 > * + * {
  margin-top: 1rem;
}

/* 8. Shared Layout & Typography Utility Classes */
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-6 { gap: 1.5rem; }
.w-full { width: 100%; }
.h-auto { height: auto; }
.max-w-2xl { max-width: 42rem; }
.max-w-4xl { max-width: 56rem; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.font-normal { font-weight: 400; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-heading { font-family: var(--gh-font-heading, var(--font-heading)) !important; }
.font-body { font-family: var(--gh-font-body, var(--font-body)) !important; }
.font-sans { font-family: var(--gh-font-body, var(--font-body), system-ui, -apple-system, sans-serif); }
.font-mono { font-family: var(--font-mono, monospace); }
.uppercase { text-transform: uppercase; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.text-muted { color: var(--color-muted, #737373); }
.bg-white { background-color: var(--color-bg, #ffffff); }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border-radius: var(--radius-pill, 9999px);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
  line-height: 1.25;
}
.btn-primary,
.btn-accent {
  background-color: var(--ghost-accent-color, var(--color-accent)) !important;
  color: #ffffff !important;
  border: 1px solid transparent;
}
.btn-primary:hover,
.btn-accent:hover {
  opacity: 0.88;
}
.btn-secondary {
  background-color: transparent;
  color: var(--color-fg, #171717) !important;
  border: 1px solid var(--color-hairline, #ebebeb);
}
.btn-secondary:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
html.dark .btn-primary,
html.dark .btn-accent {
  background-color: var(--ghost-accent-color, var(--color-accent)) !important;
  color: #ffffff !important;
}
html.dark .btn-secondary {
  color: var(--color-fg) !important;
  border-color: var(--color-hairline, #333333) !important;
}

/* Ghost Native Action & Subscribe Buttons */
.gh-head-btn,
.gh-btn,
.gh-button {
  background-color: var(--ghost-accent-color, var(--color-accent)) !important;
  color: #ffffff !important;
  transition: opacity 0.15s ease;
}
.gh-head-btn:hover,
.gh-btn:hover,
.gh-button:hover {
  opacity: 0.88;
}

/* Global Form Focus Rings */
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--ghost-accent-color, var(--color-accent)) !important;
  outline-offset: 1px;
  border-color: var(--ghost-accent-color, var(--color-accent)) !important;
}

/* 9. Page Detail & Single Article Content */
.post-full-content {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  box-sizing: border-box;
}
.post-header {
  margin-bottom: 2rem;
}
.post-feature-image {
  margin: 1.5rem 0;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}
.post-feature-image img {
  width: 100%;
  height: auto;
  display: block;
}
.post-body {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--color-fg);
}
.post-body p {
  margin: 0 0 1.5em 0;
}

/* 10. Embeds & Video Utilities */
.gh-embed-wrapper {
  width: 100%;
  margin: 1.5rem auto;
  display: flex;
  justify-content: center;
}
.gh-embed-wrapper iframe,
.gh-embed-wrapper video {
  width: 100%;
  height: 100%;
  border: 0;
}
`;
}

/**
 * Generates the full packaged Ghost theme file list content.
 */
export function generateThemeFiles(doc: ThemeDocument): Record<string, string> {
  const files: Record<string, string> = {};

  const customConfig: Record<string, Record<string, unknown>> = {};

  // Scan all blocks for stats blocks and declare custom settings ONLY for what is actually referenced in templates
  const statsBlocks = Object.values(doc.blocks).filter((b) => b.type === "stats");
  if (statsBlocks.length > 0) {
    customConfig["stats_heading"] = {
      type: "text",
      name: "Stats: Heading",
      description: "Heading displayed in the Stats section",
      default: "Our impact",
      group: "homepage"
    };
    customConfig["stats_subheading"] = {
      type: "text",
      name: "Stats: Subheading",
      description: "Subheading displayed in the Stats section",
      default: "What we have achieved so far",
      group: "homepage"
    };

    const firstStats = statsBlocks[0];
    const sp = (firstStats.props || {}) as Record<string, unknown>;
    const spGeneral = (sp.general || {}) as Record<string, unknown>;
    if (spGeneral?.heading) customConfig["stats_heading"].default = spGeneral.heading;
    if (spGeneral?.subheading) customConfig["stats_subheading"].default = spGeneral.subheading;

    const statsList = (Array.isArray(sp.stats) ? sp.stats : []) as Array<Record<string, unknown>>;
    
    for (let i = 0; i < statsList.length; i++) {
      const st = statsList[i] || {};
      const num = i + 1;
      customConfig[`stat_${num}_value`] = {
        type: "text",
        name: `Stat ${num}: Value`,
        description: `Value or metric for Stat ${num}`,
        default: st.value || "",
        group: "homepage"
      };
      customConfig[`stat_${num}_label`] = {
        type: "text",
        name: `Stat ${num}: Label`,
        description: `Description label for Stat ${num}`,
        default: st.label || "",
        group: "homepage"
      };
      customConfig[`stat_${num}_icon`] = {
        type: "image",
        name: `Stat ${num}: Icon`,
        description: `Upload an icon image for Stat ${num}`,
        group: "homepage"
      };
    }
  }

  // 2. Extract global partials
  let headerCompiled = "";
  let footerCompiled = "";

  const headerId =
    doc.layouts?.header ||
    Object.values(doc.blocks).find((b) => b.type === "header")?.id;
  const footerId =
    doc.layouts?.footer ||
    Object.values(doc.blocks).find((b) => b.type === "footer")?.id;

  if (headerId && doc.blocks[headerId]) {
    headerCompiled = compileBlockToHbs(headerId, doc.blocks, false);
  }
  if (footerId && doc.blocks[footerId]) {
    footerCompiled = compileBlockToHbs(footerId, doc.blocks, false);
  }

  if (headerCompiled) files["partials/header.hbs"] = headerCompiled;
  if (footerCompiled) files["partials/footer.hbs"] = footerCompiled;

  // 2b. Bundle standard Casper icon partials
  for (const [iconPath, iconContent] of Object.entries(CASPER_ICON_PARTIALS)) {
    files[iconPath] = iconContent;
  }

  const colorAccent =
    doc.settings?.accentColor ||
    doc.settings?.designTokens?.colors?.accent ||
    "#0070f3";

  // 3. Generate default.hbs wrapper page
  files["default.hbs"] = `
<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{meta_title}}</title>
  <link rel="stylesheet" type="text/css" href="{{asset "built/screen.css"}}" />
  <style>
    :root {
      --ghost-accent-color: {{#if @site.accent_color}}{{@site.accent_color}}{{else}}${colorAccent}{{/if}};
    }
  </style>
  {{ghost_head}}
</head>
<body class="{{body_class}}">
  <div class="site-wrapper">
    <a class="skip-link" href="#site-main">Skip to content</a>
    ${headerCompiled ? '{{> "header"}}' : ''}
    <main id="site-main" class="site-main">
      {{{body}}}
    </main>
    ${footerCompiled ? '{{> "footer"}}' : ''}
  </div>
  {{ghost_foot}}
</body>
</html>`;

  // 3. Compile layout pages
  Object.keys(doc.pages).forEach((pageName) => {
    const compiledHtml = compilePageToHbs(pageName, doc);
    if (pageName === "home") {
      files["index.hbs"] = compiledHtml;
    } else if (pageName === "error") {
      files["error.hbs"] = compiledHtml;
      files["error-404.hbs"] = compiledHtml;
    } else {
      files[`${pageName}.hbs`] = compiledHtml;
    }
  });

  // 4. Generate navigation partial for Ghost compatibility (supporting both primary and secondary navigation)
  files["partials/navigation.hbs"] = `{{#if isSecondary}}
<ul class="nav nav-secondary" role="menu">
  {{#foreach navigation}}
    <li class="{{link_class for=(url) class=(concat "nav-" slug)}}" role="menuitem">
      <a href="{{url absolute="true"}}">{{label}}</a>
    </li>
  {{/foreach}}
</ul>
{{else}}
<ul class="nav" role="menu">
  {{#foreach navigation}}
    <li class="{{link_class for=(url) class=(concat "nav-" slug)}}" role="menuitem">
      <a href="{{url absolute="true"}}">{{label}}</a>
    </li>
  {{/foreach}}
</ul>
{{/if}}`;

  // 5. Generate asset stylesheet screen.css (both css and built paths for Ghost runtime compatibility)
  const compiledScreenCss = minifyCss(getSkeletonCss(doc));
  files["assets/css/screen.css"] = compiledScreenCss;
  files["assets/built/screen.css"] = compiledScreenCss;

  // 6. Generate content.hbs partial (supporting {{> "content" width="wide"}} or {{> "content"}})
  files["partials/content.hbs"] = `{{!--
    Standard Ghost content partial supporting {{> "content" width="wide"}} or {{> "content"}}
--}}
<section class="gh-content{{#if width}} gh-content-{{width}}{{/if}}">
    {{content}}
</section>
`;

  // 7. Generate post-card.hbs
  files["partials/post-card.hbs"] = `
<article class="gh-post-card {{post_class}}">
  <a class="gh-post-card-link" href="{{url}}">
    {{#if feature_image}}
    <div class="gh-post-card-image">
      <img
        srcset="{{img_url feature_image size="s"}} 300w,
                {{img_url feature_image size="m"}} 600w,
                {{img_url feature_image size="l"}} 1000w,
                {{img_url feature_image size="xl"}} 2000w"
        sizes="(max-width: 1000px) 400px, 800px"
        src="{{img_url feature_image size="m"}}"
        alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
        loading="lazy"
      />
    </div>
    {{/if}}
    <div class="gh-post-card-content">
      <h2 class="gh-post-card-title">{{title}}</h2>
      <p class="gh-post-card-excerpt">{{excerpt}}</p>
      <footer class="gh-post-card-meta">
        <span class="gh-post-card-date"><time datetime="{{date format="YYYY-MM-DD"}}">{{date format="D MMM YYYY"}}</time></span>
        <span class="gh-post-card-reading-time">{{reading_time}}</span>
      </footer>
    </div>
  </a>
</article>
`;

  // 8. Generate package.json definition (filtering customConfig to only settings actually used in templates)
  const allHbsContent = Object.entries(files)
    .filter(([path]) => path.endsWith('.hbs'))
    .map(([, content]) => content)
    .join('\n');

  const filteredCustomConfig: Record<string, Record<string, unknown>> = {};
  for (const [key, config] of Object.entries(customConfig)) {
    if (allHbsContent.includes(`@custom.${key}`)) {
      filteredCustomConfig[key] = config;
    }
  }

  const pkgConfig: Record<string, unknown> = {
    posts_per_page: 5,
    card_assets: true
  };
  if (Object.keys(filteredCustomConfig).length > 0) {
    pkgConfig.custom = filteredCustomConfig;
  }

  files["package.json"] = JSON.stringify({
    name: doc.metadata.name.toLowerCase().replace(/\s+/g, "-"),
    description: doc.metadata.description || "Visual theme compiled from AST builder",
    version: doc.metadata.version || "1.0.0",
    engines: {
      ghost: ">=4.0.0"
    },
    keywords: [
      "ghost-theme"
    ],
    config: pkgConfig,
    author: {
      name: doc.metadata.author,
      email: "support@example.com"
    }
  }, null, 2);

  // 9. Include uploaded document assets in theme package
  if (doc.assets) {
    for (const [rawPath, dataUri] of Object.entries(doc.assets)) {
      if (typeof dataUri === "string" && dataUri.startsWith("data:")) {
        const parts = dataUri.split(",");
        if (!parts[1]) continue;

        // Sanitize path against directory traversal and normalize separators
        const cleanPath = rawPath
          .replace(/\\/g, "/")
          .replace(/\.\.+/g, "")
          .replace(/^\/+/, "")
          .replace(/\/+/g, "/")
          .trim();

        if (!cleanPath) continue;

        // Confine uploaded assets safely to the assets/images/ directory
        const safePath = cleanPath.startsWith("assets/images/")
          ? cleanPath
          : cleanPath.startsWith("images/")
          ? `assets/${cleanPath}`
          : `assets/images/${cleanPath.replace(/^assets\//, "")}`;

        // Never overwrite existing compiled theme files (e.g. package.json, default.hbs, screen.css)
        if (!files[safePath]) {
          files[safePath] = parts[1];
        }
      }
    }
  }

  return files;
}

/**
 * Strips comments, line returns, and spacing patterns to minify CSS code contents.
 */
function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ")             // Compress consecutive spaces/returns into single spaces
    .replace(/\s*([{}|:;,])\s*/g, "$1") // Trim spaces around braces, colons, semi-colons, and commas
    .trim();
}
