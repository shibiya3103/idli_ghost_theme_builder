import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";
import { useEditorStore } from "@/store/editorStore";

export const CanvasElement = ({ block }: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) => {
  useCanvasDarkMode();
  const deviceMode = useEditorStore((state) => state.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";
  const isTablet = deviceMode === "tablet";
  const limit = block.props.limit !== undefined ? block.props.limit : 3;
  const allMockPosts = [
    { id: 1, title: "Building custom Ghost themes with Next.js", excerpt: "Learn how to establish an elegant AST rendering architecture.", date: "August 20, 2026", readingTime: "4 min read", category: "Engineering", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80" },
    { id: 2, title: "Design languages that scale: Geist case study", excerpt: "How stark typography and mesh gradients define developer branding.", date: "August 18, 2026", readingTime: "6 min read", category: "Design", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80" },
    { id: 3, title: "Deploying modern edge stacks to global nodes", excerpt: "Optimizing startup speeds and layout rendering algorithms.", date: "August 15, 2026", readingTime: "3 min read", category: "DevOps", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
    { id: 4, title: "Embracing accessibility in modern web apps", excerpt: "Building inclusive experiences that work for everyone out of the box.", date: "August 10, 2026", readingTime: "5 min read", category: "Engineering", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
    { id: 5, title: "The future of interactive documentation", excerpt: "Why static pages are no longer enough for developer tools.", date: "August 5, 2026", readingTime: "7 min read", category: "Product", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80" },
    { id: 6, title: "Mastering CSS Grid and Subgrid", excerpt: "Advanced layout techniques for complex responsive interfaces.", date: "July 28, 2026", readingTime: "8 min read", category: "Design", image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=600&q=80" },
    { id: 7, title: "State management in complex applications", excerpt: "Comparing Zustand, Redux, and Context for visual builders.", date: "July 20, 2026", readingTime: "9 min read", category: "Engineering", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80" },
    { id: 8, title: "Serverless databases at the edge", excerpt: "Low latency data fetching patterns for distributed apps.", date: "July 15, 2026", readingTime: "4 min read", category: "DevOps", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80" }
  ];
  const mockPosts = allMockPosts.slice(0, limit);
  const featured = mockPosts[0];
  const secondaries = mockPosts.slice(1);
  const heading = block.props.heading !== undefined ? block.props.heading : (block.props.title || "Featured Articles");
  const description = block.props.description !== undefined ? block.props.description : "Hand-picked stories and top editorial selections from our writers.";
  const headingColor = block.props.headingColor || "var(--color-ink)";
  const descriptionColor = block.props.descriptionColor || "var(--color-mute)";
  const layout = block.props.layout || "split";
  const autoScroll = block.props.autoScroll || false;

  return (
    <div className="w-full">
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

      {(heading || description) && (
        <div className="w-full min-w-full max-w-2xl mx-auto text-center flex flex-col items-center gap-2 mb-12">
          {heading && (
            <h2 className="w-full text-2xl sm:text-3xl font-bold tracking-tight text-center" style={{ color: headingColor }}>
              {heading}
            </h2>
          )}
          {description && (
            <p className="w-full text-sm sm:text-base leading-relaxed text-center" style={{ color: descriptionColor }}>
              {description}
            </p>
          )}
        </div>
      )}

      {layout === "split" && (
        <div className={`grid gap-8 ${isMobile || isTablet ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
          <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-7"} bg-white dark:bg-neutral-900 border border-brand-hairline rounded-md overflow-hidden flex flex-col shadow-level-2 group hover:shadow-level-3 transition-all`}>
            <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300" />
            </div>
            <div className="p-6 flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{featured.category}</span>
              <h3 className="text-xl font-bold text-brand-ink leading-snug">{featured.title}</h3>
              <p className="text-xs text-brand-body leading-relaxed">{featured.excerpt}</p>
            </div>
          </div>
          <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-5"} flex flex-col gap-6`}>
            {secondaries.map(post => (
              <div key={post.id} className="flex gap-4 items-start border-b border-brand-hairline pb-5 last:border-0 last:pb-0">
                <div className="w-24 h-20 bg-brand-canvas-soft-2 border border-brand-hairline rounded-sm overflow-hidden shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                  <h4 className="text-xs font-semibold text-brand-ink leading-snug line-clamp-2">{post.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "grid" && (
        <div className={`grid gap-4 sm:gap-6 ${
          isMobile
            ? "grid-cols-1"
            : isTablet
            ? mockPosts.length === 1 ? "grid-cols-1 justify-items-center" : "grid-cols-2"
            : mockPosts.length === 1
            ? "grid-cols-1 justify-items-center"
            : mockPosts.length === 2
            ? "grid-cols-1 sm:grid-cols-2 justify-center"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {mockPosts.map(post => (
            <div key={post.id} className={`bg-white dark:bg-neutral-900 border border-brand-hairline rounded-md overflow-hidden flex flex-col shadow-level-2 group hover:shadow-level-3 transition-all ${mockPosts.length === 1 ? "w-full max-w-[420px]" : "w-full"}`}>
              <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                <h3 className="text-sm font-bold text-brand-ink leading-snug line-clamp-2">{post.title}</h3>
                <p className="text-xs text-brand-body leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "list" && (
        <div className="flex flex-col gap-4">
          {mockPosts.map(post => (
            <div key={post.id} className={`bg-white dark:bg-neutral-900 border border-brand-hairline rounded-md p-4 flex ${isMobile ? "flex-col" : "flex-row"} gap-4 items-start ${isMobile ? "" : "items-center"} shadow-level-1 group hover:shadow-level-2 transition-all`}>
              <div className={`${isMobile ? "w-full h-44" : "w-40 h-28"} bg-brand-canvas-soft-2 border border-brand-hairline rounded-sm overflow-hidden shrink-0`}>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                <h3 className="text-base font-bold text-brand-ink leading-snug">{post.title}</h3>
                <p className="text-xs text-brand-body leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "carousel" && (
        autoScroll ? (
          <div className="overflow-hidden relative group/carousel w-full py-2">
            <div className="flex gap-6 w-max animate-[marquee_25s_linear_infinite] group-hover/carousel:[animation-play-state:paused]">
              {[...mockPosts, ...mockPosts].map((post, idx) => (
                <div key={`${post.id}-${idx}`} className="min-w-[260px] max-w-[300px] bg-white dark:bg-neutral-900 border border-brand-hairline rounded-md overflow-hidden flex flex-col shrink-0 shadow-level-2 group hover:shadow-level-3 transition-all">
                  <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300" />
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                    <h3 className="text-sm font-bold text-brand-ink leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-brand-body leading-relaxed line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-thin ${mockPosts.length <= 2 && !isMobile ? 'justify-center' : ''}`}>
            {mockPosts.map(post => (
              <div key={post.id} className="min-w-[260px] max-w-[300px] bg-white dark:bg-neutral-900 border border-brand-hairline rounded-md overflow-hidden flex flex-col shrink-0 snap-start shadow-level-2 group hover:shadow-level-3 transition-all">
                <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300" />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                  <h3 className="text-sm font-bold text-brand-ink leading-snug line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-brand-body leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {layout === "bento" && (
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {mockPosts.map((post, idx) => {
            const isLarge = !isMobile && idx % 3 === 0;
            return (
              <div
                key={post.id}
                className={`bg-white dark:bg-neutral-900 border border-brand-hairline rounded-2xl p-6 flex flex-col justify-between shadow-level-2 hover:shadow-level-3 transition-all ${
                  isLarge ? "md:col-span-2 flex-col md:flex-row gap-6 items-center" : "gap-4"
                }`}
              >
                <div className={`rounded-xl overflow-hidden bg-brand-canvas-soft-2 shrink-0 ${isLarge ? "w-full md:w-1/2 aspect-video" : "w-full aspect-[4/3]"}`}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                </div>
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-hairline overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Author" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-semibold text-brand-ink">{post.category}</span>
                    <span className="text-[10px] text-brand-mute">• {post.date}</span>
                  </div>
                  <h3 className={`${isLarge ? "text-lg md:text-xl" : "text-sm"} font-bold text-brand-ink leading-snug`}>
                    {post.title}
                  </h3>
                  <p className="text-xs text-brand-body leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1">
                    Read Full Article &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {layout === "editorial" && (
        <div className="flex flex-col gap-8">
          <div className={`grid gap-8 items-start ${isMobile || isTablet ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
            <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-7"} bg-white dark:bg-neutral-900 border border-brand-hairline rounded-xl overflow-hidden shadow-level-2 group hover:shadow-level-3 transition-all`}>
              <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover grayscale opacity-90" />
              </div>
              <div className="p-6 flex flex-col gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{featured.category}</span>
                <h3 className="text-xl font-bold text-brand-ink leading-snug">{featured.title}</h3>
                <p className="text-xs text-brand-body leading-relaxed">{featured.excerpt}</p>
              </div>
            </div>

            <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-5"} bg-white dark:bg-neutral-900 border border-brand-hairline rounded-xl p-6 shadow-level-1 flex flex-col gap-4`}>
              <div className="flex items-center gap-2 pb-3 border-b border-brand-hairline">
                <span className="text-amber-500 font-bold text-sm">&#9733;</span>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-ink">Editor&apos;s Picks</h4>
              </div>
              <div className="flex flex-col gap-4">
                {secondaries.slice(0, 4).map((post, idx) => (
                  <div key={post.id} className="flex items-start gap-3 border-b border-brand-hairline/60 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs font-mono font-bold text-brand-link opacity-80">0{idx + 1}</span>
                    <div className="flex flex-col gap-1">
                      <h5 className="text-xs font-semibold text-brand-ink leading-snug hover:text-brand-link cursor-pointer line-clamp-2">
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-brand-mute">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {mockPosts.length > 3 && (
            <div className={`grid gap-6 pt-4 border-t border-brand-hairline ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
              {mockPosts.slice(3).map(post => (
                <div key={post.id} className="bg-white dark:bg-neutral-900 border border-brand-hairline rounded-lg overflow-hidden flex flex-col shadow-level-1 group hover:shadow-level-2 transition-all">
                  <div className="aspect-video relative overflow-hidden bg-brand-canvas-soft-2">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                    <h3 className="text-xs font-bold text-brand-ink leading-snug line-clamp-2">{post.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {layout === "masonry" && (
        autoScroll ? (
          <div className={`grid ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"} gap-6 h-[480px] overflow-hidden relative group/masonry`}>
            {(isMobile ? [0] : isTablet ? [0, 1] : [0, 1, 2]).map(colIdx => {
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
                      <div key={`${post.id}-${colIdx}-${idx}`} className="bg-white dark:bg-neutral-900 border border-brand-hairline rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col shrink-0">
                        <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                        </div>
                        <div className="p-5 flex flex-col gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                          <h3 className="text-sm font-bold text-brand-ink leading-snug">{post.title}</h3>
                          <p className="text-xs text-brand-body leading-relaxed line-clamp-3">{post.excerpt}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          mockPosts.length <= 2 ? (
            <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-6 justify-center`}>
              {mockPosts.map((post, idx) => {
                const aspectClasses = ["aspect-square", "aspect-[4/5]", "aspect-video"][idx % 3];
                return (
                  <div key={post.id} className="w-full max-w-[420px] bg-white dark:bg-neutral-900 border border-brand-hairline rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col">
                    <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                      <h3 className="text-sm font-bold text-brand-ink leading-snug">{post.title}</h3>
                      <p className="text-xs text-brand-body leading-relaxed line-clamp-3">{post.excerpt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          <div className={`${isMobile ? "columns-1" : isTablet ? "columns-2" : "columns-3"} gap-4 sm:gap-6 space-y-4 sm:space-y-6`}>
            {mockPosts.map((post, idx) => {
              const aspectClasses = ["aspect-square", "aspect-[4/5]", "aspect-video"][idx % 3];
              return (
                <div key={post.id} className="break-inside-avoid bg-white dark:bg-neutral-900 border border-brand-hairline rounded-xl overflow-hidden shadow-level-2 hover:shadow-level-3 transition-all flex flex-col">
                  <div className={`${aspectClasses} relative overflow-hidden bg-brand-canvas-soft-2`}>
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-link font-semibold">{post.category}</span>
                    <h3 className="text-sm font-bold text-brand-ink leading-snug">{post.title}</h3>
                    <p className="text-xs text-brand-body leading-relaxed line-clamp-3">{post.excerpt}</p>
                  </div>
                </div>
              );
            })}
          </div>
          )
        )
      )}
    </div>
  );
};