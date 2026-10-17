import React, { useState } from "react";
import { createPortal } from "react-dom";
import { BuilderBlock } from "@/types/theme";
import { WIDTH_VALUES, CONTENT_WIDTH_VALUES } from "./constants";
import { useEditorStore } from "@/store/editorStore";
import { getBackgroundStyle } from "../shared/background";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

const WIDTH_ORDER = ["narrow", "standard", "wide", "full"] as const;

interface HeaderNavItem {
  label: string;
  url?: string;
  children?: Array<{ label: string; url: string }>;
}

const widthRank = (w: string | undefined) => {
  const i = WIDTH_ORDER.indexOf((w as typeof WIDTH_ORDER[number]) ?? "full");
  return i === -1 ? WIDTH_ORDER.length - 1 : i;
};

/**
 * Chevron SVG indicator for dropdown parent items.
 */
const ChevronDown = ({ open, size = 14 }: { open?: boolean; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transition: "transform 0.2s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      flexShrink: 0,
      opacity: 0.6,
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CanvasElement = ({ block }: {
  block: BuilderBlock;
}) => {
  const p = block.props || {};
  const general = p.general || {};
  const appearance = p.appearance || {};
  const styles = block.styles || {};
  const advanced = p.advanced || {};

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [mobileAccordionIdx, setMobileAccordionIdx] = useState<number | null>(null);
  const { deviceMode, document: doc, togglePreviewColorMode } = useEditorStore();
  const isDark = useCanvasDarkMode();

  const siteTitle = (general.siteTitle && general.siteTitle !== "My Ghost Theme")
    ? general.siteTitle
    : doc?.metadata?.name || general.siteTitle || "Ghost Publication";

  React.useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownIdx(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const prefix = general.dropdownPrefix || "-";

  const items: HeaderNavItem[] = React.useMemo(() => {
    const raw: HeaderNavItem[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? p.navItems : [
      { label: "Home", url: "/" },
      { label: "About", url: "/about" },
      { label: "Team", url: "/team" }
    ];

    const startsWithPrefix = (text: string) => {
      if (!prefix || !text) return false;
      const t = text.trim();
      if (t.indexOf(prefix) === 0) return true;
      if ((prefix === '-' || prefix === '--') && (t.indexOf('–') === 0 || t.indexOf('—') === 0)) return true;
      return false;
    };

    const stripPrefix = (text: string) => {
      const t = text.trim();
      if (t.indexOf(prefix) === 0) return t.substring(prefix.length).trim();
      if ((prefix === '-' || prefix === '--') && (t.indexOf('–') === 0 || t.indexOf('—') === 0)) return t.substring(1).trim();
      return t;
    };

    const result: HeaderNavItem[] = [];
    let i = 0;

    while (i < raw.length) {
      const item = { ...raw[i] };
      const explicitChildren = Array.isArray(item.children) && item.children.length > 0
        ? [...item.children]
        : [];

      const siblingChildren: { label: string; url: string }[] = [];
      let j = i + 1;
      while (j < raw.length) {
        const nextItem = raw[j];
        if (nextItem && startsWithPrefix(nextItem.label || "")) {
          siblingChildren.push({
            label: stripPrefix(nextItem.label || ""),
            url: nextItem.url || "#",
          });
          j++;
        } else {
          break;
        }
      }

      const combined = [...explicitChildren, ...siblingChildren];
      if (combined.length > 0) {
        item.children = combined;
      }

      result.push(item);
      i = j;
    }

    return result;
  }, [p.navItems, prefix]);

  const layout = general.layoutStyle || "Logo on Left";
  const isLogoCenter = layout === "Logo in Center";
  const isStacked = layout === "Stacked";

  const palette = {
    bg: appearance.backgroundColor || "var(--color-canvas)",
    text: appearance.textColor || "var(--color-ink)",
    buttonBg: appearance.buttonBgColor || "var(--ghost-accent-color, var(--color-primary))",
    buttonText: appearance.buttonTextColor || "#ffffff",
  };

  const logoSize = general.logoSize || 40;

  const effectiveContentWidth =
    widthRank(appearance.contentWidth) > widthRank(appearance.sectionWidth)
      ? appearance.sectionWidth
      : appearance.contentWidth;

  const glassBlur = styles.backdropBlur;
  const glassEnabled = !!glassBlur && glassBlur !== "none" && glassBlur !== "0px";
  const bgStyleObj = getBackgroundStyle(styles, appearance);

  const sectionMaxWidth = WIDTH_VALUES[appearance.sectionWidth || "full"] || "100%";
  const isSectionFull = sectionMaxWidth === "100%";
  const sectionBaseClass = isSectionFull ? "w-full" : "w-full mx-auto rounded-xl my-2";

  const contentMaxWidth = CONTENT_WIDTH_VALUES[effectiveContentWidth || "wide"] || "100%";

  const marginBottomValue = (typeof styles.marginBottom === 'object' && styles.marginBottom !== null && 'desktop' in styles.marginBottom ? (styles.marginBottom as { desktop?: string }).desktop : typeof styles.marginBottom === 'string' ? styles.marginBottom : "0px") || "0px";
  const shadowValue = styles.boxShadow && styles.boxShadow !== "none" ? styles.boxShadow : "none";
  const opacityValue = styles.opacity ?? 1;

  const iconHoverClass = "hover:bg-black/5 dark:hover:bg-white/10";

  const isMobile = deviceMode === 'mobile';

  const searchButton = general.showSearch !== false && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setActiveModal("Ghost SodoSearch simulation active.");
      }}
      className={`p-1.5 opacity-80 hover:opacity-100 rounded-full ${iconHoverClass} shrink-0 transition-opacity`}
      title="Test Ghost Search"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  );

  const themeButton = general.showThemeSwitcher !== false && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        togglePreviewColorMode();
      }}
      className={`p-1.5 opacity-80 hover:opacity-100 rounded-full ${iconHoverClass} shrink-0 transition-opacity`}
      title="Toggle Theme"
    >
      <svg className="icon-moon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: isDark ? 'none' : 'block' }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: isDark ? 'block' : 'none' }}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    </button>
  );

  /**
   * Renders action buttons (visitor: sign in & subscribe; member: sign out & account).
   */
  const renderActions = (vertical = false) => {
    const isMember = general.memberPreviewState === "member";

    const primaryAction = isMember ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveModal("Ghost Portal Account simulation active.");
        }}
        className={vertical
          ? "gh-head-btn gh-btn w-full max-w-[280px] py-2.5 rounded-full text-[1.0625rem] font-semibold shadow-sm transition-all whitespace-nowrap opacity-90 hover:opacity-100 text-center"
          : "gh-head-btn gh-btn px-6 py-2.5 rounded-full text-[1.0625rem] font-semibold shadow-sm transition-all whitespace-nowrap opacity-90 hover:opacity-100"
        }
        style={{ backgroundColor: palette.buttonBg, color: palette.buttonText }}
      >
        Account
      </button>
    ) : (
      general.showSubscribe !== false && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("Ghost Portal Subscribe simulation active.");
          }}
          className={vertical
            ? "gh-head-btn gh-btn w-full max-w-[280px] py-2.5 rounded-full text-[1.0625rem] font-semibold shadow-sm transition-all whitespace-nowrap opacity-90 hover:opacity-100 text-center"
            : "gh-head-btn gh-btn px-6 py-2.5 rounded-full text-[1.0625rem] font-semibold shadow-sm transition-all whitespace-nowrap opacity-90 hover:opacity-100"
          }
          style={{ backgroundColor: palette.buttonBg, color: palette.buttonText }}
        >
          {general.subscribeText ?? "Subscribe"}
        </button>
      )
    );

    const secondaryAction = isMember ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveModal("Ghost Sign Out simulation active.");
        }}
        className="text-[1.0625rem] font-medium opacity-90 hover:opacity-100 hover:underline whitespace-nowrap px-1"
      >
        Sign out
      </button>
    ) : (
      general.showSignIn !== false && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal("Ghost Portal Sign In simulation active.");
          }}
          className="text-[1.0625rem] font-medium opacity-90 hover:opacity-100 hover:underline whitespace-nowrap px-1"
        >
          {general.signInText || "Sign in"}
        </button>
      )
    );

    if (!vertical) {
      return (
        <div className="flex items-center gap-4 shrink-0">
          {searchButton}
          {themeButton}
          {secondaryAction}
          {primaryAction}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {primaryAction}
        {secondaryAction}
      </div>
    );
  };

  /**
   * Renders the hamburger / close toggle button for mobile view.
   */
  const renderBurgerButton = () => (
    <button
      className="p-2 opacity-80 hover:opacity-100 transition-opacity relative z-50 text-neutral-900 dark:text-white"
      aria-label="Menu"
      style={{ color: "inherit" }}
      onClick={(e) => {
        e.stopPropagation();
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setMobileAccordionIdx(null);
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {isMobileMenuOpen ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </>
        ) : (
          <>
            <line x1="3" y1="8" x2="21" y2="8"></line>
            <line x1="3" y1="16" x2="21" y2="16"></line>
          </>
        )}
      </svg>
    </button>
  );

  const renderMobileTopBarActions = () => (
    <div className="flex items-center gap-2">
      {searchButton}
      {themeButton}
      {renderBurgerButton()}
    </div>
  );

  /**
   * Renders the full-screen mobile menu overlay with accordion dropdowns.
   */
  const renderMobileOverlay = () => {
    if (!isMobile) return null;

    const overlayContent = (
      <div
        className="gh-head"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          maxHeight: "850px",
          ...bgStyleObj,
          color: palette.text,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          backdropFilter: glassEnabled ? "blur(12px)" : "none",
          WebkitBackdropFilter: glassEnabled ? "blur(12px)" : "none",
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
        }}
      >
        {/* Top bar: logo + close button */}
        <div
          className="flex items-center justify-between w-full px-4"
          style={{ height: "64px", flexShrink: 0 }}
        >
          {renderLogo()}
          {renderMobileTopBarActions()}
        </div>

        {/* Nav items with accordion for dropdowns */}
        <div className="flex flex-col items-center justify-start gap-2 px-6 pt-10 pb-8">
          <nav className="flex flex-col items-center gap-2 w-full">
            {items.map((item: HeaderNavItem, idx: number) => {
              const hasChildren = item.children && item.children.length > 0;
              const isAccordionOpen = mobileAccordionIdx === idx;

              return (
                <div key={idx} className="w-full flex flex-col items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasChildren) {
                        setMobileAccordionIdx(isAccordionOpen ? null : idx);
                      }
                    }}
                    className="cursor-pointer hover:opacity-100 transition-opacity text-[1.5rem] leading-[1.3] font-semibold flex items-center gap-2"
                    style={{
                      opacity: isMobileMenuOpen ? 1 : 0,
                      transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-12px)',
                      transition: `opacity 0.3s ease ${idx * 0.05}s, transform 0.3s ease ${idx * 0.05}s`,
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      padding: '8px 0',
                    }}
                  >
                    {item.label}
                    {hasChildren && <ChevronDown open={isAccordionOpen} size={18} />}
                  </button>

                  {/* Accordion sub-items */}
                  {hasChildren && (
                    <div
                      style={{
                        maxHeight: isAccordionOpen ? `${(item.children?.length ?? 0) * 48}px` : "0px",
                        overflow: "hidden",
                        transition: "max-height 0.3s ease, opacity 0.25s ease",
                        opacity: isAccordionOpen ? 1 : 0,
                        width: "100%",
                      }}
                    >
                      <div className="flex flex-col items-center gap-1 py-2">
                        {item.children?.map((child, cidx) => (
                          <span
                            key={cidx}
                            className="text-[1.125rem] opacity-70 hover:opacity-100 transition-opacity py-1.5"
                          >
                            {child.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Actions: sticky at the bottom */}
        <div
          className="flex flex-col items-center gap-3 px-6 py-6 mt-auto gh-head-actions"
          style={{
            flexShrink: 0,
            backgroundColor: "transparent",
            opacity: isMobileMenuOpen ? 1 : 0,
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s`,
          }}
        >
          {renderActions(true)}
        </div>
      </div>
    );

    // Use portal to render at the root level
    if (typeof document !== "undefined") {
      const portalTarget = document.getElementById("canvas-preview-frame") || document.body;
      return createPortal(overlayContent, portalTarget);
    }

    return overlayContent;
  };

  /**
   * Renders the logo section: renders uploaded logo image or site title text matching Ghost {{#if @site.logo}}...{{else}}{{@site.title}}{{/if}}.
   */
  const renderLogo = () => {
    if (general.showLogo === false) {
      return null;
    }

    const activeLogo = (isDark && general.darkLogoUrl) ? general.darkLogoUrl : general.logoUrl;

    if (activeLogo) {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <img
            src={activeLogo}
            alt={siteTitle}
            style={{ maxHeight: `${logoSize}px`, width: "auto" }}
            className="object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 font-bold tracking-tight text-2xl shrink-0 select-none">
        <span className="gh-site-title leading-none">{siteTitle}</span>
      </div>
    );
  };

  /**
   * Renders a single desktop nav item with dropdown on hover and click.
   */
  const DropdownNavItem = ({ item, idx }: { item: HeaderNavItem; idx: number }) => {
    const isOpen = openDropdownIdx === idx;

    return (
      <div
        className="relative inline-flex items-center"
        onMouseEnter={() => setOpenDropdownIdx(idx)}
        onMouseLeave={() => setOpenDropdownIdx(null)}
        style={{ position: "relative" }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdownIdx(isOpen ? null : idx);
          }}
          className="cursor-pointer hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 px-3 py-1.5 flex items-center gap-1.5 bg-transparent border-none text-inherit font-inherit text-[1.0625rem] leading-normal"
          style={{ color: "inherit", background: "none" }}
        >
          <span>{item.label}</span>
          <ChevronDown open={isOpen} />
        </button>

        {/* Dropdown Card */}
        <div
          className={`nav-dropdown-card transition-all duration-200 ${
            isOpen
              ? "opacity-100 visible pointer-events-auto translate-y-0"
              : "opacity-0 invisible pointer-events-none -translate-y-1"
          }`}
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: isOpen ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-4px)",
            minWidth: "180px",
            paddingTop: "6px",
            zIndex: 1000,
          }}
        >
          {/* Hover bridge */}
          <div style={{ position: "absolute", top: "-6px", left: 0, right: 0, height: "10px" }} />

          <div
            className="nav-dropdown-inner bg-white dark:bg-[#1f1f1f] text-[#171717] dark:text-white rounded-lg p-1.5 shadow-xl border border-black/10 dark:border-white/10 flex flex-col gap-0.5"
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {item.children?.map((child, cidx) => (
              <div
                key={cidx}
                className="px-3.5 py-2 rounded-md text-[14px] font-medium whitespace-nowrap cursor-pointer transition-colors duration-150 text-[#171717] dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white select-none text-left"
              >
                {child.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopNavItem = (item: HeaderNavItem, idx: number) => {
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) {
      return (
        <span key={idx} className="cursor-pointer hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 px-3 py-1.5 text-[1.0625rem]">
          {item.label}
        </span>
      );
    }

    return <DropdownNavItem key={idx} item={item} idx={idx} />;
  };

  /**
   * Renders the desktop navigation links with dropdown support.
   */
  const renderDesktopNav = (justify: string = "center") => (
    <nav className={`flex items-center gap-5 flex-nowrap whitespace-nowrap text-[1.0625rem] font-medium opacity-90 overflow-visible shrink-0 ${justify === "center" ? "justify-center" : "justify-start"
      }`}>
      {items.map((item: HeaderNavItem, idx: number) => renderDesktopNavItem(item, idx))}
    </nav>
  );

  const headerPt = p.spacing?.paddingTop !== undefined ? `${p.spacing.paddingTop}px` : (block.styles?.paddingTop || "20px");
  const headerPb = p.spacing?.paddingBottom !== undefined ? `${p.spacing.paddingBottom}px` : (block.styles?.paddingBottom || "20px");

  return (
    <div
      className="w-full bg-transparent p-0"
      style={{
        position: "relative",
      }}
    >
      {/* Header receives Section Width & Colors */}
      <header
        id={advanced.htmlAnchor || "gh-head"}
        className={`relative transition-all duration-150 gh-head section-width-${appearance.sectionWidth || 'full'} ${sectionBaseClass} ${styles.backgroundType === "mesh" ? 'mesh-glow' : ''}`}
        style={{
          ...bgStyleObj,
          color: palette.text,
          maxWidth: sectionMaxWidth,
          marginBottom: marginBottomValue,
          boxShadow: shadowValue,
          opacity: opacityValue,
          backdropFilter: glassEnabled ? `blur(${glassBlur})` : undefined,
          WebkitBackdropFilter: glassEnabled ? `blur(${glassBlur})` : undefined,
          transition: "all 0.15s ease-in-out",
          overflow: "visible",
          zIndex: 40,
        }}
      >
        {/* Inner container receives Content Width */}
        <div
          className={`mx-auto px-6 gh-head-inner content-width-${appearance.contentWidth || 'wide'}`}
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            height: isMobile ? "64px" : "auto",
            padding: isMobile ? "0 16px" : `${headerPt} 24px ${headerPb} 24px`,
            display: "flex",
            alignItems: "center",
            overflow: "visible",
          }}
        >

          {isMobile ? (
            /* ============ MOBILE LAYOUT ============ */
            <div className="flex items-center justify-between w-full" style={{ height: "64px" }}>
              {renderLogo()}
              {renderMobileTopBarActions()}
            </div>
          ) : isStacked ? (
            /* ============ STACKED DESKTOP ============ */
            <div className="flex flex-col items-center gap-4 text-center w-full">
              {renderLogo()}
              <nav className="flex flex-nowrap justify-center items-center gap-6 text-[1.0625rem] font-medium opacity-90 whitespace-nowrap overflow-visible">
                {items.map((item: HeaderNavItem, idx: number) => renderDesktopNavItem(item, idx))}
              </nav>
              {renderActions()}
            </div>
          ) : isLogoCenter ? (
            /* ============ LOGO CENTER DESKTOP ============ */
            <div className="flex items-center justify-between w-full gap-6">
              <div className="flex-1 flex items-center justify-start min-w-0">
                {renderDesktopNav("start")}
              </div>

              <div className="shrink-0 flex items-center justify-center font-bold tracking-tight px-4 whitespace-nowrap">
                {renderLogo()}
              </div>

              <div className="flex-1 flex items-center justify-end min-w-0">
                {renderActions()}
              </div>
            </div>
          ) : (
            /* ============ LOGO LEFT DESKTOP (default) ============ */
            <div className="flex items-center justify-between w-full gap-6">
              <div className="flex items-center gap-6 min-w-0 flex-1 overflow-visible">
                {renderLogo()}
                {renderDesktopNav("start")}
              </div>

              <div className="shrink-0">
                {renderActions()}
              </div>
            </div>
          )}

        </div>

        {/* Modal feedback */}
        {activeModal && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black text-white text-xs rounded shadow-lg z-50 flex items-center gap-2">
            <span>{activeModal}</span>
            <button onClick={() => setActiveModal(null)} className="font-bold ml-2">×</button>
          </div>
        )}
      </header>

      {/* Mobile Menu Full-Screen Overlay — rendered outside header to avoid clipping */}
      {renderMobileOverlay()}
    </div>
  );
};