import { BuilderBlock } from "@/types/theme";
import { hexToRgba, WIDTH_VALUES, CONTENT_WIDTH_VALUES } from "./constants";
import { getBackgroundCSS } from "../shared/background";
import { escapeHtml, escapeUrl } from "../shared/escape";

export const compileToHbs = (block: BuilderBlock): string => {
  const p = block.props || {};
  const general = p.general || {};
  const appearance = p.appearance || {};
  const styles = block.styles || {};
  const advanced = p.advanced || {};

  const layoutStyle = general.layoutStyle || "Logo on Left";
  const isLogoCenter = layoutStyle === "Logo in Center";
  const isStacked = layoutStyle === "Stacked";

  const palette = {
    bg: appearance.backgroundColor || "var(--color-bg, #ffffff)",
    text: appearance.textColor || "var(--color-fg, #171717)",
    buttonBg: appearance.buttonBgColor || "var(--ghost-accent-color, var(--color-accent))",
    buttonText: appearance.buttonTextColor || "#ffffff",
  };

  const glassEnabled = !!styles.backdropBlur && styles.backdropBlur !== "none";
  let inlineBgCss = getBackgroundCSS(styles, appearance, false);
  let importantBgCss = getBackgroundCSS(styles, appearance, true);

  if (glassEnabled && (styles?.backgroundType === "solid" || !styles?.backgroundType)) {
      inlineBgCss = `background-color: ${hexToRgba(palette.bg, 0.75)};`;
      importantBgCss = `background-color: ${hexToRgba(palette.bg, 0.75)} !important;`;
  }

  const sectionMaxWidth = WIDTH_VALUES[appearance.sectionWidth || "full"] || "100%";
  const contentMaxWidth = CONTENT_WIDTH_VALUES[appearance.contentWidth || "wide"] || "100%";
  const isSectionFull = sectionMaxWidth === "100%";

  const shadowValue = styles.boxShadow && styles.boxShadow !== "none" ? styles.boxShadow : "none";
  const htmlAnchor = advanced.htmlAnchor || "gh-head";
  const headerPt = p.spacing?.paddingTop !== undefined ? `${p.spacing.paddingTop}px` : (styles?.paddingTop || '20px');
  const headerPb = p.spacing?.paddingBottom !== undefined ? `${p.spacing.paddingBottom}px` : (styles?.paddingBottom || '20px');

  const searchSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

  const themeSvg = `
    <svg class="icon-moon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    <svg class="icon-sun" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="display: none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  `;

  const brandHtml = general.showLogo !== false ? `
    <div class="gh-head-brand">
      <a class="gh-head-logo" href="{{@site.url}}" style="color: inherit; text-decoration: none; display: flex; align-items: center; gap: 8px;">
        {{#if @site.logo}}
          <img src="{{@site.logo}}" class="gh-logo${general.darkLogoUrl ? " gh-logo-light" : ""}" alt="{{@site.title}}" style="max-height: ${general.logoSize || 40}px; width: auto;" />
          ${general.darkLogoUrl ? `<img src="${escapeUrl(general.darkLogoUrl)}" class="gh-logo gh-logo-dark" alt="{{@site.title}}" style="max-height: ${general.logoSize || 40}px; width: auto;" />` : ""}
        {{else}}
          ${general.logoUrl ? `
          <img src="${escapeUrl(general.logoUrl)}" class="gh-logo${general.darkLogoUrl ? " gh-logo-light" : ""}" alt="{{@site.title}}" style="max-height: ${general.logoSize || 40}px; width: auto;" />
          ${general.darkLogoUrl ? `<img src="${escapeUrl(general.darkLogoUrl)}" class="gh-logo gh-logo-dark" alt="{{@site.title}}" style="max-height: ${general.logoSize || 40}px; width: auto;" />` : ""}
          ` : `<span class="gh-site-title">{{@site.title}}</span>`}
        {{/if}}
      </a>
      <div class="gh-head-brand-actions" style="display: flex; align-items: center; gap: 8px;">
        ${general.showSearch !== false ? `<button class="gh-search-btn gh-mobile-only" data-ghost-search aria-label="Search" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">${searchSvg}</button>` : ""}
        ${general.showThemeSwitcher !== false ? `<button class="gh-theme-toggle gh-mobile-only" aria-label="Toggle Theme" onclick="toggleThemeMode()" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">${themeSvg}</button>` : ""}
        <button class="gh-burger" aria-label="Main Menu">
          <svg class="burger-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="pointer-events: none;">
            <line x1="3" y1="8" x2="21" y2="8"></line>
            <line x1="3" y1="16" x2="21" y2="16"></line>
          </svg>
          <svg class="close-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display: none; pointer-events: none;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>` : `
    <div class="gh-head-brand">
      <div class="gh-head-brand-actions" style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
        ${general.showSearch !== false ? `<button class="gh-search-btn gh-mobile-only" data-ghost-search aria-label="Search" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">${searchSvg}</button>` : ""}
        ${general.showThemeSwitcher !== false ? `<button class="gh-theme-toggle gh-mobile-only" aria-label="Toggle Theme" onclick="toggleThemeMode()" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">${themeSvg}</button>` : ""}
        <button class="gh-burger" aria-label="Main Menu">
          <svg class="burger-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="pointer-events: none;">
            <line x1="3" y1="8" x2="21" y2="8"></line>
            <line x1="3" y1="16" x2="21" y2="16"></line>
          </svg>
          <svg class="close-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display: none; pointer-events: none;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>`;

  // FIX (bug 1): the nav had no flex/gap of its own — it only relied on a
  // `.gh-head-menu .nav` selector in the <style> block that doesn't match
  // Ghost's actual {{navigation}} output (plain <a> tags, no .nav wrapper).
  // Inline flex/gap here means it works even if the <style> block below is
  // stripped or the markup structure changes again.
  const navHtml = `
    <nav class="gh-head-menu">
      {{navigation}}
    </nav>`;

  const actionsHtml = `
    <div class="gh-head-actions">
      ${general.showSearch !== false ? `
      <button class="gh-search-btn gh-desktop-only" data-ghost-search aria-label="Search" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>` : ""}

      ${general.showThemeSwitcher !== false ? `
      <button class="gh-theme-toggle gh-desktop-only" aria-label="Toggle Theme" onclick="toggleThemeMode()" style="padding: 6px; border-radius: 9999px; border: none; background: transparent; color: inherit; cursor: pointer; opacity: 0.8; transition: opacity 0.15s;">
        ${themeSvg}
      </button>` : ""}

      {{#if @site.members_enabled}}
        {{#unless @member}}
          ${general.showSignIn !== false ? `
          <a class="gh-head-link" href="#/portal/signin" data-portal="signin" style="font-size: 17px; font-weight: 500; color: inherit; text-decoration: none; opacity: 0.9; padding: 0 4px; white-space: nowrap;">${escapeHtml(general.signInText || "Sign in")}</a>` : ""}
          ${general.showSubscribe !== false ? `
          <a class="gh-head-btn gh-btn" href="#/portal/signup" data-portal="signup" style="background-color: ${palette.buttonBg}; color: ${palette.buttonText}; padding: 10px 24px; border-radius: 9999px; font-size: 17px; font-weight: 600; text-decoration: none; white-space: nowrap; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: opacity 0.15s; border: none; opacity: 0.95;">${escapeHtml(general.subscribeText ?? "Subscribe")}</a>` : ""}
        {{else}}
          <a class="gh-head-link gh-signout" href="javascript:" data-members-signout style="font-size: 17px; font-weight: 500; color: inherit; text-decoration: none; opacity: 0.9; padding: 0 4px; white-space: nowrap;">Sign out</a>
          <a class="gh-head-btn gh-btn" href="#/portal/account" data-portal="account" style="background-color: ${palette.buttonBg}; color: ${palette.buttonText}; padding: 10px 24px; border-radius: 9999px; font-size: 17px; font-weight: 600; text-decoration: none; white-space: nowrap; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: opacity 0.15s; border: none; opacity: 0.95;">Account</a>
        {{/unless}}
      {{/if}}
    </div>`;

  let desktopLayoutCss = "";
  if (isStacked) {
    desktopLayoutCss = `
      #${htmlAnchor} .gh-head-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
      }
      #${htmlAnchor} .gh-head-menu {
        display: flex;
        justify-content: center;
        width: 100%;
      }
    `;
  } else if (isLogoCenter) {
    desktopLayoutCss = `
      #${htmlAnchor} .gh-head-inner {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 24px;
      }
      #${htmlAnchor} .gh-head-brand { justify-self: center; order: 2; }
      #${htmlAnchor} .gh-head-menu { 
        order: 1; 
        display: flex; 
        justify-content: flex-start; 
        width: 100%;
      }
      #${htmlAnchor} .gh-head-actions { justify-self: end; order: 3; }
    `;
  } else {
    desktopLayoutCss = `
      #${htmlAnchor} .gh-head-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
      }
      #${htmlAnchor} .gh-head-brand { 
        flex-shrink: 0; 
      }
      #${htmlAnchor} .gh-head-menu { 
        display: flex; 
        justify-content: flex-start;
        flex-grow: 1;
        width: auto;
      }
      #${htmlAnchor} .gh-head-actions { 
        flex-shrink: 0; 
      }
    `;
  }

  // FIX (bug 2): section-width-* / content-width-* classes were emitted on
  // the elements but nothing in this <style> block ever defined what they
  // do. max-width is now set directly (both here in the fallback CSS classes
  // AND as an inline style on the elements below, so it works regardless of
  // whether this <style> block or the inline style wins in your build).
  const sectionWidthCss = isSectionFull
    ? `max-width: none;`
    : `max-width: ${sectionMaxWidth}; margin-left: auto; margin-right: auto; border-radius: 12px;`;
  const contentWidthCss = `max-width: ${contentMaxWidth}; margin-left: auto; margin-right: auto;`;

  return `
<style>
  #${htmlAnchor}.section-width-${appearance.sectionWidth || 'full'} {
    ${sectionWidthCss}
  }
  #${htmlAnchor} .gh-head-inner.content-width-${appearance.contentWidth || 'wide'} {
    ${contentWidthCss}
  }

  #${htmlAnchor} .gh-head-brand {
    font-family: var(--gh-font-heading, var(--font-heading));
    font-weight: 700;
    font-size: 24px;
    white-space: nowrap;
  }
  #${htmlAnchor} .gh-site-title {
    font-family: var(--gh-font-heading, var(--font-heading));
  }
  #${htmlAnchor} .gh-head-inner {
    padding: 0 4vmin;
  }
  @media (min-width: 768px) {
    #${htmlAnchor} .gh-head-inner {
      padding: ${headerPt} 24px ${headerPb} 24px;
    }
    ${desktopLayoutCss}
    #${htmlAnchor} .gh-head-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #${htmlAnchor} .gh-burger {
      display: none !important;
    }
    #${htmlAnchor} .gh-head-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      background: transparent !important;
      background-color: transparent !important;
    }
    #${htmlAnchor} .gh-head-actions .gh-search-btn { order: 1; }
    #${htmlAnchor} .gh-head-actions .gh-theme-toggle { order: 2; }
    #${htmlAnchor} .gh-head-actions :is(.gh-head-link, .gh-signout) { order: 3; }
    #${htmlAnchor} .gh-head-actions .gh-head-btn { order: 4; }
    #${htmlAnchor} .gh-head-menu {
      opacity: 0.9;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    #${htmlAnchor} .gh-head-menu::-webkit-scrollbar {
      display: none;
    }
    #${htmlAnchor} .gh-head-menu .nav {
      display: inline-flex;
      flex-wrap: nowrap;
      white-space: nowrap;
      align-items: center;
      justify-content: ${isStacked ? 'center' : 'flex-start'};
      gap: ${isStacked ? '24px' : '20px'};
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
  #${htmlAnchor} .gh-head-menu .nav li {
    margin: 0;
    padding: 0;
    flex-shrink: 0;
    white-space: nowrap;
  }
  #${htmlAnchor} .gh-head-menu .nav a {
    color: inherit;
    text-decoration: none;
    font-size: 17px;
    font-weight: 500;
    opacity: 0.9;
    padding: 6px 12px;
    display: inline-block;
    transition: opacity 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  #${htmlAnchor} .gh-head-menu a:hover,
  #${htmlAnchor} .gh-search-btn:hover,
  #${htmlAnchor} .gh-theme-toggle:hover,
  #${htmlAnchor} .gh-head-link:hover,
  #${htmlAnchor} .gh-head-btn:hover {
    opacity: 1 !important;
  }

  /* ===== Dropdown Menus & Header Stacking ===== */
  .gh-head-wrapper,
  #${htmlAnchor}.gh-head,
  .gh-head {
    position: relative !important;
    z-index: 9999 !important;
    overflow: visible !important;
  }
  #${htmlAnchor} .gh-head-inner,
  #${htmlAnchor} .gh-head-menu,
  #${htmlAnchor} .gh-head-menu .nav {
    overflow: visible !important;
  }
  #${htmlAnchor} .nav-dropdown-parent {
    position: relative !important;
    overflow: visible !important;
  }
  #${htmlAnchor} .nav-dropdown-parent > a {
    display: inline-flex !important;
    align-items: center;
    gap: 4px;
  }
  #${htmlAnchor} .nav-dropdown-chevron {
    display: inline-block;
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
    opacity: 0.5;
    vertical-align: middle;
    margin-left: 2px;
  }
  #${htmlAnchor} .nav-dropdown-parent:hover .nav-dropdown-chevron,
  #${htmlAnchor} .nav-dropdown-parent:focus-within .nav-dropdown-chevron,
  #${htmlAnchor} .nav-dropdown-parent.is-open .nav-dropdown-chevron {
    transform: rotate(180deg);
    opacity: 0.8;
  }
  #${htmlAnchor} .nav-dropdown-card {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    min-width: 180px;
    padding-top: 6px;
    z-index: 10000 !important;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  }
  #${htmlAnchor} .nav-dropdown-card::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 0;
    right: 0;
    height: 10px;
  }
  #${htmlAnchor} .nav-dropdown-parent:hover > .nav-dropdown-card,
  #${htmlAnchor} .nav-dropdown-parent:focus-within > .nav-dropdown-card,
  #${htmlAnchor} .nav-dropdown-parent.is-open > .nav-dropdown-card {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }
  #${htmlAnchor} .nav-dropdown-inner {
    background: var(--color-bg);
    color: var(--color-fg);
    border-radius: 8px;
    padding: 6px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  html.dark #${htmlAnchor} .nav-dropdown-inner {
    background: #1f1f1f !important;
    color: #ffffff !important;
    border-color: rgba(255,255,255,0.12) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2) !important;
  }
  #${htmlAnchor} .nav-dropdown-inner a,
  #${htmlAnchor} .nav-dropdown-link {
    color: var(--color-fg) !important;
    padding: 8px 14px !important;
    border-radius: 5px;
    font-size: 14px !important;
    font-weight: 500 !important;
    white-space: nowrap;
    display: block !important;
    opacity: 0.9 !important;
    text-decoration: none !important;
    text-align: left !important;
    transition: background 0.15s, opacity 0.15s, color 0.15s;
    line-height: 1.4 !important;
  }
  #${htmlAnchor} .nav-dropdown-inner a:hover,
  #${htmlAnchor} .nav-dropdown-link:hover {
    background: rgba(0,0,0,0.05) !important;
    opacity: 1 !important;
    color: var(--color-fg) !important;
  }
  html.dark #${htmlAnchor} .nav-dropdown-inner a,
  html.dark #${htmlAnchor} .nav-dropdown-link {
    color: #f3f4f6 !important;
  }
  html.dark #${htmlAnchor} .nav-dropdown-inner a:hover,
  html.dark #${htmlAnchor} .nav-dropdown-link:hover {
    background: rgba(255,255,255,0.08) !important;
    color: #ffffff !important;
    opacity: 1 !important;
  }

  /* CRITICAL: Mobile Accordion must NEVER be visible on desktop */
  #${htmlAnchor} .nav-accordion {
    display: none !important;
  }

  /* ===== Mobile Accordion Dropdown ===== */
  @media (max-width: 767px) {
    #${htmlAnchor} .nav-dropdown-card {
      display: none !important;
    }
    .gh-head-open #${htmlAnchor}.gh-head .nav-dropdown-parent,
    #${htmlAnchor} .nav-dropdown-parent {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
    }
    #${htmlAnchor} .nav-dropdown-parent > a {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      cursor: pointer;
    }
    #${htmlAnchor} .nav-accordion {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.25s ease;
      opacity: 0;
      margin: 0 !important;
      padding: 0 !important;
      list-style: none !important;
    }
    #${htmlAnchor} .nav-accordion.is-open {
      max-height: 500px;
      opacity: 1;
      padding: 4px 0 !important;
    }
    #${htmlAnchor} .nav-accordion a,
    #${htmlAnchor} .nav-accordion-link {
      font-size: 1.125rem !important;
      font-weight: 500 !important;
      opacity: 0.75 !important;
      padding: 8px 0 !important;
      text-align: center !important;
      color: inherit !important;
      text-decoration: none !important;
      display: block !important;
      transition: opacity 0.15s ease;
    }
    #${htmlAnchor} .nav-accordion a:hover,
    #${htmlAnchor} .nav-accordion-link:hover {
      opacity: 1 !important;
    }
  }
  
  #${htmlAnchor} .gh-mobile-only {
    display: none !important;
  }
  
  /* ===== Mobile Menu ===== */
  /* 
   * These rules use doubled-up class selectors to beat Casper's built-in
   * #gh-head specificity on the same elements. The .gh-head class is always
   * present on the <header> alongside the #gh-head id.
   */
  @media (max-width: 767px) {
    /* -- Closed state: compact 64px bar -- */
    #${htmlAnchor}.gh-head {
      height: 64px !important;
    }
    #${htmlAnchor}.gh-head .gh-desktop-only {
      display: none !important;
    }
    #${htmlAnchor}.gh-head .gh-mobile-only {
      display: block !important;
    }

    #${htmlAnchor}.gh-head .gh-head-inner {
      grid-template-rows: auto 1fr auto !important;
      grid-template-columns: 1fr !important;
      gap: 48px !important;
    }

    #${htmlAnchor}.gh-head .gh-head-brand {
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      align-items: center !important;
      height: 64px !important;
    }

    #${htmlAnchor}.gh-head .gh-burger {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      color: inherit !important;
      padding: 8px !important;
    }

    #${htmlAnchor}.gh-head .gh-burger svg {
      stroke: currentColor !important;
      color: inherit !important;
    }

    #${htmlAnchor}.gh-head .gh-head-menu,
    #${htmlAnchor}.gh-head .gh-head-actions {
      position: fixed !important;
      justify-content: center !important;
      visibility: hidden !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
    }

    #${htmlAnchor}.gh-head .gh-head-menu {
      margin: 0 !important;
      transform: translateY(0) !important;
    }

    #${htmlAnchor}.gh-head .nav li {
      opacity: 0 !important;
      transform: translateY(-4px) !important;
      transition: transform 0.2s ease, opacity 0.2s ease !important;
    }

    #${htmlAnchor}.gh-head :is(.gh-head-button, .gh-head-link, .gh-head-btn) {
      opacity: 0 !important;
      transform: translateY(8px) !important;
      transition: transform 0.4s ease, opacity 0.4s ease !important;
    }

    /* -- Open state: full viewport overlay -- */
    .gh-head-open #${htmlAnchor}.gh-head {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      height: 100% !important;
      height: 100vh !important;
      height: 100dvh !important;
      max-height: none !important;
      z-index: 3999999 !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      ${importantBgCss}
    }

    .gh-head-open #${htmlAnchor}.gh-head .gh-head-inner {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100% !important;
      min-height: 100vh !important;
      min-height: 100dvh !important;
      box-sizing: border-box !important;
      align-items: center !important;
      justify-content: flex-start !important;
      padding: 0 16px 24px 16px !important;
      gap: 0 !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .gh-head-brand {
      width: 100% !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      height: 64px !important;
      flex-shrink: 0 !important;
      margin-bottom: 0 !important;
      padding: 0 !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .gh-head-menu {
      position: static !important;
      visibility: visible !important;
      opacity: 1 !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
      background: transparent !important;
      background-color: transparent !important;
      margin: 0 !important;
      padding: 32px 16px 20px 16px !important;
      gap: 20px !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .gh-head-actions {
      position: static !important;
      margin-top: auto !important;
      margin-bottom: 0 !important;
      visibility: visible !important;
      opacity: 1 !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 16px !important;
      width: 100% !important;
      padding: 24px 16px 32px 16px !important;
      background: transparent !important;
      background-color: transparent !important;
      flex-shrink: 0 !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .nav {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 20px !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      list-style: none !important;
      line-height: 1.3 !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .nav li {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      text-align: center !important;
      opacity: 1 !important;
      transform: translateY(0) !important;
      transition: transform 0.2s ease, opacity 0.2s ease !important;
    }

    /* Staggered delays for nav items */
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(1) { transition-delay: 0.05s !important; }
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(2) { transition-delay: 0.10s !important; }
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(3) { transition-delay: 0.15s !important; }
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(4) { transition-delay: 0.20s !important; }
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(5) { transition-delay: 0.25s !important; }
    .gh-head-open #${htmlAnchor}.gh-head .nav li:nth-child(6) { transition-delay: 0.30s !important; }

    .gh-head-open #${htmlAnchor}.gh-head .nav a {
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      text-align: center !important;
      width: 100% !important;
      display: inline-block !important;
      padding: 0 !important;
      text-decoration: none !important;
      color: inherit !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head :is(.gh-head-button, .gh-head-link, .gh-head-btn, .gh-signout) {
      opacity: 1 !important;
      transform: translateY(0) !important;
      transition: transform 0.4s ease, opacity 0.4s ease !important;
      transition-delay: 0.2s !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head .gh-head-btn {
      order: 1 !important;
      width: 100% !important;
      max-width: 280px !important;
      text-align: center !important;
      display: inline-block !important;
      padding: 10px 24px !important;
      border-radius: 9999px !important;
      font-size: 1.0625rem !important;
      font-weight: 600 !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      text-decoration: none !important;
    }

    .gh-head-open #${htmlAnchor}.gh-head :is(.gh-head-link, .gh-signout) {
      order: 2 !important;
      text-align: center !important;
      font-size: 1.0625rem !important;
      font-weight: 500 !important;
      opacity: 0.9 !important;
      display: inline-block !important;
      text-decoration: none !important;
      color: inherit !important;
      padding: 0 4px !important;
    }

    /* SVG burger icon toggle */
    #${htmlAnchor}.gh-head .gh-burger::before,
    #${htmlAnchor}.gh-head .gh-burger::after {
      display: none !important;
    }
    .gh-head-open #${htmlAnchor}.gh-head .gh-burger .burger-icon {
      display: none !important;
    }
    .gh-head-open #${htmlAnchor}.gh-head .gh-burger .close-icon {
      display: block !important;
    }
  }

  /* Dark mode overrides (placed at the end to ensure they win over previous styles) */
  html.dark #${htmlAnchor}.gh-head,
  html.dark #${htmlAnchor}.gh-head.gh-head-open,
  html.dark .gh-head-open #${htmlAnchor}.gh-head {
    background-color: var(--color-bg) !important;
    color: var(--color-fg) !important;
  }

  /* Ensure all header text, branding, and links cleanly adapt to white in dark mode */
  html.dark #${htmlAnchor}.gh-head .gh-head-brand,
  html.dark #${htmlAnchor}.gh-head .gh-head-brand a,
  html.dark #${htmlAnchor}.gh-head .gh-site-title,
  html.dark #${htmlAnchor}.gh-head .gh-head-menu a,
  html.dark #${htmlAnchor}.gh-head .gh-head-menu .nav a,
  html.dark #${htmlAnchor}.gh-head .gh-head-link,
  html.dark #${htmlAnchor}.gh-head .gh-signout,
  html.dark #${htmlAnchor}.gh-head .gh-search-btn,
  html.dark #${htmlAnchor}.gh-head .gh-theme-toggle,
  html.dark .gh-head-open #${htmlAnchor}.gh-head .nav a {
    color: #ffffff !important;
  }

  /* Ensure the hamburger and action icons are fully visible in dark mode */
  html.dark #${htmlAnchor} .gh-burger,
  html.dark #${htmlAnchor}.gh-head .gh-burger,
  html.dark .gh-head-open #${htmlAnchor} .gh-burger,
  html.dark .gh-head-open #${htmlAnchor}.gh-head .gh-burger {
    color: #ffffff !important;
  }
  html.dark #${htmlAnchor} .gh-burger svg,
  html.dark #${htmlAnchor}.gh-head .gh-burger svg,
  html.dark .gh-head-open #${htmlAnchor} .gh-burger svg,
  html.dark .gh-head-open #${htmlAnchor}.gh-head .gh-burger svg,
  html.dark #${htmlAnchor} .gh-search-btn svg,
  html.dark #${htmlAnchor}.gh-head .gh-search-btn svg,
  html.dark #${htmlAnchor} .gh-theme-toggle svg,
  html.dark #${htmlAnchor}.gh-head .gh-theme-toggle svg {
    stroke: #ffffff !important;
    color: #ffffff !important;
  }

  /* gh-head-actions is strictly transparent in desktop & mobile overlays (no black box) */
  #${htmlAnchor} .gh-head-actions,
  #${htmlAnchor}.gh-head .gh-head-actions,
  html.dark #${htmlAnchor}.gh-head .gh-head-actions,
  html.dark #${htmlAnchor} .gh-head-actions,
  .gh-head-open #${htmlAnchor}.gh-head .gh-head-actions,
  html.dark .gh-head-open #${htmlAnchor}.gh-head .gh-head-actions {
    background: transparent !important;
    background-color: transparent !important;
  }
  
  html.dark #${htmlAnchor}.gh-head .gh-head-btn {
    background-color: var(--color-primary) !important;
    color: var(--color-on-primary) !important;
  }

  /* Dark mode logo toggle */
  .gh-logo-dark { display: none; }
  html.dark .gh-logo-light { display: none; }
  html.dark .gh-logo-dark { display: inline-block; }

  html.dark #${htmlAnchor}.gh-head .icon-moon { display: none !important; }
  html.dark #${htmlAnchor}.gh-head .icon-sun { display: block !important; }
  html:not(.dark) #${htmlAnchor}.gh-head .icon-sun { display: none !important; }
  html:not(.dark) #${htmlAnchor}.gh-head .icon-moon { display: block !important; }

</style>

<div class="gh-head-wrapper" style="width: 100%; padding: 0; background-color: transparent; position: relative; z-index: 9999; overflow: visible;">
  <header 
    id="${htmlAnchor}" 
    class="gh-head section-width-${appearance.sectionWidth || 'full'} ${styles.backgroundType === "mesh" ? 'mesh-glow' : ''}"
    style="
      position: relative;
      z-index: 9999;
      ${inlineBgCss}
      color: ${palette.text};
      width: 100%;
      ${isSectionFull ? "" : `max-width: ${sectionMaxWidth}; margin-left: auto; margin-right: auto; border-radius: 12px;`}
      margin-bottom: ${styles.marginBottom || '0px'};
      box-shadow: ${shadowValue};
      opacity: ${styles.opacity ?? 1};
      ${glassEnabled ? `backdrop-filter: blur(${styles.backdropBlur || '12px'}); -webkit-backdrop-filter: blur(${styles.backdropBlur || '12px'});` : ""}
      transition: all 0.15s ease-in-out;
      overflow: visible;
    "
  >
    <div class="gh-head-inner content-width-${appearance.contentWidth || 'wide'}" style="width: 100%; max-width: ${contentMaxWidth}; margin-left: auto; margin-right: auto; overflow: visible;">
      ${brandHtml}
      ${navHtml}
      ${actionsHtml}
    </div>
  </header>
</div>

<script>
(function() {
  function initBurger() {
    const head = document.getElementById('${htmlAnchor}') || document.querySelector('.gh-head');
    const burger = head ? head.querySelector('.gh-burger') : null;
    
    if (!head || !burger) return;
    if (burger.dataset.bound) return;
    burger.dataset.bound = "true";

    function toggleMenu(e) {
      e.stopPropagation();
      head.classList.toggle('gh-head-open');
      document.body.classList.toggle('gh-head-open');
      
      const burgerIcon = burger.querySelector('.burger-icon');
      const closeIcon = burger.querySelector('.close-icon');
      if (burgerIcon && closeIcon) {
        const open = head.classList.contains('gh-head-open');
        burgerIcon.style.display = open ? 'none' : 'block';
        closeIcon.style.display = open ? 'block' : 'none';
      }
    }

    burger.addEventListener('click', toggleMenu);
    
    document.addEventListener('click', function(e) {
      if (head.classList.contains('gh-head-open')) {
        const isClickInside = head.contains(e.target);
        if (!isClickInside) {
          head.classList.remove('gh-head-open');
          document.body.classList.remove('gh-head-open');
          
          const burgerIcon = burger.querySelector('.burger-icon');
          const closeIcon = burger.querySelector('.close-icon');
          if (burgerIcon && closeIcon) {
            burgerIcon.style.display = 'block';
            closeIcon.style.display = 'none';
          }
        }
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && head.classList.contains('gh-head-open')) {
        head.classList.remove('gh-head-open');
        document.body.classList.remove('gh-head-open');
        const burgerIcon = burger.querySelector('.burger-icon');
        const closeIcon = burger.querySelector('.close-icon');
        if (burgerIcon && closeIcon) {
          burgerIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      }
    });
  }

  initBurger();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBurger);
  }
  window.addEventListener('pageshow', initBurger);
})();

function syncCommentsTheme(isDark) {
  try {
    var fgColor = isDark ? '#ffffff' : '#171717';
    var scheme = isDark ? 'dark' : 'light';

    var sec = document.querySelector('.gh-comments-section');
    if (sec) {
      sec.style.color = fgColor;
      sec.style.colorScheme = scheme;
      sec.style.backgroundColor = 'transparent';
      sec.classList.toggle('dark', isDark);
    }
    var root = document.getElementById('ghost-comments-root') || (sec && sec.querySelector('#ghost-comments-root'));
    if (root) {
      root.style.color = fgColor;
      root.style.colorScheme = scheme;
      root.style.backgroundColor = 'transparent';
      root.classList.toggle('dark', isDark);
    }
    var script = document.querySelector('script[data-ghost-comments]');
    if (script) {
      script.dataset.colorScheme = scheme;
    }
    var iframes = document.querySelectorAll('.gh-comments-section iframe, #ghost-comments-root iframe, iframe[title="comments-frame"], iframe[data-frame="comments"]');
    iframes.forEach(function(iframe) {
      iframe.setAttribute('allowtransparency', 'true');
      iframe.style.background = 'transparent';
      iframe.style.backgroundColor = 'transparent';
      iframe.style.colorScheme = scheme;
      try {
        if (iframe.contentDocument) {
          if (iframe.contentDocument.documentElement) {
            iframe.contentDocument.documentElement.classList.toggle('dark', isDark);
            iframe.contentDocument.documentElement.style.colorScheme = scheme;
            iframe.contentDocument.documentElement.style.backgroundColor = 'transparent';
          }
          if (iframe.contentDocument.body) {
            iframe.contentDocument.body.classList.toggle('dark', isDark);
            iframe.contentDocument.body.style.backgroundColor = 'transparent';
            iframe.contentDocument.body.style.colorScheme = scheme;
          }
        }
      } catch (e) {}
      try {
        if (iframe.contentWindow) {
          var msg = { theme: scheme, colorScheme: scheme, mode: scheme, isDark: isDark };
          iframe.contentWindow.postMessage(msg, '*');
          iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        }
      } catch (e) {}
    });
  } catch (e) {}
}

function toggleThemeMode() {
  var isDark = document.documentElement.classList.toggle('dark');
  if (isDark) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  syncCommentsTheme(isDark);
}

(function initTheme() {
  var savedTheme = localStorage.getItem('theme');
  var isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { syncCommentsTheme(isDark); });
  } else {
    syncCommentsTheme(isDark);
  }
})();

// ===== Navigation Dropdown Enhancer =====
// Transforms Ghost Admin flat nav items into nested dropdown menus.
// Items whose label starts with the configured prefix are grouped
// as children of the preceding parent item.
(function initDropdownNav() {
  var DROPDOWN_PREFIX = ${JSON.stringify(general.dropdownPrefix || "-")};

  function startsWithPrefix(text, prefix) {
    if (!prefix || !text) return false;
    var t = text.replace(/\u00a0/g, ' ').trim();
    var p = prefix.replace(/\u00a0/g, ' ').trim();
    if (t.indexOf(p) === 0) return true;
    if ((p === '-' || p === '--') && (t.indexOf('–') === 0 || t.indexOf('—') === 0 || t.indexOf('-') === 0)) {
      return true;
    }
    return false;
  }

  function stripPrefix(text, prefix) {
    var t = text.replace(/\u00a0/g, ' ').trim();
    var p = prefix.replace(/\u00a0/g, ' ').trim();
    if (t.indexOf(p) === 0) {
      return t.substring(p.length).replace(/^[\s\u00a0]+/, '').trim();
    }
    if ((p === '-' || p === '--') && (t.indexOf('–') === 0 || t.indexOf('—') === 0 || t.indexOf('-') === 0)) {
      return t.substring(1).replace(/^[\s\u00a0]+/, '').trim();
    }
    return t;
  }

  function enhance() {
    var head = document.getElementById('${htmlAnchor}') || document.querySelector('.gh-head');
    if (!head) return;
    var navList = head.querySelector('.gh-head-menu .nav') || head.querySelector('.gh-head-menu ul') || head.querySelector('.nav') || head.querySelector('ul[role="menu"]');
    if (!navList) return;

    var items = Array.prototype.slice.call(navList.children);
    var i = 0;

    while (i < items.length) {
      var li = items[i];
      if (li.classList.contains('nav-dropdown-parent')) {
        i++;
        continue;
      }
      var link = li.querySelector('a');
      if (!link) { i++; continue; }

      // Collect consecutive prefixed siblings as children
      var children = [];
      var j = i + 1;
      while (j < items.length) {
        var childLi = items[j];
        var childLink = childLi.querySelector('a');
        if (!childLink) break;
        var label = (childLink.textContent || '').trim();
        if (!startsWithPrefix(label, DROPDOWN_PREFIX)) break;
        // Strip prefix from label
        childLink.textContent = stripPrefix(label, DROPDOWN_PREFIX);
        children.push(childLi);
        j++;
      }

      if (children.length === 0) { i++; continue; }

      // Wrap the parent li
      li.classList.add('nav-dropdown-parent');

      // Add chevron to parent link if not present
      if (!link.querySelector('.nav-dropdown-chevron')) {
        var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'nav-dropdown-chevron');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2.5');
        chevron.setAttribute('stroke-linecap', 'round');
        chevron.setAttribute('stroke-linejoin', 'round');
        var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', '6 9 12 15 18 9');
        chevron.appendChild(polyline);
        link.appendChild(chevron);
      }

      // Desktop: create floating dropdown card
      var card = document.createElement('div');
      card.className = 'nav-dropdown-card';
      var inner = document.createElement('div');
      inner.className = 'nav-dropdown-inner';

      // Mobile: create accordion container
      var accordion = document.createElement('div');
      accordion.className = 'nav-accordion';

      for (var k = 0; k < children.length; k++) {
        var childLinkEl = children[k].querySelector('a');
        if (childLinkEl) {
          var desktopLink = childLinkEl.cloneNode(true);
          desktopLink.className = 'nav-dropdown-link';
          inner.appendChild(desktopLink);
          var mobileLink = childLinkEl.cloneNode(true);
          mobileLink.className = 'nav-accordion-link';
          accordion.appendChild(mobileLink);
        }
        if (children[k].parentNode) {
          children[k].parentNode.removeChild(children[k]);
        }
      }

      card.appendChild(inner);
      li.appendChild(card);
      li.appendChild(accordion);

      // Tap / Click handlers:
      (function(parentLi, acc) {
        var pLink = parentLi.querySelector('a');
        if (!pLink) return;

        pLink.addEventListener('click', function(e) {
          if (window.innerWidth < 768) {
            e.preventDefault();
            e.stopPropagation();
            acc.classList.toggle('is-open');
            parentLi.classList.toggle('is-open');
          } else {
            var href = pLink.getAttribute('href');
            if (!href || href === '#' || href === 'javascript:' || href === 'javascript:void(0)') {
              e.preventDefault();
              parentLi.classList.toggle('is-open');
            }
          }
        });
      })(li, accordion);

      items = Array.prototype.slice.call(navList.children);
      i++;
    }

    if (!window.__gh_dropdown_click_bound) {
      window.__gh_dropdown_click_bound = true;
      document.addEventListener('click', function(e) {
        if (window.innerWidth >= 768) {
          var openParents = document.querySelectorAll('.nav-dropdown-parent.is-open');
          for (var p = 0; p < openParents.length; p++) {
            if (!openParents[p].contains(e.target)) {
              openParents[p].classList.remove('is-open');
            }
          }
        }
      });
    }
  }

  // 1. Run immediately since header HTML is already in DOM right above this script
  enhance();

  // 2. Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  }

  // 3. Run on page transitions / browser back-forward cache (BFCache)
  window.addEventListener('pageshow', enhance);
  window.addEventListener('popstate', enhance);

  // 4. Short retries to catch any dynamic render
  setTimeout(enhance, 50);
  setTimeout(enhance, 250);

  // 5. MutationObserver to automatically group items if nav is dynamically inserted/updated
  var head = document.getElementById('${htmlAnchor}') || document.querySelector('.gh-head');
  if (typeof MutationObserver !== 'undefined' && head) {
    var observer = new MutationObserver(function() {
      enhance();
    });
    observer.observe(head, { childList: true, subtree: true });
  }
})();
</script>`;
};