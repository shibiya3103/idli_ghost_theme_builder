import { BuilderBlock } from "@/types/theme";
import { LogoCloudProps, resolveLogoCloudProps, GENERIC_SVG_PLACEHOLDER } from "./schema";
import { getBackgroundCSS } from "../shared/background";
import { LOGO_CLOUD_MAX_WIDTH } from "./constants";
import { escapeHtml, escapeUrl } from "../shared/escape";

export const generateHTML = (block: BuilderBlock): string => {
  const p: LogoCloudProps = resolveLogoCloudProps(block.props);
  const general = p.general;
  const logos = p.logos || [];
  const appearance = p.appearance;
  const spacing = p.spacing;
  const styles = block.styles || {};
  
  const cleanStyles = { ...styles };
  delete cleanStyles.backdropBlur;
  delete cleanStyles.boxShadow;
  const bgCss = getBackgroundCSS(cleanStyles, appearance);
  const wrapperId = p.advanced?.htmlAnchor || `logo-cloud-${block.id}`;
  
  const grayscaleClass = general.grayscale 
    ? "grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100" 
    : "transition-all duration-300 opacity-80 hover:opacity-100";

  const logoHeight = general.logoHeight || 36;
  const maxLogoWidth = Math.round(logoHeight * 4.5);
  const enableLinks = general.enableLinks !== false;
  const openInNewTab = general.openInNewTab !== false;
  const targetAttr = openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';

  const normalizeUrl = (url?: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^(https?:[/][/]|[/][/]|mailto:|tel:|#)/i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const renderLogo = (logo: { id: string; name: string; imageUrl?: string; linkUrl?: string }) => {
    let src = logo.imageUrl?.trim();
    if (src && src.startsWith("asset://")) {
      const path = src.replace("asset://", "");
      src = `{{asset "${path}"}}`;
    } else if (src) {
      src = escapeUrl(src);
    }
    const finalSrc = src || GENERIC_SVG_PLACEHOLDER;

    const logoName = escapeHtml(logo.name || 'Logo');
    const isLinked = enableLinks && !!logo.linkUrl;
    const finalUrl = isLinked ? escapeUrl(normalizeUrl(logo.linkUrl)) : "";
    const inner = isLinked
      ? `<a href="${finalUrl}" ${targetAttr} class="logo-cloud-link" title="${logoName}"><img src="${finalSrc}" alt="${logoName}" class="logo-cloud-img" /></a>`
      : `<img src="${finalSrc}" alt="${logoName}" class="logo-cloud-img" />`;
    return `<div class="logo-cloud-item ${grayscaleClass}">${inner}</div>`;
  };

  let contentHtml = "";
  const isExcerptSource = general.dynamicLinkSource !== "post";

  if (general.dataSource === "dynamic") {
    const limit = general.dynamicLimit === "all" ? 100 : (general.dynamicLimit || 10);
    const tag = general.dynamicTag || "hash-partner-logo";
    const dynamicLinkField = isExcerptSource ? "custom_excerpt" : "url";
    
    const ghostLoop = `
      {{#foreach posts}}
        {{#if feature_image}}
          <div class="logo-cloud-item ${grayscaleClass}">
            ${enableLinks ? `
              {{#if ${dynamicLinkField}}}
                <a href="{{${dynamicLinkField}}}" ${targetAttr} class="logo-cloud-link" ${isExcerptSource ? 'data-link-source="excerpt"' : 'data-link-source="post"'} title="{{title}}"><img src="{{feature_image}}" alt="{{title}}" class="logo-cloud-img" /></a>
              {{else}}
                <img src="{{feature_image}}" alt="{{title}}" class="logo-cloud-img" />
              {{/if}}
            ` : `
              <img src="{{feature_image}}" alt="{{title}}" class="logo-cloud-img" />
            `}
          </div>
        {{/if}}
      {{/foreach}}
    `;

    if (general.layoutStyle === "marquee") {
      contentHtml = `
        <div class="logo-cloud-marquee-wrapper mask-edges">
          <div class="logo-cloud-marquee-track">
            {{#get "posts" filter="tags:${tag}" limit="${limit}"}}
              ${ghostLoop}
              ${ghostLoop}
            {{/get}}
          </div>
        </div>
      `;
    } else if (general.layoutStyle === "grid") {
      contentHtml = `
        {{#get "posts" filter="tags:${tag}" limit="${limit}"}}
          <div class="logo-cloud-grid" style="--logo-cloud-cols: ${general.columns}; grid-template-columns: repeat(var(--logo-cloud-cols), minmax(0, 1fr));">
            ${ghostLoop}
          </div>
        {{/get}}
      `;
    } else {
      contentHtml = `
        <div class="logo-cloud-row-wrapper">
          <div class="logo-cloud-row">
            {{#get "posts" filter="tags:${tag}" limit="${limit}"}}
              ${ghostLoop}
            {{/get}}
          </div>
        </div>
      `;
    }
  } else {
    // Static layout rendering
    if (general.layoutStyle === "marquee") {
      const baseList = logos.length > 0
        ? logos.length < 6
          ? [...logos, ...logos, ...logos]
          : logos
        : [];
      const marqueeLogos = [...baseList, ...baseList].map(renderLogo).join("");
      contentHtml = `
        <div class="logo-cloud-marquee-wrapper mask-edges">
          <div class="logo-cloud-marquee-track">
            ${marqueeLogos}
          </div>
        </div>
      `;
    } else if (general.layoutStyle === "grid") {
      contentHtml = `
        <div class="logo-cloud-grid" style="--logo-cloud-cols: ${general.columns}; grid-template-columns: repeat(var(--logo-cloud-cols), minmax(0, 1fr));">
          ${logos.map(renderLogo).join("")}
        </div>
      `;
    } else {
      // row layout
      contentHtml = `
        <div class="logo-cloud-row-wrapper">
          <div class="logo-cloud-row">
            ${logos.map(renderLogo).join("")}
          </div>
        </div>
      `;
    }
  }

  const headingHtml = (general.heading || general.subheading) ? `
    <div class="logo-cloud-header">
      ${general.heading ? `<h2 class="logo-cloud-heading">${escapeHtml(general.heading)}</h2>` : ''}
      ${general.subheading ? `<p class="logo-cloud-subheading">${escapeHtml(general.subheading)}</p>` : ''}
    </div>
  ` : '';

  const resolveStyleStr = (val: unknown, fallback: string): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number") return `${val}px`;
    if (typeof val === "object" && val !== null) {
      const resp = val as Record<string, unknown>;
      const resolved = resp.desktop || resp.mobile || resp.tablet;
      if (typeof resolved === "string") return resolved;
      if (typeof resolved === "number") return `${resolved}px`;
    }
    return fallback;
  };

  const pt = resolveStyleStr(spacing?.paddingTop ?? styles?.paddingTop, "40px");
  const pb = resolveStyleStr(spacing?.paddingBottom ?? styles?.paddingBottom, "40px");
  const excerptFixScript = (general.dataSource === "dynamic" && enableLinks && isExcerptSource) ? `
<script>
(function() {
  function normalizeLogoCloudLinks() {
    var wrapper = document.getElementById("${wrapperId}");
    if (!wrapper) return;
    var links = wrapper.querySelectorAll("a.logo-cloud-link[data-link-source='excerpt']");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var raw = (a.getAttribute("href") || "").trim();
      if (raw && !/^(https?:[/][/]|[/][/]|mailto:|tel:|#)/i.test(raw)) {
        a.setAttribute("href", "https://" + raw);
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", normalizeLogoCloudLinks);
  } else {
    normalizeLogoCloudLinks();
  }
  document.addEventListener("click", function(e) {
    var a = e.target && e.target.closest ? e.target.closest("#${wrapperId} a.logo-cloud-link[data-link-source='excerpt']") : null;
    if (a) {
      var raw = (a.getAttribute("href") || "").trim();
      if (raw && !/^(https?:[/][/]|[/][/]|mailto:|tel:|#)/i.test(raw)) {
        a.setAttribute("href", "https://" + raw);
      }
    }
  }, true);
})();
</script>` : '';

  const headingColor = appearance?.headingColor;
  const subheadingColor = appearance?.subheadingColor;

  return `<style>
  #${wrapperId} {
    ${bgCss}
    padding-top: ${pt};
    padding-bottom: ${pb};
    position: relative;
    width: 100%;
  }
  #${wrapperId} .logo-cloud-inner {
    max-width: min(${LOGO_CLOUD_MAX_WIDTH}, 100%);
    margin: 0 auto;
    padding: 0 1rem;
    box-sizing: border-box;
  }
  @media (min-width: 640px) {
    #${wrapperId} .logo-cloud-inner {
      padding: 0 1.5rem;
    }
  }
  #${wrapperId} .logo-cloud-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }
  #${wrapperId} .logo-cloud-heading {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.5;
    color: ${headingColor || "var(--color-fg, #171717)"};
    margin: 0;
  }
  #${wrapperId} .logo-cloud-subheading {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: ${subheadingColor || "var(--color-muted, var(--color-mute, #888888))"};
  }
  #${wrapperId} .logo-cloud-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  #${wrapperId} .logo-cloud-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  #${wrapperId} .logo-cloud-link:hover {
    transform: translateY(-2px);
  }
  #${wrapperId} .logo-cloud-img {
    height: ${logoHeight}px;
    max-height: ${logoHeight}px;
    width: auto;
    max-width: ${maxLogoWidth}px;
    object-fit: contain;
    transition: all 0.3s ease;
  }
  #${wrapperId} .logo-cloud-grid {
    display: grid;
    align-items: center;
    justify-items: center;
    gap: 2rem 1.5rem;
    max-width: 32rem;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
  @media (max-width: 640px) {
    #${wrapperId} .logo-cloud-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 1.5rem 1rem;
    }
  }
  @media (min-width: 641px) and (max-width: 1024px) {
    #${wrapperId} .logo-cloud-grid {
      grid-template-columns: repeat(min(3, var(--logo-cloud-cols, 3)), minmax(0, 1fr)) !important;
    }
  }
  @media (min-width: 768px) {
    #${wrapperId} .logo-cloud-grid {
      max-width: none;
    }
  }

  /* Row layout */
  #${wrapperId} .logo-cloud-row-wrapper {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.5rem 0;
  }
  #${wrapperId} .logo-cloud-row-wrapper::-webkit-scrollbar {
    display: none;
  }
  #${wrapperId} .logo-cloud-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
    min-width: max-content;
    margin: 0 auto;
  }
  @media (min-width: 768px) {
    #${wrapperId} .logo-cloud-row {
      gap: 3.5rem;
    }
  }

  /* Marquee */
  #${wrapperId} .logo-cloud-marquee-wrapper {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    display: flex;
    align-items: center;
    position: relative;
    padding: 0.5rem 0;
  }
  #${wrapperId} .mask-edges {
    mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%);
  }
  #${wrapperId} .logo-cloud-marquee-track {
    display: flex;
    width: max-content;
    align-items: center;
    gap: 3rem;
    padding-right: 3rem;
    animation: marquee-${block.id} 28s linear infinite;
  }
  #${wrapperId} .logo-cloud-marquee-track:hover {
    animation-play-state: paused;
  }
  @keyframes marquee-${block.id} {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }

  /* Dark mode overrides */
  html.dark #${wrapperId} {
    background-color: var(--color-bg) !important;
  }
  ${!headingColor ? `
  html.dark #${wrapperId} .logo-cloud-heading {
    color: var(--color-fg) !important;
  }
  ` : ''}${!subheadingColor ? `
  html.dark #${wrapperId} .logo-cloud-subheading {
    color: var(--color-muted, var(--color-mute, #a3a3a3)) !important;
  }
  ` : ''}
  ${general.invertInDark !== false ? `
  html.dark #${wrapperId} .logo-cloud-item img {
    filter: invert(1) brightness(0.95);
  }
  html.dark #${wrapperId} .logo-cloud-item:hover img {
    filter: invert(1) brightness(1);
  }
  ` : ''}
</style>
<div id="${wrapperId}" class="logo-cloud-section ${styles.backgroundType === 'mesh' ? 'mesh-glow' : ''}">
  <div class="logo-cloud-inner">
    ${headingHtml}
    ${contentHtml}
  </div>
</div>${excerptFixScript}`;
};

export const compileToHbs = generateHTML;
