import React, { useState } from "react";
import { BuilderBlock } from "@/types/theme";
import { getBackgroundStyle } from "../shared/background";
import { useEditorStore } from "@/store/editorStore";
import { HeroSlide } from "./schema";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

function resolveStyleValue(val: unknown, fallback: string = "", mode: string = "desktop"): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    return String(obj[mode] || obj.desktop || obj.tablet || obj.mobile || fallback);
  }
  return fallback;
}

export const CanvasElement = ({ block }: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) => {
  const p = block.props || {};
  useCanvasDarkMode();
  const isCarousel = !!p.enableCarousel;
  const useSiteData = p.useSiteData ?? false;
  const useCoverImageAsBackground = p.useCoverImageAsBackground ?? true;
  const showCover = useSiteData && useCoverImageAsBackground;
  const textColor = p.textColor || "";
  const layout = (block.styles?.layout as string) || "center";

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

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Background computation
  const bgStyle = getBackgroundStyle(block.styles);
  let r = 0, g = 0, b = 0;
  const overlayColor = (block.styles?.bgOverlayColor as string) || "#000000";
  if (overlayColor.length === 7) {
    r = parseInt(overlayColor.slice(1, 3), 16);
    g = parseInt(overlayColor.slice(3, 5), 16);
    b = parseInt(overlayColor.slice(5, 7), 16);
  }
  const opacity = block.styles?.bgOverlayOpacity !== undefined ? (block.styles.bgOverlayOpacity as number) : 0.6;
  const overlay = `rgba(${r}, ${g}, ${b}, ${opacity})`;

  const deviceMode = useEditorStore((s) => s.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";
  const isTablet = deviceMode === "tablet";

  const dynamicStyle = showCover
    ? { backgroundColor: "#111", backgroundImage: `linear-gradient(${overlay}, ${overlay})` }
    : bgStyle;

  const applyCustomColor = showCover || !!textColor;
  const textColorClass = applyCustomColor ? "text-inherit" : "text-[var(--color-ink)]";
  const subtitleColorClass = applyCustomColor ? "text-inherit opacity-80" : "text-[var(--color-body)]";

  // Shared Layout classes for BOTH Carousel and Non-Carousel
  let wrapperClasses = `hero-block w-full relative overflow-hidden transition-colors ${!showCover && block.styles?.backgroundType === "mesh" ? "mesh-glow" : ""}`;
  let contentClasses = `mx-auto ${isMobile ? "px-4" : "px-6"} flex relative z-10 w-full`;
  let textContainerClasses = "flex flex-col gap-4";
  let buttonGroupClasses = "mt-4 flex flex-wrap gap-3.5";

  switch (layout) {
    case "left":
      wrapperClasses += " text-left";
      contentClasses += " flex-col items-start";
      textContainerClasses += " items-start";
      buttonGroupClasses += " justify-start";
      break;
    case "bottom":
      wrapperClasses += " text-center flex flex-col justify-end";
      contentClasses += " flex-col items-center mt-auto";
      textContainerClasses += " items-center";
      buttonGroupClasses += " justify-center";
      break;
    case "split-left":
      wrapperClasses += " text-left";
      contentClasses += isMobile || isTablet ? " flex-col items-center gap-8" : " flex-row items-center gap-10";
      textContainerClasses += isMobile || isTablet ? " items-start w-full" : " items-start w-1/2 flex-shrink-0";
      buttonGroupClasses += " justify-start";
      break;
    case "split-right":
      wrapperClasses += " text-left";
      contentClasses += isMobile || isTablet ? " flex-col items-center gap-8" : " flex-row-reverse items-center gap-10";
      textContainerClasses += isMobile || isTablet ? " items-start w-full" : " items-start w-1/2 flex-shrink-0";
      buttonGroupClasses += " justify-start";
      break;
    case "center":
    default:
      wrapperClasses += " text-center";
      contentClasses += " flex-col items-center";
      textContainerClasses += " items-center";
      buttonGroupClasses += " justify-center";
      break;
  }

  const pt = resolveStyleValue(block.styles?.paddingTop, "3.5rem", deviceMode);
  const pb = resolveStyleValue(block.styles?.paddingBottom, "4.5rem", deviceMode);
  const rawMaxWidth = resolveStyleValue(block.styles?.contentWidth, layout.startsWith("split") ? "1200px" : "800px", deviceMode);
  const maxWidth = `min(${rawMaxWidth}, 100%)`;

  // =========================================================================
  // CAROUSEL MODE
  // =========================================================================
  if (isCarousel) {
    const isDynamic = p.carouselMode === "dynamic";
    const dynamicTag = p.dynamicTag || "hero-carousel";

    const slides: HeroSlide[] = (p.slides && p.slides.length > 0) ? p.slides : [
      {
        id: "slide-1",
        eyebrowText: "Featured",
        title: "Discover Verve Edition",
        subtitle: "Experience modern publishing with fluid visual storytelling.",
        buttonLabel: "Explore Now",
        buttonUrl: "#",
        imageUrl: "",
        imageAlt: "Slide 1 Image",
      },
      {
        id: "slide-2",
        eyebrowText: "New Release",
        title: "Built For Modern Creators",
        subtitle: "Craft lightning-fast dynamic publication layouts in Ghost CMS.",
        buttonLabel: "Get Started",
        buttonUrl: "#",
        imageUrl: "",
        imageAlt: "Slide 2 Image",
      }
    ];

    const safeIndex = Math.min(currentSlideIndex, Math.max(0, slides.length - 1));
    const current = slides[safeIndex] || slides[0] || {};
    const slideImg = resolveAsset(current.imageUrl);
    const showArrows = p.showArrows ?? true;
    const showDots = p.showDots ?? true;

    return (
      <div
        className={`${wrapperClasses} group select-none`}
        style={{
          ...dynamicStyle,
          ...(textColor ? { color: textColor } : (showCover ? { color: "#ffffff" } : {})),
          paddingTop: pt,
          paddingBottom: pb,
        }}
      >
        {/* Carousel Mode Indicator */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-medium text-white/90 border border-white/10 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Carousel: {isDynamic ? `Ghost Tag (#${dynamicTag})` : "Static Slides"}</span>
          <span className="opacity-40">|</span>
          <span>{safeIndex + 1}/{slides.length}</span>
        </div>

        <div
          className={contentClasses}
          style={{ maxWidth }}
        >
          {/* Slide Text Content */}
          <div className={textContainerClasses}>
            {(current.eyebrowText || isDynamic) && (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${
                  applyCustomColor
                    ? "bg-white/10 text-white"
                    : "bg-brand-link-bg-soft text-brand-link dark:bg-white/10 dark:text-brand-ink"
                }`}
                style={applyCustomColor ? { color: textColor || "#ffffff" } : {}}
              >
                {isDynamic && <Tag size={10} />}
                {isDynamic ? `Tag: #${dynamicTag}` : current.eyebrowText}
              </span>
            )}

            <h1 className={`${isMobile ? "text-3xl" : "text-[clamp(2rem,3.5vw+0.5rem,3.25rem)]"} font-sans font-bold leading-[1.12] tracking-[-0.02em] break-words max-w-full transition-all duration-300 ${textColorClass}`}>
              {isDynamic ? (safeIndex === 0 ? "Featured Story from #" + dynamicTag : current.title || "Dynamic Post Title") : (current.title || "Slide Title")}
            </h1>

            <p className={`${isMobile ? "text-base" : "text-[clamp(1rem,1.2vw+0.25rem,1.15rem)]"} leading-relaxed max-w-[640px] break-words transition-all duration-300 ${subtitleColorClass}`}>
              {current.subtitle || "Slide description and accompanying editorial copy."}
            </p>

            <div className={buttonGroupClasses}>
              <button
                className="hover:opacity-90 px-7 py-3 rounded-full text-[14px] font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: p.buttonBgColor
                    ? p.buttonBgColor
                    : "var(--ghost-accent-color, var(--color-accent, #0070f3))",
                  color: p.buttonTextColor
                    ? p.buttonTextColor
                    : "#ffffff"
                }}
              >
                {isDynamic ? (p.buttonLabel || "Read Article") : (current.buttonLabel || p.buttonLabel || "Learn More")}
              </button>
              {(p.showSecondaryButton ?? true) && (
                <button
                  className={`border-2 px-7 py-3 rounded-full text-[14px] font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    applyCustomColor
                      ? "border-white/20 text-white hover:border-white"
                      : "border-[var(--color-hairline-strong)] text-[var(--color-ink)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {p.secondaryButtonLabel || "Documentation"}
                </button>
              )}
            </div>
          </div>

          {/* Slide Visual / Image Container for Split Layouts */}
          {layout.startsWith("split") && (
            <div className={`w-full ${isMobile || isTablet ? "mt-4" : "w-1/2"} flex justify-center`}>
              {slideImg ? (
                <div className="w-full relative rounded-xl overflow-hidden shadow-xl border border-white/10">
                  <img
                    src={slideImg}
                    alt={current.imageAlt || current.title || "Slide Image"}
                    className={`w-full h-auto object-cover ${isMobile ? "aspect-video" : "aspect-[16/10]"}`}
                  />
                </div>
              ) : isDynamic ? (
                <div className="w-full aspect-video bg-blue-50/50 dark:bg-white/5 rounded-xl border border-blue-200/60 dark:border-white/10 flex flex-col items-center justify-center text-blue-700 dark:text-blue-300 gap-2 p-6 text-center">
                  <Tag size={24} className="opacity-60" />
                  <span className="text-xs font-semibold">Ghost Feature Image</span>
                  <span className="text-[11px] font-mono opacity-70">{"{{feature_image}}"}</span>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  Slide Image Placeholder
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carousel Arrow Controls */}
        {showArrows && slides.length > 1 && !isMobile && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 hover:bg-white dark:hover:bg-neutral-900 text-gray-800 dark:text-white shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 hover:bg-white dark:hover:bg-neutral-900 text-gray-800 dark:text-white shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {showDots && slides.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 z-20 relative">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  safeIndex === idx
                    ? "w-7 h-2 bg-brand-primary dark:bg-white shadow-xs"
                    : "w-2 h-2 bg-gray-300 dark:bg-white/30 hover:bg-gray-400 dark:hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // NON-CAROUSEL STANDARD HERO MODE (Shares exact same layout)
  // =========================================================================
  const { eyebrowText, title, subtitle, buttonLabel, showSecondaryButton, secondaryButtonLabel, imageUrl, imageAlt } = p;
  const resolvedHeroImage = resolveAsset(imageUrl);

  return (
    <div
      className={wrapperClasses}
      style={{
        ...dynamicStyle,
        ...(textColor ? { color: textColor } : (showCover ? { color: "#ffffff" } : {})),
        paddingTop: pt,
        paddingBottom: pb,
      }}
    >
      <div
        className={contentClasses}
        style={{ maxWidth }}
      >
        <div className={textContainerClasses}>
          {eyebrowText && (
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold px-3 py-1 rounded-full mb-2 ${
                applyCustomColor
                  ? "bg-white/10 text-white"
                  : "bg-brand-link-bg-soft text-brand-link dark:bg-white/10 dark:text-brand-ink"
              }`}
              style={applyCustomColor ? { color: textColor || "#ffffff" } : { color: "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}
            >
              {eyebrowText}
            </span>
          )}
          <h1 className={`${isMobile ? "text-3xl" : "text-[clamp(2rem,4vw+0.5rem,3.5rem)]"} font-sans font-bold leading-[1.1] tracking-[-0.02em] break-words max-w-full ${textColorClass}`}>
            {useSiteData ? "{{@site.title}}" : (title || "Thoughts, stories & ideas.")}
          </h1>
          <p className={`${isMobile ? "text-base" : "text-[clamp(1rem,1.25vw+0.25rem,1.25rem)]"} leading-relaxed max-w-[600px] break-words ${subtitleColorClass}`}>
            {useSiteData ? "{{@site.description}}" : (subtitle || "Insightful articles, thoughtful perspectives, and fresh ideas delivered directly to your feed.")}
          </p>
          <div className={buttonGroupClasses}>
            <button
              className="hover:opacity-90 px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: p.buttonBgColor
                  ? p.buttonBgColor
                  : "var(--ghost-accent-color, var(--color-accent, #0070f3))",
                color: p.buttonTextColor
                  ? p.buttonTextColor
                  : "#ffffff"
              }}
            >
              {buttonLabel || "Start Reading"}
            </button>
            {(showSecondaryButton ?? true) && (
              <button
                className={`border-2 px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all flex items-center justify-center cursor-pointer ${
                  applyCustomColor
                    ? "border-white/20 text-white hover:border-white"
                    : "border-[var(--color-hairline-strong)] text-[var(--color-ink)] hover:border-[var(--color-primary)]"
                }`}
              >
                {secondaryButtonLabel || "Subscribe"}
              </button>
            )}
          </div>
        </div>

        {layout.startsWith("split") && (
          <div className={`w-full ${isMobile || isTablet ? "mt-4" : "w-1/2"} flex justify-center`}>
            {useSiteData ? (
              <div className="w-full aspect-video bg-[#222] rounded-lg border-2 border-dashed border-[#444] flex flex-col gap-2 items-center justify-center text-gray-400 text-sm font-mono shadow-lg">
                <span>{"{{@site.cover_image}}"}</span>
              </div>
            ) : resolvedHeroImage ? (
              <img src={resolvedHeroImage} alt={imageAlt || "Hero Image"} className="w-full h-auto rounded-lg shadow-lg object-cover max-h-[600px]" />
            ) : (
              <div className="w-full aspect-video bg-gray-100 dark:bg-white/5 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Hero Image Placeholder
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
