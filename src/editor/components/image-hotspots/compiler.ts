import { BuilderBlock } from "@/types/theme";
import {
  ImageHotspotsProps,
  resolveImageHotspotsProps,
  HotspotContentWidth,
  HotspotAspectRatio,
  HotspotBorderRadius,
} from "./schema";
import { escapeHtml, escapeUrl } from "../shared/escape";

const WIDTH_MAX_STYLES: Record<HotspotContentWidth, string> = {
  narrow: "max-width: 42rem;", // 672px
  standard: "max-width: 56rem;", // 896px
  wide: "max-width: 72rem;", // 1152px
  full: "max-width: 100%;",
};

const ASPECT_RATIO_STYLES: Record<HotspotAspectRatio, string> = {
  "16/9": "aspect-ratio: 16 / 9;",
  "4/3": "aspect-ratio: 4 / 3;",
  "3/2": "aspect-ratio: 3 / 2;",
  "1/1": "aspect-ratio: 1 / 1;",
  "21/9": "aspect-ratio: 21 / 9;",
  auto: "",
};

const BORDER_RADIUS_STYLES: Record<HotspotBorderRadius, string> = {
  "rounded-none": "border-radius: 0px;",
  "rounded-sm": "border-radius: 4px;",
  "rounded-md": "border-radius: 6px;",
  "rounded-lg": "border-radius: 8px;",
  "rounded-xl": "border-radius: 12px;",
  "rounded-2xl": "border-radius: 16px;",
};

/**
 * Validates a CSS color value.
 */
function validateCssColor(val: unknown, defaultValue: string): string {
  if (typeof val !== "string") return defaultValue;
  const str = val.trim();
  if (!str) return defaultValue;

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(str)) {
    return str;
  }
  if (/^(rgb|rgba|hsl|hsla)\(\s*[\d.%\s,/+-]+\s*\)$/i.test(str)) {
    return str;
  }
  if (/^[a-zA-Z]{3,20}$/.test(str)) {
    return str;
  }

  return defaultValue;
}

export const compileToHbs = (block: BuilderBlock): string => {
  const p: ImageHotspotsProps = resolveImageHotspotsProps(block.props);

  const rawBlockId = String(block.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const internalId = rawBlockId.startsWith("gh-hotspots-")
    ? rawBlockId
    : `gh-hotspots-${rawBlockId || Math.random().toString(36).substring(2, 9)}`;

  const resolveHbsSrc = (src: string): string => {
    if (src && src.startsWith("asset://")) {
      const path = src.replace("asset://", "");
      return `{{asset "${path}"}}`;
    }
    return src ? escapeUrl(src) : "";
  };

  const imageSrc = resolveHbsSrc(p.content.image);
  const widthStyle = WIDTH_MAX_STYLES[p.layout.contentWidth] || "max-width: 56rem;";
  const aspectStyle = ASPECT_RATIO_STYLES[p.layout.aspectRatio];
  const radiusStyle = BORDER_RADIUS_STYLES[p.layout.borderRadius] || "border-radius: 12px;";
  const customHeightStyle = p.layout.aspectRatio === "auto" && p.layout.customHeight
    ? `min-height: ${escapeHtml(p.layout.customHeight)};`
    : "min-height: 260px;";

  const markerColor = validateCssColor(p.marker.color, "#0070f3");
  const isDarkTooltip = p.tooltip.theme !== "light";

  const rawAnchor = typeof p.advanced?.htmlAnchor === "string" ? p.advanced.htmlAnchor.trim() : "";
  const cleanAnchor = rawAnchor.replace(/^#+/, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeAnchor = cleanAnchor ? escapeHtml(cleanAnchor) : null;
  const ariaLabel = escapeHtml(p.advanced?.ariaLabel || "Interactive image with feature hotspots");

  // Render hotspot pins
  const pinsMarkup = p.hotspots
    .map((spot, idx) => {
      const spotId = escapeHtml(spot.id || `spot-${idx + 1}`);
      const title = escapeHtml(spot.title);
      const x = Math.max(0, Math.min(100, spot.x));
      const y = Math.max(0, Math.min(100, spot.y));
      const cardId = `${internalId}-${spotId}-card`;
      const pinId = `${internalId}-${spotId}-pin`;

      let iconInner = `<div class="gh-hotspot-dot"></div>`;
      if (p.marker.icon === "plus") {
        iconInner = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
      } else if (p.marker.icon === "number") {
        iconInner = `<span class="gh-hotspot-num">${idx + 1}</span>`;
      }

      return `      <div class="gh-hotspot-item" style="left: ${x}%; top: ${y}%;">
        ${p.marker.pulse ? `<span class="gh-hotspot-pulse" style="background-color: ${markerColor};" aria-hidden="true"></span>` : ""}
        <button
          type="button"
          id="${pinId}"
          class="gh-hotspot-pin"
          role="button"
          aria-expanded="false"
          aria-controls="${cardId}"
          data-target="${cardId}"
          aria-label="${title}"
          style="background-color: ${markerColor};"
        >
          ${iconInner}
        </button>
      </div>`;
    })
    .join("\n");

  // Render hotspot popups
  const popupsMarkup = p.hotspots
    .map((spot, idx) => {
      const spotId = escapeHtml(spot.id || `spot-${idx + 1}`);
      const title = escapeHtml(spot.title);
      const desc = escapeHtml(spot.description);
      const x = Math.max(0, Math.min(100, spot.x));
      const y = Math.max(0, Math.min(100, spot.y));
      const cardId = `${internalId}-${spotId}-card`;
      const pinId = `${internalId}-${spotId}-pin`;
      const isBottomHalf = y > 50;
      const posClass = isBottomHalf ? "pos-bottom-half" : "pos-top-half";

      const leftStyle = `left: clamp(12px, calc(${x}% - 140px), calc(100% - 292px));`;
      const vertStyle = isBottomHalf
        ? `bottom: calc(${100 - y}% + 18px); top: auto; max-height: calc(${y}% - 22px);`
        : `top: calc(${y}% + 18px); bottom: auto; max-height: calc(100% - ${y}% - 22px);`;

      return `      <div
        id="${cardId}"
        class="gh-hotspot-popup ${isDarkTooltip ? "theme-dark" : "theme-light"} ${posClass}"
        role="dialog"
        aria-modal="false"
        aria-label="${title}"
        data-pin-id="${pinId}"
        style="${leftStyle} ${vertStyle}"
      >
        <div class="gh-hotspot-popup-header">
          <span class="gh-hotspot-popup-title">${title}</span>
          <button type="button" class="gh-hotspot-close" aria-label="Close details" data-target="${cardId}">&times;</button>
        </div>
        ${desc ? `<div class="gh-hotspot-popup-body"><p>${desc}</p></div>` : ""}
        ${
          spot.linkUrl
            ? `<div class="gh-hotspot-popup-footer">
          <a
            href="${escapeUrl(spot.linkUrl)}"
            class="gh-hotspot-link"
            ${spot.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ""}
          >
            <span>${escapeHtml(spot.linkLabel || "Learn more")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>`
            : ""
        }
      </div>`;
    })
    .join("\n");

  const sidePadding = (block.styles?.paddingLeft as string) || p.layout.paddingX || "24px";

  return `
<section id="${internalId}" class="gh-hotspots-section" aria-label="${ariaLabel}">
  ${safeAnchor ? `<div id="${safeAnchor}" class="gh-hotspots-anchor" style="position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none;" aria-hidden="true"></div>` : ""}
  <div class="gh-hotspots-wrapper" style="width: 100%; margin: 0 auto; ${widthStyle} padding-left: ${escapeHtml(sidePadding)}; padding-right: ${escapeHtml(sidePadding)}; box-sizing: border-box;">
    ${
      p.content.heading || p.content.description
        ? `<div class="gh-hotspots-header" style="text-align: center; margin-bottom: 24px;">
      ${p.content.heading ? `<h2 class="gh-hotspots-heading" style="font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em; color: inherit;">${escapeHtml(p.content.heading)}</h2>` : ""}
      ${p.content.description ? `<p class="gh-hotspots-description" style="font-size: 1rem; line-height: 1.5; margin: 0; opacity: 0.8; color: inherit;">${escapeHtml(p.content.description)}</p>` : ""}
    </div>`
        : ""
    }

    <div class="gh-hotspots-frame" style="position: relative; width: 100%; ${aspectStyle} ${radiusStyle} ${customHeightStyle}">
      ${
        imageSrc
          ? `<img src="${imageSrc}" alt="${escapeHtml(p.content.alt || "Interactive Hotspots Image")}" loading="lazy" class="gh-hotspots-img" />`
          : `<div class="gh-hotspots-placeholder">No image configured</div>`
      }

      <!-- Hotspot Markers and Popups Layer -->
      <div class="gh-hotspots-layer">
        ${pinsMarkup}
        ${popupsMarkup}
      </div>
    </div>
  </div>

  <style>
    #${internalId} {
      width: 100%;
      position: relative;
      font-family: inherit;
    }
    #${internalId} .gh-hotspots-frame {
      overflow: hidden;
      background-color: #f4f4f5;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }
    #${internalId} .gh-hotspots-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }
    #${internalId} .gh-hotspots-placeholder {
      width: 100%;
      height: 100%;
      min-height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      color: #9ca3af;
      font-size: 14px;
    }
    #${internalId} .gh-hotspots-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    #${internalId} .gh-hotspot-item {
      position: absolute;
      transform: translate(-50%, -50%);
      z-index: 20;
      pointer-events: auto;
    }
    #${internalId} .gh-hotspot-item.is-active {
      z-index: 40;
    }
    #${internalId} .gh-hotspot-pulse {
      position: absolute;
      inset: -6px;
      border-radius: 9999px;
      opacity: 0.6;
      animation: gh-hotspot-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      pointer-events: none;
    }
    @keyframes gh-hotspot-ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    #${internalId} .gh-hotspot-pin {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      border: 2px solid #ffffff;
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      touch-action: manipulation;
      padding: 0;
      outline: none;
    }
    #${internalId} .gh-hotspot-pin:hover {
      transform: scale(1.15);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    }
    #${internalId} .gh-hotspot-pin:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 3px;
    }
    #${internalId} .gh-hotspot-item.is-active .gh-hotspot-pin {
      transform: scale(1.12);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
    }
    #${internalId} .gh-hotspot-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background-color: #ffffff;
    }
    #${internalId} .gh-hotspot-num {
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
    }
    #${internalId} .gh-hotspot-popup {
      position: absolute;
      width: min(280px, calc(100% - 24px));
      max-width: calc(100% - 24px);
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.3), 0 6px 16px rgba(0, 0, 0, 0.2);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
      z-index: 50;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-wrap: break-word;
      overflow-y: auto;
    }
    #${internalId} .gh-hotspot-popup.is-active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    #${internalId} .gh-hotspot-popup.theme-dark {
      background: rgba(15, 15, 15, 0.96);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-popup-title {
      color: #ffffff;
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-popup-body {
      color: #d4d4d8;
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-link {
      background: #2563eb;
      color: #ffffff;
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-link:hover {
      background: #1d4ed8;
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-popup-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-close {
      color: #a1a1aa;
    }
    #${internalId} .gh-hotspot-popup.theme-dark .gh-hotspot-close:hover {
      color: #ffffff;
    }

    #${internalId} .gh-hotspot-popup.theme-light {
      background: rgba(255, 255, 255, 0.98);
      color: #0f172a;
      border: 1px solid rgba(0, 0, 0, 0.12);
      box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-popup-title {
      color: #0f172a;
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-popup-body {
      color: #334155;
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-link {
      background: #0f172a;
      color: #ffffff;
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-link:hover {
      background: #1e293b;
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-popup-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-close {
      color: #64748b;
    }
    #${internalId} .gh-hotspot-popup.theme-light .gh-hotspot-close:hover {
      color: #0f172a;
    }

    #${internalId} .gh-hotspot-popup-footer {
      margin-top: 10px;
      padding-top: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    #${internalId} .gh-hotspot-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-decoration: none;
      transition: background-color 0.15s ease, transform 0.15s ease;
      line-height: 1.2;
    }
    #${internalId} .gh-hotspot-link:hover {
      transform: translateY(-1px);
    }
    #${internalId} .gh-hotspot-link svg {
      transition: transform 0.15s ease;
    }
    #${internalId} .gh-hotspot-link:hover svg {
      transform: translateX(2px);
    }
    #${internalId} .gh-hotspot-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }
    #${internalId} .gh-hotspot-popup-title {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.3;
    }
    #${internalId} .gh-hotspot-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.6;
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
      cursor: pointer;
      border-radius: 4px;
    }
    #${internalId} .gh-hotspot-close:hover {
      opacity: 1;
    }
    #${internalId} .gh-hotspot-popup-body {
      font-size: 12px;
      line-height: 1.5;
      opacity: 0.85;
    }
    #${internalId} .gh-hotspot-popup-body p {
      margin: 0;
    }
    @media (max-width: 640px) {
      #${internalId} .gh-hotspot-popup {
        left: 12px !important;
        right: 12px !important;
        width: auto !important;
        max-width: calc(100% - 24px) !important;
        max-height: calc(100% - 24px) !important;
        overflow-y: auto !important;
      }
      #${internalId} .gh-hotspot-popup.pos-top-half {
        bottom: 12px !important;
        top: auto !important;
      }
      #${internalId} .gh-hotspot-popup.pos-bottom-half {
        top: 12px !important;
        bottom: auto !important;
      }
    }
  </style>

  <script>
    (function() {
      var root = document.getElementById('${internalId}');
      if (!root) return;

      var pins = root.querySelectorAll('.gh-hotspot-pin');
      var popups = root.querySelectorAll('.gh-hotspot-popup');
      if (!pins || pins.length === 0) return;

      function closeAll() {
        pins.forEach(function(pin) {
          pin.setAttribute('aria-expanded', 'false');
          var item = pin.closest('.gh-hotspot-item');
          if (item) item.classList.remove('is-active');
        });
        popups.forEach(function(popup) {
          popup.classList.remove('is-active');
        });
      }

      pins.forEach(function(pin) {
        pin.addEventListener('click', function(e) {
          e.stopPropagation();
          var targetId = pin.getAttribute('data-target');
          var popup = root.querySelector('#' + targetId);
          var isExpanded = pin.getAttribute('aria-expanded') === 'true';

          closeAll();

          if (!isExpanded && popup) {
            pin.setAttribute('aria-expanded', 'true');
            var item = pin.closest('.gh-hotspot-item');
            if (item) item.classList.add('is-active');
            popup.classList.add('is-active');
          }
        });
      });

      var closeBtns = root.querySelectorAll('.gh-hotspot-close');
      closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var targetId = btn.getAttribute('data-target');
          var popup = root.querySelector('#' + targetId);
          if (popup) {
            popup.classList.remove('is-active');
            var pinId = popup.getAttribute('data-pin-id');
            var pin = root.querySelector('#' + pinId);
            if (pin) {
              pin.setAttribute('aria-expanded', 'false');
              var item = pin.closest('.gh-hotspot-item');
              if (item) item.classList.remove('is-active');
              pin.focus();
            }
          }
        });
      });

      // Close on clicking outside
      document.addEventListener('click', function(e) {
        if (!root.contains(e.target)) {
          closeAll();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
          closeAll();
        }
      });
    })();
  </script>
</section>
`;
};
