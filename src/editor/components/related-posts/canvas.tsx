/* eslint-disable @next/next/no-img-element */
import React from "react";
import { BuilderBlock } from "@/types/theme";
import { resolveRelatedPostsProps } from "./schema";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";
import { getBackgroundStyle } from "../shared/background";
import { useEditorStore } from "@/store/editorStore";

export const CanvasElement = ({
  block,
}: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) => {
  const isDark = useCanvasDarkMode();
  const deviceMode = useEditorStore((s) => s.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";
  const isTablet = deviceMode === "tablet";
  const p = resolveRelatedPostsProps(block.props);
  const bgStyle = getBackgroundStyle(block.styles, p.appearance);
  const isMesh = block.styles?.backgroundType === "mesh";

  const allMockPosts = [
    {
      id: 1,
      title: "Understanding modern CSS layout techniques",
      excerpt: "A deep dive into Grid, Flexbox, and container queries for responsive design.",
      tag: "CSS",
      date: "August 24, 2026",
      readingTime: "5 min read",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Building accessible web components from scratch",
      excerpt: "How to create reusable UI components that work for everyone.",
      tag: "Accessibility",
      date: "August 22, 2026",
      readingTime: "4 min read",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "The future of server-side rendering in 2027",
      excerpt: "Exploring new patterns in SSR and streaming architectures.",
      tag: "Architecture",
      date: "August 19, 2026",
      readingTime: "7 min read",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "TypeScript tips for production-grade applications",
      excerpt: "Advanced type patterns that make your code safer and more maintainable.",
      tag: "TypeScript",
      date: "August 15, 2026",
      readingTime: "6 min read",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      title: "Optimizing Ghost theme performance and asset loading",
      excerpt: "Strategies for achieving 100/100 Lighthouse scores on content sites.",
      tag: "Performance",
      date: "August 12, 2026",
      readingTime: "5 min read",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      title: "Design systems and component-driven architecture",
      excerpt: "How to build modular systems that scale gracefully across products.",
      tag: "Design",
      date: "August 08, 2026",
      readingTime: "8 min read",
      image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      title: "State management in complex visual builder UIs",
      excerpt: "Managing reactive AST nodes with Zustand and immutable state.",
      tag: "Engineering",
      date: "August 04, 2026",
      readingTime: "9 min read",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      title: "Edge functions and dynamic content personalizations",
      excerpt: "Low latency data fetching patterns for distributed publications.",
      tag: "Edge",
      date: "July 30, 2026",
      readingTime: "4 min read",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const mockPosts = allMockPosts.slice(0, p.count);
  const featured = mockPosts[0];
  const secondaries = mockPosts.slice(1);

  const headingColor = p.headingColor || (isDark ? "#ffffff" : "#171717");
  const descriptionColor = p.descriptionColor || (isDark ? "#a1a1a1" : "#666666");
  const cardTitleColor = p.cardTitleColor || (isDark ? "#ffffff" : "#171717");
  const cardTextColor = p.cardTextColor || (isDark ? "#a1a1a1" : "#4d4d4d");
  const layout = p.layout || "grid";
  const autoScroll = p.autoScroll || false;

  return (
    <div
      className={`w-full ${isMobile ? "py-6 px-4" : "py-8 px-4 sm:px-6"} transition-colors rounded-md ${isMesh ? "mesh-glow" : ""}`}
      style={bgStyle}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      {(p.heading || p.description) && (
        <div className="w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-2 mb-8">
          {p.heading && (
            <h3
              className="text-xl sm:text-2xl font-bold tracking-tight text-center"
              style={{ color: headingColor }}
            >
              {p.heading}
            </h3>
          )}
          {p.description && (
            <p
              className="text-xs sm:text-sm leading-relaxed text-center"
              style={{ color: descriptionColor }}
            >
              {p.description}
            </p>
          )}
        </div>
      )}

      {/* 1. SPLIT LAYOUT */}
      {layout === "split" && (
        <div className={`grid gap-8 ${isMobile || isTablet ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
          <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-7"} bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-md overflow-hidden flex flex-col shadow-level-2 group hover:shadow-level-3 transition-all`}>
            {p.showImage && (
              <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
            )}
            <div className="p-6 flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                {featured.tag}
              </span>
              <h4 className="text-xl font-bold leading-snug" style={{ color: cardTitleColor }}>
                {featured.title}
              </h4>
              {p.showExcerpt && (
                <p className="text-xs leading-relaxed" style={{ color: cardTextColor }}>
                  {featured.excerpt}
                </p>
              )}
            </div>
          </div>

          <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-5"} flex flex-col gap-6`}>
            {secondaries.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 items-start border-b border-brand-hairline dark:border-white/10 pb-5 last:border-0 last:pb-0"
              >
                {p.showImage && (
                  <div className={`${isMobile ? "w-20 h-16" : "w-24 h-20"} bg-brand-canvas-soft-2 border border-brand-hairline dark:border-white/10 rounded-sm overflow-hidden shrink-0`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale opacity-90"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                    {post.tag}
                  </span>
                  <h4
                    className="text-xs font-semibold leading-snug line-clamp-2"
                    style={{ color: cardTitleColor }}
                  >
                    {post.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GRID LAYOUT */}
      {layout === "grid" && (
        <div
          className={`grid gap-4 sm:gap-6 ${
            isMobile
              ? "grid-cols-1 justify-items-stretch"
              : isTablet
              ? mockPosts.length === 1
                ? "grid-cols-1 justify-items-center"
                : "grid-cols-2 justify-center"
              : mockPosts.length === 1
              ? "grid-cols-1 justify-items-center"
              : mockPosts.length === 2
              ? "grid-cols-1 sm:grid-cols-2 justify-center"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {mockPosts.map((post) => (
            <article
              key={post.id}
              className={`bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-md overflow-hidden flex flex-col shadow-level-2 group hover:shadow-level-3 transition-all ${
                mockPosts.length === 1 ? "w-full max-w-[420px]" : "w-full"
              }`}
            >
              {p.showImage && (
                <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                  {post.tag}
                </span>
                <h4
                  className="text-sm font-semibold leading-snug line-clamp-2"
                  style={{ color: cardTitleColor }}
                >
                  {post.title}
                </h4>
                {p.showExcerpt && (
                  <p className="text-xs leading-relaxed line-clamp-2 mt-1" style={{ color: cardTextColor }}>
                    {post.excerpt}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 3. LIST LAYOUT */}
      {layout === "list" && (
        <div className="flex flex-col gap-4">
          {mockPosts.map((post) => (
            <article
              key={post.id}
              className={`bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-md p-4 flex ${
                isMobile ? "flex-col items-start" : "flex-col sm:flex-row items-start sm:items-center"
              } gap-4 shadow-level-1 group hover:shadow-level-2 transition-all`}
            >
              {p.showImage && (
                <div className={`${isMobile ? "w-full h-44" : "w-full sm:w-40 h-28"} bg-brand-canvas-soft-2 border border-brand-hairline dark:border-white/10 rounded-sm overflow-hidden shrink-0`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                  {post.tag}
                </span>
                <h4 className="text-base font-bold leading-snug" style={{ color: cardTitleColor }}>
                  {post.title}
                </h4>
                {p.showExcerpt && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: cardTextColor }}>
                    {post.excerpt}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 4. CAROUSEL LAYOUT */}
      {layout === "carousel" &&
        (autoScroll ? (
          <div className="overflow-hidden relative group/carousel w-full py-2">
            <div className="flex gap-6 w-max animate-[marquee_25s_linear_infinite] group-hover/carousel:[animation-play-state:paused]">
              {[...mockPosts, ...mockPosts].map((post, idx) => (
                <article
                  key={`${post.id}-${idx}`}
                  className="min-w-[260px] max-w-[300px] bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-md overflow-hidden flex flex-col shrink-0 shadow-level-2 group hover:shadow-level-3 transition-all"
                >
                  {p.showImage && (
                    <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 group-hover:grayscale-0"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                      {post.tag}
                    </span>
                    <h4 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: cardTitleColor }}>
                      {post.title}
                    </h4>
                    {p.showExcerpt && (
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: cardTextColor }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-thin ${
              mockPosts.length <= 2 && !isMobile ? "justify-center" : ""
            }`}
          >
            {mockPosts.map((post) => (
              <article
                key={post.id}
                className="min-w-[260px] max-w-[300px] bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-md overflow-hidden flex flex-col shrink-0 snap-start shadow-level-2 group hover:shadow-level-3 transition-all"
              >
                {p.showImage && (
                  <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 group-hover:grayscale-0"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                    {post.tag}
                  </span>
                  <h4 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: cardTitleColor }}>
                    {post.title}
                  </h4>
                  {p.showExcerpt && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: cardTextColor }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ))}

      {/* 5. BENTO GRID LAYOUT */}
      {layout === "bento" && (
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {mockPosts.map((post, idx) => {
            const isLarge = !isMobile && idx % 3 === 0;
            return (
              <article
                key={post.id}
                className={`bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-level-2 hover:shadow-level-3 transition-all ${
                  isLarge ? "md:col-span-2 flex-col md:flex-row gap-6 items-center" : "gap-4"
                }`}
              >
                {p.showImage && (
                  <div
                    className={`rounded-xl overflow-hidden bg-brand-canvas-soft-2 shrink-0 ${
                      isLarge ? "w-full md:w-1/2 aspect-video" : "w-full aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale opacity-90"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-hairline overflow-hidden shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                        alt="Author"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-brand-link">{post.tag}</span>
                    <span className="text-[10px] text-brand-mute">• {post.date}</span>
                  </div>
                  <h4
                    className={`${
                      isLarge ? "text-lg md:text-xl" : "text-sm"
                    } font-bold leading-snug`}
                    style={{ color: cardTitleColor }}
                  >
                    {post.title}
                  </h4>
                  {p.showExcerpt && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: cardTextColor }}>
                      {post.excerpt}
                    </p>
                  )}
                  <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1">
                    Read Full Article &rarr;
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 6. EDITORIAL LAYOUT */}
      {layout === "editorial" && (
        <div className="flex flex-col gap-8">
          <div className={`grid gap-8 items-start ${isMobile || isTablet ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
            <article className={`${isMobile || isTablet ? "w-full" : "lg:col-span-7"} bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-xl overflow-hidden shadow-level-2 group hover:shadow-level-3 transition-all`}>
              {p.showImage && (
                <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover grayscale opacity-90"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                  {featured.tag}
                </span>
                <h4 className="text-xl font-bold leading-snug" style={{ color: cardTitleColor }}>
                  {featured.title}
                </h4>
                {p.showExcerpt && (
                  <p className="text-xs leading-relaxed" style={{ color: cardTextColor }}>
                    {featured.excerpt}
                  </p>
                )}
              </div>
            </article>

            <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-5"} bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-xl p-6 shadow-level-1 flex flex-col gap-4`}>
              <div className="flex items-center gap-2 pb-3 border-b border-brand-hairline dark:border-white/10">
                <span className="text-amber-500 font-bold text-sm">&#9733;</span>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: headingColor }}>
                  Recommended
                </h4>
              </div>
              <div className="flex flex-col gap-4">
                {secondaries.slice(0, 4).map((post, idx) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 border-b border-brand-hairline/60 dark:border-white/10 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-mono font-bold text-brand-link opacity-80">
                      0{idx + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h5
                        className="text-xs font-semibold leading-snug hover:text-brand-link cursor-pointer line-clamp-2"
                        style={{ color: cardTitleColor }}
                      >
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-brand-mute">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MASONRY LAYOUT */}
      {layout === "masonry" &&
        (autoScroll ? (
          <div className={`grid ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"} gap-6 h-[480px] overflow-hidden relative group/masonry`}>
            {(isMobile ? [0] : isTablet ? [0, 1] : [0, 1, 2]).map((colIdx) => {
              const numCols = isMobile ? 1 : isTablet ? 2 : 3;
              const colPosts = mockPosts.filter((_, idx) => idx % numCols === colIdx);
              const itemsToRender = [...colPosts, ...colPosts];
              const isUp = colIdx % 2 === 0;
              return (
                <div
                  key={colIdx}
                  className={`flex flex-col gap-6 group-hover/masonry:[animation-play-state:paused] ${
                    isUp ? "animate-[scrollUp_30s_linear_infinite]" : "animate-[scrollDown_30s_linear_infinite]"
                  }`}
                >
                  {itemsToRender.map((post, idx) => {
                    const aspectClasses = ["aspect-square", "aspect-[4/5]", "aspect-video"][(idx + colIdx) % 3];
                    return (
                      <article
                        key={`${post.id}-${colIdx}-${idx}`}
                        className="bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col shrink-0"
                      >
                        {p.showImage && (
                          <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover grayscale opacity-90"
                            />
                          </div>
                        )}
                        <div className="p-5 flex flex-col gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                            {post.tag}
                          </span>
                          <h4 className="text-sm font-semibold leading-snug" style={{ color: cardTitleColor }}>
                            {post.title}
                          </h4>
                          {p.showExcerpt && (
                            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: cardTextColor }}>
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : mockPosts.length <= 2 ? (
          <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-6 justify-center`}>
            {mockPosts.map((post, idx) => {
              const aspectClasses = ["aspect-square", "aspect-[4/5]", "aspect-video"][idx % 3];
              return (
                <article
                  key={post.id}
                  className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col"
                >
                  {p.showImage && (
                    <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale opacity-90"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                      {post.tag}
                    </span>
                    <h4 className="text-sm font-semibold leading-snug" style={{ color: cardTitleColor }}>
                      {post.title}
                    </h4>
                    {p.showExcerpt && (
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: cardTextColor }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={`${isMobile ? "columns-1" : isTablet ? "columns-2" : "columns-3"} gap-4 sm:gap-6 space-y-4 sm:space-y-6`}>
            {mockPosts.map((post, idx) => {
              const aspectClasses = ["aspect-square", "aspect-[4/5]", "aspect-video"][idx % 3];
              return (
                <article
                  key={post.id}
                  className="break-inside-avoid bg-white dark:bg-neutral-900 border border-brand-hairline dark:border-white/10 rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col"
                >
                  {p.showImage && (
                    <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale opacity-90"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">
                      {post.tag}
                    </span>
                    <h4 className="text-sm font-semibold leading-snug" style={{ color: cardTitleColor }}>
                      {post.title}
                    </h4>
                    {p.showExcerpt && (
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: cardTextColor }}>
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))}
    </div>
  );
};
