import { BuilderBlock } from "@/types/theme";
import { getBackgroundCSS } from "../shared/background";
import { WIDTH_VALUES, CONTENT_WIDTH_VALUES } from "./schema";
import { ALL_SOCIAL_PLATFORMS, DEFAULT_SOCIAL_PLATFORMS, SocialPlatform } from "./socialIcons";
import { escapeHtml, escapeUrl } from "../shared/escape";

export const compileToHbs = (block: BuilderBlock, compiledChildren: string, isPageContext: boolean, blocks?: Record<string, BuilderBlock>) => {
  const p = block.props;
  const general = p.general || {};
  const colors = p.colors || {};
  const layout = p.layout || {};
  const spacing = p.spacing || {};
  const advanced = p.advanced || {};
  
  let activeStyles = block.styles || {};
  let activeAppearance = colors;
  let text = colors.textColor || '#1a1a1a';
  
  if (colors.syncWithHeader && blocks) {
    const headerBlock = Object.values(blocks).find((b: BuilderBlock) => b.type === "header");
    if (headerBlock) {
      activeStyles = headerBlock.styles || {};
      activeAppearance = headerBlock.props?.appearance || {};
      text = activeAppearance.textColor || "#000000";
    }
  }

  const bgCss = getBackgroundCSS(activeStyles, activeAppearance);
  const bgFallbackColor = activeAppearance.backgroundColor || "#ffffff";

  const htmlAnchor = advanced.htmlAnchor || 'site-footer';
  
  const showCopyright = general.showCopyright !== false && p.showCopyright !== false;
  const showSocialIcons = general.showSocialIcons !== false && p.showSocialIcons !== false;

  const rawCopyright = general.customCopyrightText || p.customCopyrightText || p.copyright || general.copyright;
  const copyrightHtml = (typeof rawCopyright === "string" && rawCopyright.trim() !== "")
    ? rawCopyright 
    : `&copy; {{date format="YYYY"}} {{@site.title}}. Published with <a href="https://ghost.org" target="_blank" rel="noopener">Ghost</a>.`;

  const DEFAULT_PLATFORM_URLS: Record<SocialPlatform, string> = {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
    threads: "https://threads.net",
    bluesky: "https://bsky.app",
    tiktok: "https://tiktok.com",
    mastodon: "https://mastodon.social",
  };

  const activePlatforms: SocialPlatform[] = Array.isArray(general.socialPlatforms) && general.socialPlatforms.length > 0
    ? general.socialPlatforms
    : (Array.isArray(p.socialPlatforms) && p.socialPlatforms.length > 0 ? p.socialPlatforms : DEFAULT_SOCIAL_PLATFORMS);

  const customUrls = (general.socialUrls || p.socialUrls || {}) as Record<string, string>;

  const socialLinksParts = activePlatforms.map(platform => {
    const config = ALL_SOCIAL_PLATFORMS.find(cfg => cfg.id === platform);
    if (!config) return "";
    const label = config.label;
    const partial = config.casperIconPartial;
    const userUrl = customUrls[platform]?.trim();
    
    if (userUrl) {
      return `<a href="${escapeUrl(userUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(label)}" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
          {{> "${partial}"}}
        </a>`;
    }

    if (platform === "facebook") {
      return `{{#if @site.facebook}}
        <a href="{{@site.facebook}}" target="_blank" rel="noopener" aria-label="Facebook" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
          {{> "icons/facebook"}}
        </a>
      {{else}}
        <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
          {{> "icons/facebook"}}
        </a>
      {{/if}}`;
    }

    if (platform === "twitter") {
      return `{{#if @site.twitter}}
        <a href="{{@site.twitter}}" target="_blank" rel="noopener" aria-label="X" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
          {{> "icons/x"}}
        </a>
      {{else}}
        <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="X" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
          {{> "icons/x"}}
        </a>
      {{/if}}`;
    }

    const defaultUrl = DEFAULT_PLATFORM_URLS[platform] || "#";
    return `<a href="${escapeUrl(defaultUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(label)}" style="color: inherit; opacity: 0.8; transition: opacity 0.2s;">
        {{> "${partial}"}}
      </a>`;
  }).filter(Boolean).join("\n      ");

  const socialIconsHtml = `
    <div class="footer-social-links" style="display: flex; flex-wrap: wrap; gap: 14px 16px; align-items: center; justify-content: center; max-width: 100%;">
      ${socialLinksParts}
    </div>
  `;

  let innerHtml = '';
  
  if (general.layoutStyle === "Multi-Column") {
    innerHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 48px;">
        <div>
          <h4 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">{{@site.title}}</h4>
          <p style="opacity: 0.8; line-height: 1.5; margin-bottom: 24px;">{{@site.description}}</p>
          ${showSocialIcons ? socialIconsHtml : ''}
        </div>
        <div class="footer-nav-column">
          <h4 style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; opacity: 0.6;">Navigation</h4>
          {{#if @site.navigation}}
            {{navigation}}
          {{else}}
            <ul class="nav" role="menu">
              <li class="nav-home" role="menuitem"><a href="/">Home</a></li>
              <li class="nav-about" role="menuitem"><a href="/about/">About</a></li>
              <li class="nav-collection" role="menuitem"><a href="/collection/">Collection</a></li>
            </ul>
          {{/if}}
        </div>
        ${general.showSecondaryNav !== false ? `
        <div class="footer-nav-column">
          <h4 style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; opacity: 0.6;">${escapeHtml(general.secondaryNavTitle || 'More')}</h4>
          {{#if @site.secondary_navigation}}
            {{navigation type="secondary"}}
          {{else}}
            <ul class="nav nav-secondary" role="menu">
              <li class="nav-privacy" role="menuitem"><a href="/privacy/">Privacy Policy</a></li>
              <li class="nav-terms" role="menuitem"><a href="/terms/">Terms of Service</a></li>
              <li class="nav-contact" role="menuitem"><a href="/contact/">Contact</a></li>
            </ul>
          {{/if}}
        </div>
        ` : ''}
      </div>
      ${showCopyright ? `
      <div class="footer-bottom" style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding-top: 24px; border-top: 1px solid currentColor; text-align: center;">
        <div class="footer-copyright" style="opacity: 0.7;">${copyrightHtml}</div>
      </div>
      ` : ''}
    `;
  } else if (general.layoutStyle === "Newsletter Integrated") {
    innerHtml = `
      ${general.showSubscribeBox !== false ? `
      <div style="text-align: center; max-width: 600px; margin: 0 auto 64px auto; padding: 48px 24px; background: currentColor; color: ${bgFallbackColor}; border-radius: 12px;">
        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Subscribe to our newsletter</h3>
        <p style="opacity: 0.8; margin-bottom: 24px;">Get the latest posts delivered right to your inbox.</p>
        <form data-members-form="subscribe" style="display: flex; flex-direction: column; gap: 8px; max-width: 400px; margin: 0 auto;">
          <input data-members-email type="email" required placeholder="Your email address" style="flex: 1; padding: 12px 16px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); outline: none; color: var(--color-fg); background-color: var(--color-bg);">
          <button type="submit" class="footer-subscribe-btn" style="padding: 12px 24px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; background-color: ${colors.buttonBgColor || 'var(--ghost-accent-color, var(--color-accent))'}; color: ${colors.buttonTextColor || '#ffffff'}; transition: opacity 0.2s;">Subscribe</button>
        </form>
      </div>
      ` : ''}
      
      <div class="footer-bottom" style="width: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; font-size: 0.875rem; line-height: 1.5; box-sizing: border-box; ${general.showSubscribeBox !== false ? 'padding-top: 24px; border-top: 1px solid currentColor;' : ''}">
        ${showCopyright ? `<div class="footer-copyright" style="opacity: 0.7; text-align: left; flex-shrink: 0; font-size: 0.875rem;">${copyrightHtml}</div>` : ''}
        <div class="footer-actions" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 24px;">
          ${general.showSecondaryNav !== false ? `
          <nav class="footer-secondary-nav" aria-label="Secondary Navigation">
            {{#if @site.secondary_navigation}}
              {{navigation type="secondary"}}
            {{else}}
              <ul class="nav nav-secondary" role="menu">
                <li class="nav-privacy" role="menuitem"><a href="/privacy/">Privacy Policy</a></li>
                <li class="nav-terms" role="menuitem"><a href="/terms/">Terms of Service</a></li>
                <li class="nav-contact" role="menuitem"><a href="/contact/">Contact</a></li>
              </ul>
            {{/if}}
          </nav>
          ` : ''}
          ${showSocialIcons ? socialIconsHtml : ''}
        </div>
      </div>
    `;
  } else {
    // Simple Minimal
    innerHtml = `
      <div class="footer-bottom" style="width: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; font-size: 0.875rem; line-height: 1.5; box-sizing: border-box;">
        ${showCopyright ? `<div class="footer-copyright" style="opacity: 0.7; text-align: left; flex-shrink: 0; font-size: 0.875rem;">${copyrightHtml}</div>` : ''}
        <div class="footer-actions" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 24px;">
          ${general.showSecondaryNav !== false ? `
          <nav class="footer-secondary-nav" aria-label="Secondary Navigation">
            {{#if @site.secondary_navigation}}
              {{navigation type="secondary"}}
            {{else}}
              <ul class="nav nav-secondary" role="menu">
                <li class="nav-privacy" role="menuitem"><a href="/privacy/">Privacy Policy</a></li>
                <li class="nav-terms" role="menuitem"><a href="/terms/">Terms of Service</a></li>
                <li class="nav-contact" role="menuitem"><a href="/contact/">Contact</a></li>
              </ul>
            {{/if}}
          </nav>
          ` : ''}
          ${showSocialIcons ? socialIconsHtml : ''}
        </div>
      </div>
    `;
  }

  const resolvePadding = (val: unknown, fallback: string = "40px"): string => {
    if (val === undefined || val === null || val === "") return fallback;
    if (typeof val === "number") return `${val}px`;
    if (typeof val === "string") {
      return val.endsWith("px") || val.endsWith("rem") || val.endsWith("em") || val.endsWith("%")
        ? val
        : `${val}px`;
    }
    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const resolved = obj.desktop ?? obj.tablet ?? obj.mobile;
      if (resolved !== undefined && resolved !== null) {
        return resolvePadding(resolved, fallback);
      }
    }
    return fallback;
  };

  const pt = resolvePadding(
    spacing.paddingTop ?? block.styles?.paddingTop ?? spacing.padding?.topBottom,
    "40px"
  );
  const pb = resolvePadding(
    spacing.paddingBottom ?? block.styles?.paddingBottom ?? spacing.padding?.topBottom,
    "40px"
  );
  const plr = resolvePadding(
    spacing.paddingLeft ?? spacing.paddingRight ?? spacing.padding?.leftRight,
    "24px"
  );

  const sectionWidth = layout.sectionWidth || "full";
  const sectionMaxWidth = WIDTH_VALUES[sectionWidth] || "100%";
  const isSectionFull = sectionWidth === "full";
  
  const contentWidth = layout.contentWidth || "standard";
  const contentMaxWidth = CONTENT_WIDTH_VALUES[contentWidth] || "100%";

  return `
<style>
  #${htmlAnchor},
  footer#${htmlAnchor},
  .site-footer#${htmlAnchor} {
    width: 100% !important;
    ${bgCss}
    color: ${text} !important;
    padding-top: ${pt} !important;
    padding-bottom: ${pb} !important;
    padding-left: ${plr} !important;
    padding-right: ${plr} !important;
    max-width: ${sectionMaxWidth} !important;
    margin-left: auto !important;
    margin-right: auto !important;
    box-sizing: border-box !important;
    ${!isSectionFull ? 'border-radius: 12px !important; margin-top: 24px !important; margin-bottom: 24px !important;' : ''}
  }
  #${htmlAnchor} a {
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  #${htmlAnchor} a:hover {
    opacity: 0.7;
  }

  #${htmlAnchor} .footer-social-links:empty,
  #${htmlAnchor} .footer-secondary-nav:empty,
  #${htmlAnchor} .footer-secondary-column:empty {
    display: none !important;
  }
  #${htmlAnchor} .footer-social-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 14px 16px;
    max-width: 100%;
  }
  #${htmlAnchor} .footer-social-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  #${htmlAnchor} .footer-social-links a:hover {
    opacity: 1;
  }
  #${htmlAnchor} .footer-social-links svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  /* Footer Navigation Columns (Multi-Column) */
  #${htmlAnchor} .footer-nav-column .nav,
  #${htmlAnchor} .footer-nav-column .nav-secondary {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  #${htmlAnchor} .footer-nav-column .nav li,
  #${htmlAnchor} .footer-nav-column .nav-secondary li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  #${htmlAnchor} .footer-nav-column .nav a,
  #${htmlAnchor} .footer-nav-column .nav-secondary a {
    color: inherit;
    text-decoration: none;
    opacity: 0.8;
    font-size: 0.875rem;
    line-height: 1.5;
    transition: opacity 0.2s;
  }
  #${htmlAnchor} .footer-nav-column .nav a:hover,
  #${htmlAnchor} .footer-nav-column .nav-secondary a:hover {
    opacity: 1;
  }

  /* Footer Secondary Navigation (Horizontal row in bottom bar) */
  #${htmlAnchor} .footer-secondary-nav,
  #${htmlAnchor} .footer-secondary-nav .nav,
  #${htmlAnchor} .footer-secondary-nav .nav-secondary,
  #${htmlAnchor} .footer-bottom ul.nav,
  #${htmlAnchor} .footer-bottom ul.nav-secondary {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px 24px;
  }
  #${htmlAnchor} .footer-secondary-nav .nav li,
  #${htmlAnchor} .footer-secondary-nav .nav-secondary li,
  #${htmlAnchor} .footer-bottom ul.nav li,
  #${htmlAnchor} .footer-bottom ul.nav-secondary li {
    list-style: none;
    margin: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
  }
  #${htmlAnchor} .footer-secondary-nav .nav a,
  #${htmlAnchor} .footer-secondary-nav .nav-secondary a,
  #${htmlAnchor} .footer-bottom ul.nav a,
  #${htmlAnchor} .footer-bottom ul.nav-secondary a {
    color: inherit;
    text-decoration: none;
    opacity: 0.8;
    font-size: 0.875rem;
    transition: opacity 0.2s;
  }
  #${htmlAnchor} .footer-secondary-nav .nav a:hover,
  #${htmlAnchor} .footer-secondary-nav .nav-secondary a:hover,
  #${htmlAnchor} .footer-bottom ul.nav a:hover,
  #${htmlAnchor} .footer-bottom ul.nav-secondary a:hover {
    opacity: 1;
  }

  html.dark #${htmlAnchor} {
    background-color: var(--color-bg) !important;
    color: var(--color-fg) !important;
  }
  html.dark #${htmlAnchor} .footer-subscribe-btn {
    background-color: var(--ghost-accent-color, var(--color-accent)) !important;
    color: #ffffff !important;
  }
  #${htmlAnchor} .footer-inner {
    margin: 0 auto;
    max-width: ${contentMaxWidth};
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  #${htmlAnchor} .footer-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
    box-sizing: border-box;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  #${htmlAnchor} .footer-copyright {
    opacity: 0.7;
    font-size: 0.875rem;
    text-align: left;
    flex-shrink: 0;
  }
  #${htmlAnchor} .footer-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
  }
  @media (max-width: 768px) {
    #${htmlAnchor} .footer-bottom {
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 20px !important;
    }
    #${htmlAnchor} .footer-copyright {
      text-align: center !important;
      width: 100% !important;
    }
    #${htmlAnchor} .footer-actions {
      justify-content: center !important;
      width: 100% !important;
    }
  }
</style>
<footer 
  id="${htmlAnchor}" 
  class="site-footer section-width-${layout.sectionWidth || 'full'} ${activeStyles.backgroundType === "mesh" ? 'mesh-glow' : ''}"
  style="
    width: 100%;
    ${bgCss}
    color: ${text};
    padding-top: ${pt};
    padding-bottom: ${pb};
    padding-left: ${plr};
    padding-right: ${plr};
    max-width: min(${sectionMaxWidth}, 100%);
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
    ${!isSectionFull ? 'border-radius: 12px; margin-top: 24px; margin-bottom: 24px;' : ''}
  "
>
  <div class="gh-container footer-inner content-width-${layout.contentWidth || 'standard'} align-${layout.align || 'center'}" style="margin: 0 auto; max-width: min(${contentMaxWidth}, 100%); width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 32px;">
    ${innerHtml}
  </div>
</footer>`;
};