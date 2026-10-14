/* eslint-disable @next/next/no-img-element */
import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import { LogoCloudProps, resolveLogoCloudProps, GENERIC_SVG_PLACEHOLDER } from "./schema";
import { getBackgroundStyle } from "../shared/background";
import { LOGO_CLOUD_MAX_WIDTH } from "./constants";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

export function CanvasElement({ block }: { block: BuilderBlock }) {
  useCanvasDarkMode();
  const p: LogoCloudProps = resolveLogoCloudProps(block.props);
  const assets = useEditorStore((s) => s.document.assets) || {};
  const deviceMode = useEditorStore((s) => s.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";
  const isTablet = deviceMode === "tablet";
  const general = p.general;
  const logos = p.logos || [];
  const appearance = p.appearance;
  const spacing = p.spacing;
  const styles = block.styles || {};

  const resolvedAppearance = {
    ...appearance,
    backgroundColor:
      !appearance?.backgroundColor ||
      appearance.backgroundColor === "var(--color-bg)" ||
      appearance.backgroundColor === "var(--color-canvas)" ||
      appearance.backgroundColor === "#ffffff" ||
      appearance.backgroundColor === "#fafafa"
        ? "var(--color-canvas)"
        : appearance.backgroundColor,
  };

  const cleanStyles = { ...styles };
  delete cleanStyles.backdropBlur;
  delete cleanStyles.boxShadow;
  const bgStyle = getBackgroundStyle(cleanStyles, resolvedAppearance);
  const invertInDark = general.invertInDark !== false;
  const grayscaleClass = general.grayscale 
    ? "grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100" 
    : "transition-all duration-300 opacity-80 hover:opacity-100";
  const darkInvertClass = invertInDark 
    ? "dark-invert dark:invert dark:brightness-95 dark:hover:brightness-100" 
    : "";

  const logoHeight = general.logoHeight || 36;
  const maxLogoWidth = Math.round(logoHeight * 4.5);
  const enableLinks = general.enableLinks !== false;
  const openInNewTab = general.openInNewTab !== false;

  const normalizeUrl = (url?: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^(https?:[/][/]|[/][/]|mailto:|tel:|#)/i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const renderLogo = (logo: { id: string; name: string; imageUrl?: string; linkUrl?: string }, keySuffix?: string | number) => {
    let resolvedUrl = logo.imageUrl?.trim();
    if (resolvedUrl && resolvedUrl.startsWith("asset://")) {
      const path = resolvedUrl.replace("asset://", "");
      resolvedUrl = assets[path] || assets[`assets/${path}`] || resolvedUrl;
    }

    const finalSrc = resolvedUrl || GENERIC_SVG_PLACEHOLDER;
    const key = keySuffix !== undefined ? `${logo.id}-${keySuffix}` : logo.id;
    const isLinked = enableLinks && !!logo.linkUrl;
    const finalLinkUrl = isLinked ? normalizeUrl(logo.linkUrl) : "";

    const imgElement = (
      <img
        src={finalSrc}
        alt={logo.name || "Logo"}
        className={`logo-cloud-img w-auto object-contain transition-all duration-300 ${darkInvertClass} ${isLinked ? "hover:scale-105" : ""}`}
        style={{
          height: `${logoHeight}px`,
          maxHeight: `${logoHeight}px`,
          maxWidth: `${maxLogoWidth}px`,
        }}
      />
    );

    return (
      <div key={key} className={`logo-cloud-item flex items-center justify-center px-4 py-2 transition-all duration-300 shrink-0 ${grayscaleClass} ${isLinked ? "cursor-pointer" : ""}`}>
        {isLinked ? (
          <a
            href={finalLinkUrl}
            target={openInNewTab ? "_blank" : "_self"}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            className="logo-cloud-link block flex items-center justify-center"
            title={`${logo.name || "Logo"}${finalLinkUrl ? ` (${finalLinkUrl})` : ""}`}
            onClick={(e) => e.preventDefault()}
          >
            {imgElement}
          </a>
        ) : (
          imgElement
        )}
      </div>
    );
  };

  const resolveStyleStr = (val: unknown, fallback: string): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number") return `${val}px`;
    if (typeof val === "object" && val !== null) {
      const resp = val as Record<string, unknown>;
      const resolved = resp[deviceMode] || resp.desktop || resp.mobile || resp.tablet;
      if (typeof resolved === "string") return resolved;
      if (typeof resolved === "number") return `${resolved}px`;
    }
    return fallback;
  };

  const paddingTop = resolveStyleStr(spacing?.paddingTop ?? styles?.paddingTop, "40px");
  const paddingBottom = resolveStyleStr(spacing?.paddingBottom ?? styles?.paddingBottom, "40px");
  const effectiveCols = isMobile ? Math.min(2, general.columns) : isTablet ? Math.min(3, general.columns) : general.columns;

  return (
    <div 
      className={`logo-cloud-section relative w-full ${styles.backgroundType === "mesh" ? "mesh-glow" : ""}`} 
      style={{ 
        ...bgStyle, 
        paddingTop, 
        paddingBottom,
        color: "var(--color-ink)",
      }}
    >
      {general.dataSource === "dynamic" && (
        <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-mono font-bold px-2 py-1 rounded-sm border border-purple-200 z-10 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Dynamic: #{general.dynamicTag || "hash-partner-logo"}
        </div>
      )}
      <div className={`mx-auto ${isMobile ? "px-4" : "px-6 lg:px-8"}`} style={{ maxWidth: LOGO_CLOUD_MAX_WIDTH }}>
        
        {(general.heading || general.subheading) && (
          <div className="text-center mb-8 md:mb-10">
            {general.heading && (
              <h2 
                className="logo-cloud-heading text-lg font-semibold leading-8 tracking-tight" 
                data-custom-color={appearance?.headingColor ? "true" : undefined}
                style={{ color: appearance?.headingColor || "var(--color-ink)" }}
              >
                {general.heading}
              </h2>
            )}
            {general.subheading && (
              <p 
                className="logo-cloud-subheading mt-2 text-sm leading-6" 
                data-custom-color={appearance?.subheadingColor ? "true" : undefined}
                style={{ color: appearance?.subheadingColor || "var(--color-mute)" }}
              >
                {general.subheading}
              </p>
            )}
          </div>
        )}

        {general.layoutStyle === "marquee" ? (
          <div className="w-full overflow-hidden whitespace-nowrap flex items-center relative py-4 mask-marquee select-none">
            <div className="flex w-max flex-nowrap items-center animate-marquee-scroll gap-8 md:gap-12 pr-8 md:pr-12">
              {(() => {
                const baseList = logos.length > 0
                  ? logos.length < 6
                    ? [...logos, ...logos, ...logos]
                    : logos
                  : [];
                const doubled = [...baseList, ...baseList];
                return doubled.map((logo, idx) => renderLogo(logo, idx));
              })()}
            </div>
          </div>
        ) : general.layoutStyle === "grid" ? (
          <div 
            className="mx-auto grid max-w-lg items-center justify-items-center gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 sm:max-w-xl md:max-w-none w-full"
            style={{ 
              gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))`,
              "--logo-cloud-cols": effectiveCols,
            } as React.CSSProperties}
          >
            {logos.map((logo) => renderLogo(logo))}
          </div>
        ) : (
          /* "row" layout - horizontal flex row */
          <div className="w-full overflow-x-auto scrollbar-none py-2">
            <div className={`flex flex-row ${isMobile ? "flex-wrap gap-4" : "flex-nowrap gap-6 sm:gap-8 md:gap-12 min-w-full"} items-center justify-center`}>
              {logos.map((logo) => renderLogo(logo))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
