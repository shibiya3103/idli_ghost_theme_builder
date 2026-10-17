import { BuilderBlock } from "@/types/theme";
import {
  BeforeAfterSliderProps,
  resolveBeforeAfterProps,
  SliderContentWidth,
  SliderAspectRatio,
  SliderBorderRadius,
} from "./schema";
import { escapeHtml, escapeUrl } from "../shared/escape";

const WIDTH_MAX_STYLES: Record<SliderContentWidth, string> = {
  narrow: "max-width: 42rem;", // 672px
  standard: "max-width: 56rem;", // 896px
  wide: "max-width: 72rem;", // 1152px
  full: "max-width: 100%;",
};

const ASPECT_RATIO_STYLES: Record<SliderAspectRatio, string> = {
  "16/9": "aspect-ratio: 16 / 9;",
  "4/3": "aspect-ratio: 4 / 3;",
  "3/2": "aspect-ratio: 3 / 2;",
  "1/1": "aspect-ratio: 1 / 1;",
  "21/9": "aspect-ratio: 21 / 9;",
  auto: "",
};

const BORDER_RADIUS_STYLES: Record<SliderBorderRadius, string> = {
  "rounded-none": "border-radius: 0px;",
  "rounded-sm": "border-radius: 4px;",
  "rounded-md": "border-radius: 6px;",
  "rounded-lg": "border-radius: 8px;",
  "rounded-xl": "border-radius: 12px;",
  "rounded-2xl": "border-radius: 16px;",
};

/**
 * Validates a CSS length/dimension value (e.g. '480px', '2rem', '100%').
 * Accepts numeric values and appends 'px'.
 * Falls back to defaultValue if invalid or unsafe.
 */
function validateCssLength(val: unknown, defaultValue: string): string {
  if (typeof val !== "string" && typeof val !== "number") return defaultValue;
  const str = String(val).trim();
  if (!str) return defaultValue;

  // Pure integer or decimal number -> append px
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return `${str}px`;
  }

  // Common CSS length units: px, rem, em, vh, vw, vmin, vmax, %, ch, pt
  const lengthRegex = /^-?\d+(\.\d+)?(px|rem|em|vh|vw|vmin|vmax|%|ch|pt)$/i;
  if (lengthRegex.test(str)) {
    return str;
  }

  // Safe calc() or clamp() expressions without dangerous characters
  if (/^(calc|clamp|min|max)\([^;{}"'<>]+\)$/i.test(str)) {
    return str;
  }

  return defaultValue;
}

/**
 * Validates a CSS color value.
 * Supports #hex, rgb/rgba, hsl/hsla, and common named colors.
 * Falls back to defaultValue if invalid or unsafe.
 */
function validateCssColor(val: unknown, defaultValue: string): string {
  if (typeof val !== "string") return defaultValue;
  const str = val.trim();
  if (!str) return defaultValue;

  // Hex color (#fff, #ffffff, #ffffff80)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(str)) {
    return str;
  }

  // rgb/rgba or hsl/hsla
  if (/^(rgb|rgba|hsl|hsla)\(\s*[\d.%\s,/+-]+\s*\)$/i.test(str)) {
    return str;
  }

  // Clean named CSS colors (alphanumeric only, e.g. 'white', 'black', 'transparent')
  if (/^[a-zA-Z]{3,20}$/.test(str)) {
    return str;
  }

  return defaultValue;
}

export const compileToHbs = (block: BuilderBlock): string => {
  const p: BeforeAfterSliderProps = resolveBeforeAfterProps(block.props);
  const initialPos = p.slider.initialPosition;

  // Generate safe, guaranteed-unique internal identifier derived from block.id
  const rawBlockId = String(block.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const internalSliderId = rawBlockId.startsWith("ba-slider-")
    ? rawBlockId
    : `ba-slider-${rawBlockId || "block"}`;

  // Safely validate and escape the optional user-defined custom HTML anchor
  const rawAnchor = typeof p.advanced?.htmlAnchor === "string" ? p.advanced.htmlAnchor.trim() : "";
  const cleanAnchor = rawAnchor.replace(/^#+/, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeAnchor = cleanAnchor ? escapeHtml(cleanAnchor) : null;

  const resolveHbsSrc = (src: string): string => {
    if (src && src.startsWith("asset://")) {
      const path = src.replace("asset://", "");
      return `{{asset "${path}"}}`;
    }
    return src ? escapeUrl(src) : "";
  };

  const beforeSrc = resolveHbsSrc(p.content.beforeImage);
  const afterSrc = resolveHbsSrc(p.content.afterImage);

  // Validate dynamic styles and CSS values
  const styles = block.styles || {};
  const pt = validateCssLength(styles.paddingTop, "48px");
  const pb = validateCssLength(styles.paddingBottom, "48px");
  const pl = validateCssLength(styles.paddingLeft, "0px");
  const pr = validateCssLength(styles.paddingRight, "0px");

  const validatedCustomHeight = validateCssLength(p.layout.customHeight, "480px");
  const handleColor = validateCssColor(p.slider.handleColor, "#ffffff");
  const dividerColor = validateCssColor(p.slider.dividerColor, "#ffffff");

  const widthStyle = WIDTH_MAX_STYLES[p.layout.contentWidth] || "max-width: 56rem;";
  const aspectStyle =
    p.layout.aspectRatio === "auto"
      ? `height: ${validatedCustomHeight}; min-height: 260px;`
      : `${ASPECT_RATIO_STYLES[p.layout.aspectRatio]} min-height: 260px;`;
  const radiusStyle = BORDER_RADIUS_STYLES[p.layout.borderRadius] || "border-radius: 12px;";

  const hasBottomCaptions = Boolean(p.content.showAltText && (p.content.beforeAlt || p.content.afterAlt));
  const labelPosStyle = p.labels.position === "top" ? "top: 12px;" : hasBottomCaptions ? "bottom: 44px;" : "bottom: 12px;";

  // Sleek opposing arrows SVG
  const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polyline points="8 17 3 12 8 7"></polyline><polyline points="16 7 21 12 16 17"></polyline></svg>`;
  const barsSvg = `<div style="display: flex; gap: 4px; align-items: center; pointer-events: none;"><span style="width: 2px; height: 16px; background-color: #888; border-radius: 9999px;"></span><span style="width: 2px; height: 16px; background-color: #888; border-radius: 9999px;"></span></div>`;

  return `
<section id="${internalSliderId}" class="ba-slider-section" style="position: relative; width: 100%; box-sizing: border-box; padding-top: ${pt}; padding-bottom: ${pb}; padding-left: ${pl}; padding-right: ${pr};">
  ${safeAnchor ? `<div id="${safeAnchor}" class="ba-slider-anchor" style="position: absolute; top: 0; left: 0; width: 0; height: 0; pointer-events: none;" aria-hidden="true"></div>` : ""}
  <div class="ba-slider-wrapper" style="width: 100%; margin: 0 auto; ${widthStyle} box-sizing: border-box;">
    ${
      p.content.heading || p.content.description
        ? `<div class="ba-slider-header" style="text-align: center; margin-bottom: 24px;">
      ${p.content.heading ? `<h2 class="ba-slider-heading" style="font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.025em; color: inherit;">${escapeHtml(p.content.heading)}</h2>` : ""}
      ${p.content.description ? `<p class="ba-slider-description" style="font-size: 1rem; line-height: 1.5; margin: 0; opacity: 0.8; color: inherit;">${escapeHtml(p.content.description)}</p>` : ""}
    </div>`
        : ""
    }

    <div class="ba-slider-box" style="position: relative; width: 100%; overflow: hidden; user-select: none; -webkit-user-select: none; touch-action: none; cursor: ew-resize; background-color: #f4f4f5; border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); ${aspectStyle} ${radiusStyle}">
      <!-- AFTER (Base) LAYER -->
      <div class="ba-layer-after" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden;">
        ${
          afterSrc
            ? `<img src="${afterSrc}" alt="${escapeHtml(p.content.afterAlt || "After")}" loading="lazy" draggable="false" style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; -webkit-user-select: none; user-select: none;" />`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6; color: #9ca3af; font-size: 14px;">After Image</div>`
        }
        ${
          p.labels.showLabels
            ? `<div class="ba-label ba-label-after" style="position: absolute; right: 12px; ${labelPosStyle} z-index: 10; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.025em; background-color: rgba(0, 0, 0, 0.65); color: #ffffff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); pointer-events: none; transition: opacity 0.15s ease;">${escapeHtml(p.labels.afterLabel || "After")}</div>`
            : ""
        }
        ${
          p.content.showAltText && p.content.afterAlt
            ? `<div class="ba-alt-caption ba-alt-after" style="position: absolute; right: 12px; bottom: 12px; z-index: 10; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; background-color: rgba(0, 0, 0, 0.65); color: #ffffff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); pointer-events: none; transition: opacity 0.15s ease;">${escapeHtml(p.content.afterAlt)}</div>`
            : ""
        }
      </div>

      <!-- BEFORE (Clipped Overlay) LAYER -->
      <div class="ba-layer-before" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; clip-path: inset(0 calc(100% - ${initialPos}%) 0 0); -webkit-clip-path: inset(0 calc(100% - ${initialPos}%) 0 0);">
        ${
          beforeSrc
            ? `<img src="${beforeSrc}" alt="${escapeHtml(p.content.beforeAlt || "Before")}" loading="lazy" draggable="false" style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; -webkit-user-select: none; user-select: none;" />`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #e5e7eb; color: #6b7280; font-size: 14px;">Before Image</div>`
        }
        ${
          p.labels.showLabels
            ? `<div class="ba-label ba-label-before" style="position: absolute; left: 12px; ${labelPosStyle} z-index: 10; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; letter-spacing: 0.025em; background-color: rgba(0, 0, 0, 0.65); color: #ffffff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); pointer-events: none; transition: opacity 0.15s ease;">${escapeHtml(p.labels.beforeLabel || "Before")}</div>`
            : ""
        }
        ${
          p.content.showAltText && p.content.beforeAlt
            ? `<div class="ba-alt-caption ba-alt-before" style="position: absolute; left: 12px; bottom: 12px; z-index: 10; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; background-color: rgba(0, 0, 0, 0.65); color: #ffffff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); pointer-events: none; transition: opacity 0.15s ease;">${escapeHtml(p.content.beforeAlt)}</div>`
            : ""
        }
      </div>

      <!-- DIVIDER LINE -->
      <div class="ba-divider" style="position: absolute; top: 0; bottom: 0; left: ${initialPos}%; width: 2px; background-color: ${dividerColor}; box-shadow: 0 0 8px rgba(0, 0, 0, 0.4); transform: translateX(-50%); pointer-events: none; z-index: 20;"></div>

      <!-- HANDLE -->
      <div class="ba-handle" role="slider" tabindex="0" aria-valuenow="${Math.round(initialPos)}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(p.advanced?.ariaLabel || "Before and after comparison slider")}" style="position: absolute; top: 50%; left: calc(clamp(22px, ${initialPos}%, calc(100% - 22px))); transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 9999px; background-color: ${handleColor}; color: #171717; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; cursor: grab; z-index: 30; touch-action: none; outline: none; border: 2px solid rgba(255, 255, 255, 0.8);">
        ${p.slider.showHandleArrows ? arrowSvg : barsSvg}
      </div>
    </div>
  </div>

  <style>
    #${internalSliderId} .ba-handle:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 3px;
    }
    #${internalSliderId} .ba-handle:active {
      cursor: grabbing;
      transform: translate(-50%, -50%) scale(1.08);
    }
  </style>

  <script>
    (function() {
      var root = document.getElementById('${internalSliderId}');
      if (!root) return;
      var box = root.querySelector('.ba-slider-box');
      var beforeLayer = root.querySelector('.ba-layer-before');
      var divider = root.querySelector('.ba-divider');
      var handle = root.querySelector('.ba-handle');
      var labelBefore = root.querySelector('.ba-label-before');
      var labelAfter = root.querySelector('.ba-label-after');
      var altBefore = root.querySelector('.ba-alt-before');
      var altAfter = root.querySelector('.ba-alt-after');
      if (!box || !beforeLayer || !divider || !handle) return;

      function update(percent) {
        percent = Math.max(0, Math.min(100, Math.round(percent * 10) / 10));
        beforeLayer.style.clipPath = 'inset(0 calc(100% - ' + percent + '%) 0 0)';
        beforeLayer.style.webkitClipPath = 'inset(0 calc(100% - ' + percent + '%) 0 0)';
        divider.style.left = percent + '%';
        handle.style.left = 'calc(clamp(22px, ' + percent + '%, calc(100% - 22px)))';
        handle.setAttribute('aria-valuenow', Math.round(percent));
        if (labelBefore) labelBefore.style.opacity = percent < 5 ? '0' : '1';
        if (labelAfter) labelAfter.style.opacity = percent > 95 ? '0' : '1';
        if (altBefore) altBefore.style.opacity = percent < 5 ? '0' : '1';
        if (altAfter) altAfter.style.opacity = percent > 95 ? '0' : '1';
      }

      var isDragging = false;
      function getPercent(clientX) {
        var rect = box.getBoundingClientRect();
        if (rect.width <= 0) return 50;
        var offsetX = clientX - rect.left;
        return (offsetX / rect.width) * 100;
      }

      function onPointerDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        isDragging = true;
        try {
          box.setPointerCapture(e.pointerId);
        } catch (err) {}
        update(getPercent(e.clientX));
        if (e.cancelable) e.preventDefault();
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        update(getPercent(e.clientX));
        if (e.cancelable) e.preventDefault();
      }

      function onPointerEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        if (e && e.pointerId !== undefined) {
          try {
            if (box.hasPointerCapture && box.hasPointerCapture(e.pointerId)) {
              box.releasePointerCapture(e.pointerId);
            }
          } catch (err) {}
        }
      }

      box.addEventListener('pointerdown', onPointerDown);
      box.addEventListener('pointermove', onPointerMove);
      box.addEventListener('pointerup', onPointerEnd);
      box.addEventListener('pointercancel', onPointerEnd);
      box.addEventListener('lostpointercapture', onPointerEnd);
      box.addEventListener('pointerleave', function(e) {
        try {
          if (!box.hasPointerCapture || !box.hasPointerCapture(e.pointerId)) {
            onPointerEnd(e);
          }
        } catch (err) {
          onPointerEnd(e);
        }
      });

      handle.addEventListener('keydown', function(e) {
        var cur = parseFloat(handle.getAttribute('aria-valuenow') || '${initialPos}');
        var step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          update(cur - step);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          update(cur + step);
          e.preventDefault();
        } else if (e.key === 'Home') {
          update(0);
          e.preventDefault();
        } else if (e.key === 'End') {
          update(100);
          e.preventDefault();
        }
      });
    })();
  </script>
</section>`;
};
