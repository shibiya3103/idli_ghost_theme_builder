/* eslint-disable @next/next/no-img-element */
import React from "react";
import { BuilderBlock } from "@/types/theme";
import { StatsProps, StatItem, defaultProps } from "./schema";
import { getBackgroundStyle } from "../shared/background";
import { useEditorStore } from "@/store/editorStore";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

function resolveStyleValue(val: unknown, fallback: string = "", mode: string = "desktop"): string {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    const target = obj[mode] ?? obj.desktop ?? obj.tablet ?? obj.mobile ?? fallback;
    return target !== undefined && target !== null && target !== "" ? String(target) : fallback;
  }
  return fallback;
}

import { isDarkColor } from "../heading/schema";

export const CanvasElement = ({ block }: { block: BuilderBlock }) => {
  const isDark = useCanvasDarkMode();
  const p = { ...defaultProps, ...block.props } as StatsProps;
  const general = p.general || defaultProps.general || { heading: "Our impact", subheading: "", layoutStyle: "row", columns: 3 };
  const stats = p.stats || defaultProps.stats || [];
  const appearance = p.appearance || defaultProps.appearance || {};
  const spacing = p.spacing || defaultProps.spacing || { paddingTop: "4rem", paddingBottom: "4rem" };
  const styles = block.styles || {};

  const effectiveValueColor = isDark && appearance?.valueColor && isDarkColor(appearance.valueColor)
    ? "var(--color-ink, #ffffff)"
    : (appearance?.valueColor || "var(--color-ink)");
  const effectiveLabelColor = isDark && appearance?.labelColor && isDarkColor(appearance.labelColor)
    ? "var(--color-mute, #a1a1a1)"
    : (appearance?.labelColor || "var(--color-mute)");
  const effectiveHeadingColor = isDark && appearance?.headingColor && isDarkColor(appearance.headingColor)
    ? "var(--color-ink, #ffffff)"
    : (appearance?.headingColor || "var(--color-ink)");

  const assets = useEditorStore((s) => s.document.assets) || {};
  const resolveAsset = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("asset://")) {
      const path = url.replace("asset://", "");
      const fullPath = path.startsWith("assets/") ? path : `assets/${path}`;
      return assets[fullPath] || assets[path] || url;
    }
    return url;
  };

  const deviceMode = useEditorStore((s) => s.deviceMode) || 'desktop';
  const bgStyle = getBackgroundStyle(styles, appearance);
  const elementId = p.advanced?.htmlAnchor || `stats-${block.id}`;
  const pt = resolveStyleValue(spacing.paddingTop, "4rem", deviceMode);
  const pb = resolveStyleValue(spacing.paddingBottom, "4rem", deviceMode);

  const renderStat = (stat: StatItem, idx: number) => {
    if (general.layoutStyle === "cards") {
      return (
        <div key={stat.id || idx} className="bg-white dark:bg-neutral-900/60 rounded-xl shadow-xs border border-gray-100 dark:border-white/10 p-8 flex flex-col items-center text-center">
          {(stat.iconType === 'image' && stat.imageUrl) ? (
            <div className="w-12 h-12 flex items-center justify-center rounded-full mb-4 overflow-hidden">
              <img src={resolveAsset(stat.imageUrl)} alt={stat.label} className="w-full h-full object-cover" />
            </div>
          ) : stat.icon ? (
            <div 
              className="w-12 h-12 flex items-center justify-center rounded-full mb-4 [&_svg]:w-6 [&_svg]:h-6" 
              style={{ backgroundColor: "var(--color-primary-light, #e0f2fe)", color: "var(--color-primary)" }}
              dangerouslySetInnerHTML={{ __html: stat.icon }}
            />
          ) : null}
          <dd className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2" style={{ color: effectiveValueColor }}>{stat.value}</dd>
          <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400" style={{ color: effectiveLabelColor }}>{stat.label}</dt>
        </div>
      );
    } else if (general.layoutStyle === "accent-cards") {
      return (
        <div key={stat.id || idx} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm rounded-r-xl shadow-xs border-y border-r border-gray-100 dark:border-white/10 p-8 flex flex-col items-start border-l-4" style={{ borderLeftColor: "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}>
          {(stat.iconType === 'image' && stat.imageUrl) ? (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-4 overflow-hidden">
              <img src={resolveAsset(stat.imageUrl)} alt={stat.label} className="w-full h-full object-cover" />
            </div>
          ) : stat.icon ? (
            <div 
              className="w-10 h-10 flex items-center justify-center rounded-lg mb-4 [&_svg]:w-5 [&_svg]:h-5" 
              style={{ backgroundColor: "rgba(0, 112, 243, 0.12)", color: "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}
              dangerouslySetInnerHTML={{ __html: stat.icon }}
            />
          ) : null}
          <dd className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2" style={{ color: effectiveValueColor }}>{stat.value}</dd>
          <dt className="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400" style={{ color: effectiveLabelColor }}>{stat.label}</dt>
        </div>
      );
    } else if (general.layoutStyle === "bordered") {
      return (
        <div key={stat.id || idx} className="flex flex-col border-t border-gray-200 dark:border-white/10 py-6">
          <dd className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2" style={{ color: effectiveValueColor }}>{stat.value}</dd>
          <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400" style={{ color: effectiveLabelColor }}>{stat.label}</dt>
        </div>
      );
    } else if (general.layoutStyle === "divider-grid") {
      return (
        <div key={stat.id || idx} className="flex flex-col items-center justify-center text-center p-8 border-b border-r" style={{ borderColor: "var(--color-hairline, rgba(0,0,0,0.1))" }}>
          <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2" style={{ color: effectiveLabelColor }}>{stat.label}</dt>
          <dd className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ color: effectiveValueColor }}>{stat.value}</dd>
        </div>
      );
    }
    
    // Default "row" and "split" stat style
    return (
      <div key={stat.id || idx} className="flex flex-col items-center text-center">
        <dd className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-2" style={{ color: effectiveValueColor }}>{stat.value}</dd>
        <dt className="text-base font-semibold leading-7 text-gray-600 dark:text-gray-400" style={{ color: effectiveLabelColor }}>{stat.label}</dt>
      </div>
    );
  };

  const isCards = general.layoutStyle === 'cards' || general.layoutStyle === 'accent-cards';
  const isDivider = general.layoutStyle === 'divider-grid';
  const activeCols = Math.max(1, Math.min(general.columns, stats.length));

  return (
    <div id={elementId} className={`relative w-full min-w-full ${styles.backgroundType === 'mesh' ? 'mesh-glow' : ''}`} style={{ ...bgStyle, paddingTop: pt, paddingBottom: pb }}>
      <style>{`
        #${elementId} .responsive-grid {
          display: grid;
          grid-template-columns: repeat(${
            deviceMode === 'desktop' ? activeCols : 
            deviceMode === 'tablet' ? Math.min(2, activeCols) : 
            1
          }, minmax(0, 1fr));
        }
        #${elementId} .responsive-split {
          display: grid;
          grid-template-columns: repeat(${deviceMode === 'desktop' ? 2 : 1}, minmax(0, 1fr));
          align-items: center;
        }
      `}</style>
      <div className="w-full min-w-full max-w-7xl mx-auto px-6 lg:px-8">
        {general.layoutStyle === "split" ? (
          <div className="w-full responsive-split gap-12 lg:gap-8">
            <div className="w-full text-left">
              {general.heading && (
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4" style={{ color: effectiveHeadingColor }}>
                  {general.heading}
                </h2>
              )}
              {general.subheading && (
                <p className="text-lg leading-8 text-gray-600 dark:text-gray-300" style={{ color: effectiveLabelColor }}>
                  {general.subheading}
                </p>
              )}
            </div>
            <div className="w-full">
              <dl className={`responsive-grid gap-x-8 gap-y-12`}>
                {stats.map(renderStat)}
              </dl>
            </div>
          </div>
        ) : (
          <>
            {(general.heading || general.subheading) && (
              <div className="w-full min-w-full max-w-4xl mx-auto text-center mb-12">
                {general.heading && (
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" style={{ color: effectiveHeadingColor }}>
                    {general.heading}
                  </h2>
                )}
                {general.subheading && (
                  <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300" style={{ color: effectiveLabelColor }}>
                    {general.subheading}
                  </p>
                )}
              </div>
            )}
            
            <dl className={`responsive-grid ${isDivider ? 'border-t border-l gap-0' : 'gap-x-8 gap-y-12'} ${isCards ? 'gap-y-6' : ''}`} style={isDivider ? { borderColor: "var(--color-hairline, rgba(0,0,0,0.1))" } : {}}>
              {stats.map(renderStat)}
            </dl>
          </>
        )}
      </div>
    </div>
  );
};
