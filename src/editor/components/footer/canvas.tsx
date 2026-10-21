import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_SECONDARY_NAV, FooterNavItem, WIDTH_VALUES, CONTENT_WIDTH_VALUES } from "./schema";
import { ALL_SOCIAL_PLATFORMS, DEFAULT_SOCIAL_PLATFORMS, SocialPlatform } from "./socialIcons";
import { getBackgroundStyle } from "../shared/background";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

export function CanvasElement({ block, onClick }: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) {
  const p = block.props;
  
  const document = useEditorStore(state => state.document);
  const deviceMode = useEditorStore(state => state.deviceMode);
  const isMobile = deviceMode === 'mobile';
  useCanvasDarkMode();

  const headerBlock = Object.values(document.blocks).find(b => b.type === "header");
  const headerAppearance = headerBlock?.props?.appearance || {};
  
  const isSync = p.colors?.syncWithHeader;
  const activeStyles = isSync ? (headerBlock?.styles || {}) : (block.styles || {});
  const activeAppearance = isSync ? headerAppearance : (p.colors || {});
  
  const bgStyleObj = getBackgroundStyle(activeStyles, activeAppearance);
  const bgFallbackColor = activeAppearance.backgroundColor || "var(--color-canvas)";
  const text = isSync ? (headerAppearance.textColor || "var(--color-ink)") : (p.colors?.textColor || "var(--color-ink)");

  const primaryNavItems = Array.isArray(headerBlock?.props?.navItems) && headerBlock.props.navItems.length > 0
    ? headerBlock.props.navItems
    : [
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Collection", url: "/collection" }
      ];

  const layoutStyle = p.general?.layoutStyle || "Simple Minimal";
  const showSecondaryNav = p.general?.showSecondaryNav !== false;
  const secondaryNavTitle = p.general?.secondaryNavTitle || "More";
  const secondaryNavItems: FooterNavItem[] = DEFAULT_SECONDARY_NAV;
  const showSocialIcons = p.general?.showSocialIcons !== false && p.showSocialIcons !== false;
  const showCopyright = p.general?.showCopyright !== false && p.showCopyright !== false;
  const showSubscribeBox = p.general?.showSubscribeBox !== false;
  
  const copyrightText = p.general?.customCopyrightText || p.copyright || "© 2026 Ghost Theme Builder. Published with Ghost.";

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
      const resolved = obj[deviceMode] ?? obj.desktop ?? obj.tablet ?? obj.mobile;
      if (resolved !== undefined && resolved !== null) {
        return resolvePadding(resolved, fallback);
      }
    }
    return fallback;
  };

  const paddingTop = resolvePadding(
    p.spacing?.paddingTop ?? block.styles?.paddingTop ?? p.spacing?.padding?.topBottom,
    "40px"
  );

  const paddingBottom = resolvePadding(
    p.spacing?.paddingBottom ?? block.styles?.paddingBottom ?? p.spacing?.padding?.topBottom,
    "40px"
  );

  const sectionWidth = p.layout?.sectionWidth || "full";
  const sectionMaxWidth = WIDTH_VALUES[sectionWidth] || "100%";
  const isSectionFull = sectionWidth === "full";
  
  const contentWidth = p.layout?.contentWidth || "standard";
  const contentMaxWidth = CONTENT_WIDTH_VALUES[contentWidth] || "100%";

  const activePlatforms: SocialPlatform[] = p.general?.socialPlatforms || DEFAULT_SOCIAL_PLATFORMS;
  const platformMap = React.useMemo(() => {
    return new Map(ALL_SOCIAL_PLATFORMS.map(item => [item.id, item]));
  }, []);

  const socialIcons = (
    <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center opacity-80 max-w-full">
      {activePlatforms.map((platformId) => {
        const item = platformMap.get(platformId);
        if (!item) return null;
        return (
          <span 
            key={platformId} 
            title={item.label}
            className="hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shrink-0"
          >
            {item.renderIcon({ size: 20 })}
          </span>
        );
      })}
    </div>
  );

  return (
    <footer 
      className={`site-footer w-full px-4 sm:px-6 transition-all overflow-hidden section-width-${sectionWidth} ${activeStyles.backgroundType === "mesh" ? 'mesh-glow' : ''} text-brand-ink dark:text-brand-ink`}
      style={{ 
        ...bgStyleObj, 
        color: text, 
        paddingTop, 
        paddingBottom,
        maxWidth: sectionMaxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: isSectionFull ? "0" : "12px",
        marginTop: isSectionFull ? "0" : "24px",
        marginBottom: isSectionFull ? "0" : "24px",
      }}
      onClick={onClick}
    >
      <div className="mx-auto w-full flex flex-col gap-8" style={{ maxWidth: contentMaxWidth }}>
        
        {layoutStyle === "Multi-Column" && (
          <div className={`grid gap-8 sm:gap-10 mb-8 ${isMobile ? 'grid-cols-1' : deviceMode === 'tablet' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className={`flex flex-col gap-4 ${isMobile ? 'text-center items-center' : ''}`}>
              <h4 className="text-xl font-bold">Your Publication</h4>
              <p className="opacity-80 leading-relaxed">Thoughts, stories and ideas about building modern software and design.</p>
              {showSocialIcons && (
                <div className={`w-full flex ${isMobile ? 'justify-center' : 'justify-start'}`}>
                  {socialIcons}
                </div>
              )}
            </div>
            <div className={`flex flex-col gap-4 ${isMobile ? 'text-center items-center' : ''}`}>
              <h4 className="text-sm font-bold uppercase tracking-wider opacity-60">Navigation</h4>
              <nav className="flex flex-col gap-3 opacity-80">
                {primaryNavItems.map((item: { label: string; url?: string }, idx: number) => (
                  <a key={idx} href={item.url || "#"} onClick={(e) => e.preventDefault()} className="hover:opacity-100 transition-opacity">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            {showSecondaryNav && (
              <div className={`flex flex-col gap-4 ${isMobile ? 'text-center items-center' : ''}`}>
                <h4 className="text-sm font-bold uppercase tracking-wider opacity-60">{secondaryNavTitle}</h4>
                <nav className="flex flex-col gap-3 opacity-80">
                  {secondaryNavItems.map((item, idx) => (
                    <a key={idx} href={item.url || "#"} onClick={(e) => e.preventDefault()} className="hover:opacity-100 transition-opacity">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {layoutStyle === "Newsletter Integrated" && showSubscribeBox && (
          <div className="text-center max-w-[600px] mx-auto mb-10 p-6 sm:p-12 rounded-xl" style={{ backgroundColor: 'currentColor', color: bgFallbackColor }}>
            <h3 className="text-2xl font-bold mb-3">Subscribe to our newsletter</h3>
            <p className="opacity-80 mb-6">Get the latest posts delivered right to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-[400px] mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 px-4 py-3 rounded-md outline-none text-brand-ink bg-brand-canvas border border-brand-hairline" readOnly />
              <button className="footer-subscribe-btn px-6 py-3 font-bold rounded-md" style={{ backgroundColor: p.colors?.buttonBgColor || 'var(--ghost-accent-color, var(--color-accent, #0070f3))', color: p.colors?.buttonTextColor || '#ffffff' }}>Subscribe</button>
            </div>
          </div>
        )}

        {/* Footer Bottom Row */}
        {isMobile ? (
          <div className={`flex flex-col items-center justify-center text-center gap-5 text-sm w-full ${layoutStyle !== "Simple Minimal" ? 'pt-6 border-t opacity-90 border-current border-opacity-20' : ''}`}>
            {showSecondaryNav && layoutStyle !== "Multi-Column" && (
              <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 opacity-80 w-full text-center">
                {secondaryNavItems.map((item, idx) => (
                  <a key={idx} href={item.url || "#"} onClick={(e) => e.preventDefault()} className="hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </a>
                ))}
              </nav>
            )}

            {showSocialIcons && layoutStyle !== "Multi-Column" && (
              <div className="w-full flex justify-center py-1">
                {socialIcons}
              </div>
            )}

            {showCopyright && (
              <span className="opacity-70 text-xs leading-relaxed text-center w-full px-2 max-w-sm">
                {copyrightText}
              </span>
            )}
          </div>
        ) : (
          <div className={`flex flex-col md:flex-row items-center justify-between gap-6 text-sm w-full ${layoutStyle !== "Simple Minimal" ? 'pt-6 border-t opacity-90 border-current border-opacity-20' : ''}`}>
            {showCopyright && <span className="opacity-70 text-left shrink-0">{copyrightText}</span>}
            
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-6">
              {showSecondaryNav && layoutStyle !== "Multi-Column" && (
                <nav className="flex flex-wrap items-center gap-5 opacity-80">
                  {secondaryNavItems.map((item, idx) => (
                    <a key={idx} href={item.url || "#"} onClick={(e) => e.preventDefault()} className="hover:opacity-100 transition-opacity">
                      {item.label}
                    </a>
                  ))}
                </nav>
              )}
              {showSocialIcons && layoutStyle !== "Multi-Column" && socialIcons}
            </div>
          </div>
        )}

      </div>
    </footer>
  );
};