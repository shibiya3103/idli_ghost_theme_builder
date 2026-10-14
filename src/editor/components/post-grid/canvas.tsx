import React from "react";
import { BuilderBlock } from "@/types/theme";
import { getBackgroundStyle } from "../shared/background";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";

import { useEditorStore } from "@/store/editorStore";

export const CanvasElement = ({ block }: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) => {
  const deviceMode = useEditorStore((s) => s.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";
  const isTablet = deviceMode === "tablet";
  const p = block.props || {};
  const general = p.general || {};
  const postCard = p.postCard || {};
  const button = p.button || {};
  const appearance = p.appearance || {};
  const styles = block.styles || {};

  const spacing = p.spacing || {};

  const isDark = useCanvasDarkMode();
  const bgStyleObj = getBackgroundStyle(styles, appearance);

  const limit = general.limit || 3;
  const columns = general.columns || 3;
  const layoutStyle = general.layoutStyle || "grid";

  const showFeatureImage = postCard.showFeatureImage ?? true;
  const showPrimaryTag = postCard.showPrimaryTag ?? true;
  const showExcerpt = postCard.showExcerpt ?? true;

  const mockPosts = [
    { id: 1, title: "Building custom Ghost themes with Next.js", excerpt: "Learn how to establish an elegant AST rendering architecture for your static publication sites.", date: "August 20, 2026", readingTime: "4 min read", category: "Engineering", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80" },
    { id: 2, title: "Design languages that scale: Geist case study", excerpt: "How stark typography, 1px borders, and mesh gradients define developer branding aesthetics.", date: "August 18, 2026", readingTime: "6 min read", category: "Design", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80" },
    { id: 3, title: "Deploying modern edge stacks to global nodes", excerpt: "Optimizing startup speeds, resource footprints, and layout rendering algorithms.", date: "August 15, 2026", readingTime: "3 min read", category: "DevOps", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
    { id: 4, title: "Scaling PostgreSQL for real-time analytics", excerpt: "A deep dive into indexing strategies and query optimization for high-throughput systems.", date: "August 12, 2026", readingTime: "8 min read", category: "Database", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80" },
    { id: 5, title: "Mastering state machines in React", excerpt: "Moving beyond simple booleans to robust, predictable UI states using XState.", date: "August 10, 2026", readingTime: "5 min read", category: "Frontend", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
    { id: 6, title: "The future of edge computing", excerpt: "Why the next generation of web applications will execute closer to the user than ever before.", date: "August 05, 2026", readingTime: "7 min read", category: "Architecture", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" }
  ];

  let displayPosts = [...mockPosts];
  
  if (general.source === "tag" && general.tag) {
    displayPosts = displayPosts.filter(p => p.category.toLowerCase() === general.tag.toLowerCase());
    if (displayPosts.length === 0) {
      displayPosts = [{ id: 99, title: `No mock posts match tag '${general.tag}'`, excerpt: "Try 'design', 'engineering', or 'devops' to see mock data.", date: "Now", readingTime: "0 min read", category: general.tag, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" }];
    }
  } else if (general.source === "custom" && p.filter?.rules?.length > 0) {
    const rules = p.filter.rules as { field: string; value: string }[];
    const isAll = p.filter.combinator === "all";
    
    displayPosts = displayPosts.filter(post => {
      const matches = rules.map(rule => {
        if (rule.field === "tag") return post.category.toLowerCase() === rule.value.toLowerCase();
        return true; 
      });
      return isAll ? matches.every(Boolean) : matches.some(Boolean);
    });

    if (displayPosts.length === 0) {
      displayPosts = [{ id: 99, title: `No mock posts match your custom filter`, excerpt: "Try tagging rules with 'design', 'engineering', or 'devops'.", date: "Now", readingTime: "0 min read", category: "Filtered", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" }];
    }
  }

  displayPosts = displayPosts.slice(0, limit);

  let gridColsClass = "grid-cols-1";
  if (layoutStyle !== "list") {
    if (isMobile) {
      gridColsClass = "grid-cols-1";
    } else if (isTablet) {
      gridColsClass = "grid-cols-1 sm:grid-cols-2";
    } else {
      gridColsClass = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  }

  const isMagazine = layoutStyle === "magazine";
  const featurePost = displayPosts[0];
  const listPosts = displayPosts.slice(1);

  return (
    <div 
      className={`w-full flex flex-col items-center ${styles.backgroundType === "mesh" ? 'mesh-glow' : ''}`}
      style={{
        ...bgStyleObj,
        paddingTop: spacing.paddingTop || "4rem",
        paddingBottom: spacing.paddingBottom || "4rem"
      }}
    >
      <div className="w-full box-border" style={{ maxWidth: `min(${appearance.sectionWidth === 'wide' ? '1200px' : appearance.sectionWidth === 'narrow' ? '800px' : '100%'}, 100%)`, padding: isMobile ? "0 16px" : "0 24px" }}>
        {p.title && (
          <h2 className="text-3xl font-sans font-bold tracking-tight text-brand-ink mb-8 text-center">{p.title}</h2>
        )}
        
        {isMagazine && featurePost ? (
          <div className={`grid grid-cols-1 ${isMobile || isTablet ? "gap-6" : "lg:grid-cols-12 gap-8"} w-full`}>
            <article 
              className={`${isMobile || isTablet ? "w-full" : "lg:col-span-7"} border border-brand-hairline rounded-md overflow-hidden flex flex-col`}
              style={{ backgroundColor: appearance.backgroundColor || (isDark ? "var(--color-bg, #111111)" : "var(--color-bg, #ffffff)"), color: appearance.textColor || "var(--color-fg)" }}
            >
              {showFeatureImage && (
                <div className="w-full aspect-video bg-brand-canvas-soft-2 shrink-0">
                  <img src={featurePost.image} alt={featurePost.title} className="w-full h-full object-cover grayscale opacity-90" />
                </div>
              )}
              <div className="p-8 flex flex-col gap-3 flex-grow">
                {showPrimaryTag && (
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: appearance.accentColor || "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}>
                    {featurePost.category}
                  </span>
                )}
                <h3 className="text-2xl font-bold leading-tight">{featurePost.title}</h3>
                {showExcerpt && (
                  <p className="text-sm leading-relaxed opacity-80 mt-2">{featurePost.excerpt}</p>
                )}
              </div>
            </article>
            <div className={`${isMobile || isTablet ? "w-full" : "lg:col-span-5"} flex flex-col gap-6`}>
              {listPosts.map(post => (
                <article 
                  key={post.id} 
                  className="flex gap-4 border border-brand-hairline rounded-md overflow-hidden bg-brand-canvas"
                  style={{ backgroundColor: appearance.backgroundColor || (isDark ? "var(--color-bg, #111111)" : "var(--color-bg, #ffffff)"), color: appearance.textColor || "var(--color-fg)" }}
                >
                  {showFeatureImage && (
                    <div className="w-1/3 min-h-[120px] bg-brand-canvas-soft-2 shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col justify-center gap-1.5 flex-grow">
                    {showPrimaryTag && (
                      <span className="text-[9px] font-mono uppercase tracking-wider font-semibold" style={{ color: appearance.accentColor || "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}>
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold leading-snug">{post.title}</h3>
                    {showExcerpt && (
                      <p className="text-xs leading-relaxed opacity-80 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-4 sm:gap-6 lg:gap-8 w-full`}>
            {displayPosts.map(post => (
            <article 
              key={post.id} 
              className="post-card border border-brand-hairline rounded-md overflow-hidden flex flex-col bg-brand-canvas"
              style={{ 
                backgroundColor: appearance.backgroundColor || (isDark ? "var(--color-bg, #111111)" : "var(--color-bg, #ffffff)"),
                color: appearance.textColor || "var(--color-fg)"
              }}
            >
              {showFeatureImage && (
                <div className="post-card-image h-48 bg-brand-canvas-soft-2 shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale opacity-90" />
                </div>
              )}
              <div className="post-card-content p-5 flex flex-col gap-2 flex-grow">
                {showPrimaryTag && (
                  <span className="post-tag text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: appearance.accentColor || "var(--ghost-accent-color, var(--color-accent, #0070f3))" }}>
                    {post.category}
                  </span>
                )}
                <h3 className="post-title text-sm font-semibold">{post.title}</h3>
                {showExcerpt && (
                  <p className="post-excerpt text-xs leading-relaxed opacity-80">{post.excerpt}</p>
                )}
              </div>
            </article>
          ))}
          </div>
        )}
        
        {button.label && (
          <div className="mt-10 flex justify-center w-full">
            <a 
              href={button.url || "#"} 
              className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: appearance.accentColor || "var(--ghost-accent-color, var(--color-accent, #0070f3))",
                color: "#ffffff"
              }}
            >
              {button.label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};