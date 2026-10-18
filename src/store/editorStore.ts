import { create } from "zustand";
import { ThemeDocument, BuilderBlock, ThemePages, ThemeSettings } from "../types/theme";

export function generateId(prefix: string = "block"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export const STANDALONE_SECTION_TYPES = new Set([
  "section",
  "container",
  "header",
  "footer",
  "hero",
  "post-grid",
  "featured-posts",
  "post-content",
  "logo-cloud",
  "heading",
  "image",
  "text",
  "share",
  "team",
  "testimonials",
  "faq",
  "stats",
  "newsletter",
  "grid-gallery",
  "comments",
  "author-profile",
  "tag-archive",
  "tag-header",
  "page-detail",
  "error-view",
  "post-navigation",
  "related-posts",
  "columns",
  "divider",
  "spacer",
  "image-hotspots",
]);

export const DEFAULT_DESIGN_TOKENS = {
  colors: {
    background: "var(--color-bg)",
    foreground: "#171717",
    muted: "#888888",
    primary: "#171717",
    accent: "#0070f3",
  },
  typography: {
    bodyFont: "Geist, Inter, sans-serif",
    headingFont: "Geist, Inter, sans-serif",
    baseSize: "16px",
  },
  spacing: {
    sectionPadding: "64px",
    contentPadding: "16px",
  },
  radii: {
    cardRadius: "8px",
    buttonRadius: "100px",
  },
};

export const INITIAL_THEME_DOCUMENT: ThemeDocument = {
  metadata: {
    name: "Untitled Theme",
    version: "1.0.0",
    author: "Ghost Creator",
    description: "A clean, modern Ghost publication theme",
    themeId: "theme-primary",
  },
  settings: {
    containerWidth: 1200,
    fontFamily: "Geist",
    primaryColor: "#171717",
    accentColor: "#0070f3",
    designTokens: DEFAULT_DESIGN_TOKENS,
  },
  layouts: {
    header: "header-sec-1",
    footer: "footer-sec-3",
  },
  pages: {
    home: { sections: ["header-sec-1", "hero-sec-1", "featured-posts-sec", "post-grid-sec", "newsletter-sec", "footer-sec-3"] },
    post: { sections: ["header-sec-1", "post-content-sec", "post-author-sec", "post-nav-sec", "related-posts-sec", "comments-sec", "footer-sec-3"] },
    page: { sections: ["header-sec-1", "page-content-sec", "page-share-sec", "page-comments-sec", "page-newsletter-sec", "footer-sec-3"] },
    author: { sections: ["header-sec-1", "author-profile-sec", "post-grid-sec", "footer-sec-3"] },
    tag: { sections: ["header-sec-1", "tag-header-sec", "post-grid-sec", "footer-sec-3"] },
    error: { sections: ["header-sec-1", "error-main-sec", "footer-sec-3"] },
  },
  blocks: {
    "header-sec-1": {
      id: "header-sec-1",
      type: "header",
      props: {
        general: {
          siteTitle: "",
        },
        navItems: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Team", url: "/team" }
        ]
      },
      styles: { backgroundColor: "var(--color-bg)", paddingTop: "16px", paddingBottom: "16px" },
    },
    "footer-sec-3": {
      id: "footer-sec-3",
      type: "footer",
      props: {
        copyright: "© 2026 Ghost Theme Builder. Published with Ghost.",
        general: {
          layoutStyle: "Simple Minimal",
          showSecondaryNav: true,
          secondaryNavTitle: "More",
          showSocialIcons: true,
          socialPlatforms: ["facebook", "twitter", "instagram", "linkedin"],
          showSubscribeBox: false,
          showCopyright: true,
          customCopyrightText: "© 2026 Ghost Theme Builder. Published with Ghost.",
        },
        colors: {
          syncWithHeader: false,
          backgroundColor: "var(--color-bg)",
          textColor: "var(--color-fg)",
        },
        layout: {
          sectionWidth: "full",
          contentWidth: "standard",
        },
        spacing: {
          paddingTop: 40,
          paddingBottom: 40,
        },
      },
      styles: { backgroundColor: "var(--color-bg)", paddingTop: "40px", paddingBottom: "40px" },
    },

    // Home Page Blocks
    "hero-sec-1": {
      id: "hero-sec-1",
      type: "hero",
      props: {
        eyebrowText: "A Ghost Publication",
        title: "Thoughts, stories & ideas.",
        subtitle: "Insightful articles, thoughtful perspectives, and fresh ideas delivered directly to your feed.",
        buttonLabel: "Start Reading",
        buttonUrl: "#posts",
        showSecondaryButton: true,
        secondaryButtonLabel: "Subscribe",
        secondaryButtonUrl: "#newsletter",
        useSiteData: false,
        useCoverImageAsBackground: false,
      },
      styles: {
        backgroundColor: "var(--color-bg)",
        paddingTop: "80px",
        paddingBottom: "80px",
        layout: "center",
      },
    },
    "featured-posts-sec": {
      id: "featured-posts-sec",
      type: "featured-posts",
      props: {
        title: "Featured Highlights",
        heading: "Featured Highlights",
        description: "Hand-picked stories and top editorial selections from our writers.",
        layout: "split",
        limit: 3,
        autoScroll: false,
      },
      styles: {
        backgroundColor: "var(--color-bg)",
        paddingTop: "64px",
        paddingBottom: "64px",
      },
    },
    "post-grid-sec": {
      id: "post-grid-sec",
      type: "post-grid",
      props: { title: "Latest Stories", limit: 6, columns: 3 },
      styles: {
        backgroundColor: "var(--color-bg)",
        paddingTop: "64px",
        paddingBottom: "64px",
      },
    },
    "newsletter-sec": {
      id: "newsletter-sec",
      type: "newsletter",
      props: {
        title: "Subscribe to our publication",
        subtitle: "Get the latest articles and design insights delivered directly to your inbox.",
        buttonLabel: "Subscribe",
        placeholder: "you@example.com",
      },
      styles: {
        backgroundColor: "var(--color-canvas-soft, #fafafa)",
        paddingTop: "64px",
        paddingBottom: "64px",
        layout: "center",
      },
    },

    // Post Page Blocks
    "post-content-sec": {
      id: "post-content-sec",
      type: "post-content",
      props: {
        showTag: true,
        showPrimaryTag: true,
        showFeaturedFlag: true,
        showFeaturedBadge: true,
        showExcerpt: true,
        showByline: true,
        showAuthorAvatar: true,
        showPublishDate: true,
        showReadingTime: true,
        showFeatureImage: true,
        contentWidth: "regular",
      },
      styles: {},
    },
    "post-author-sec": {
      id: "post-author-sec",
      type: "author-profile",
      props: {
        name: "Alex Rivera",
        bio: "Founder & Lead Architect at Ghost Foundation. Dedicated to building minimalist, high-speed publication frameworks.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
        layoutStyle: "card",
      },
      styles: {},
    },
    "post-nav-sec": {
      id: "post-nav-sec",
      type: "post-navigation",
      props: { layoutStyle: "split", showImage: true, showExcerpt: false },
      styles: {},
    },
    "related-posts-sec": {
      id: "related-posts-sec",
      type: "related-posts",
      props: { heading: "You might also like", count: 3, showImage: true, showExcerpt: true },
      styles: {},
    },
    "post-related-sec": {
      id: "post-related-sec",
      type: "related-posts",
      props: { heading: "You might also like", count: 3, showImage: true, showExcerpt: true },
      styles: {},
    },
    "comments-sec": {
      id: "comments-sec",
      type: "comments",
      props: { heading: "Discussion", showCount: true },
      styles: {},
    },
    "post-comments-sec": {
      id: "post-comments-sec",
      type: "comments",
      props: { heading: "Discussion", showCount: true },
      styles: {},
    },

    // Static Page Blocks
    "page-content-sec": {
      id: "page-content-sec",
      type: "page-detail",
      props: {
        showTitle: true,
      },
      styles: {},
    },
    "page-share-sec": {
      id: "page-share-sec",
      type: "share",
      props: {
        buttonText: "Share this page",
        showIcon: true,
        variant: "pill",
        alignment: "center",
      },
      styles: {
        paddingTop: "16px",
        paddingBottom: "32px",
      },
    },
    "page-comments-sec": {
      id: "page-comments-sec",
      type: "comments",
      props: {
        heading: "Discussion",
        showCount: true,
      },
      styles: {},
    },
    "page-newsletter-sec": {
      id: "page-newsletter-sec",
      type: "newsletter",
      props: {
        title: "Subscribe to our publication",
        subtitle: "Get the latest articles and design insights delivered directly to your inbox.",
        buttonLabel: "Subscribe",
        placeholder: "you@example.com",
      },
      styles: {
        backgroundColor: "var(--color-canvas-soft, #fafafa)",
        paddingTop: "64px",
        paddingBottom: "64px",
        layout: "center",
      },
    },

    // Author Archive Blocks
    "author-profile-sec": {
      id: "author-profile-sec",
      type: "author-profile",
      props: {
        name: "Alex Rivera",
        bio: "Founder & Lead Architect at Ghost Foundation. Dedicated to building minimalist, high-speed publication frameworks.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
        location: "San Francisco, CA",
        website: "https://example.com",
        twitter: "@alexrivera",
        layoutStyle: "banner",
      },
      styles: {},
    },

    "author-posts-sec": {
      id: "author-posts-sec",
      type: "post-grid",
      props: { title: "Stories by Author", limit: 6, columns: 3 },
      styles: {},
    },

    // Tag Archive Blocks
    "tag-header-sec": {
      id: "tag-header-sec",
      type: "tag-header",
      props: {
        showFeatureImage: true,
        showDescription: true,
        showCount: true,
      },
      styles: {},
    },
    "tag-archive-sec": {
      id: "tag-archive-sec",
      type: "tag-archive",
      props: {
        title: "Engineering",
        description: "A comprehensive collection of software architecture patterns, developer tooling, and technical case studies.",
        layoutStyle: "banner",
        showCount: true,
      },
      styles: {},
    },
    "tag-posts-sec": {
      id: "tag-posts-sec",
      type: "post-grid",
      props: { title: "Stories under this topic", limit: 6, columns: 3 },
      styles: {},
    },

    // 404 Error Page Blocks
    "error-main-sec": {
      id: "error-main-sec",
      type: "error-view",
      props: {
        errorCode: "404",
        message: "Page Not Found",
        description: "The page you're looking for doesn't exist or has been moved.",
        homeLabel: "Back to Home",
      },
      styles: {},
    },
  },
};

interface EditorState {
  document: ThemeDocument;
  selectedBlockId: string | null;
  activePage: string;
  deviceMode: "desktop" | "tablet" | "mobile";
  past: ThemeDocument[];
  future: ThemeDocument[];

  isPreviewMode: boolean;
  isCodeMode: boolean;
  showShortcutsHelp: boolean;
  
  userId: string;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";

  previewColorMode: "light" | "dark";
  togglePreviewColorMode: () => void;
  setPreviewColorMode: (mode: "light" | "dark") => void;

  appThemeMode: "light" | "dark";
  toggleAppThemeMode: () => void;
  setAppThemeMode: (mode: "light" | "dark") => void;

  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  toggleLeftSidebar: (open?: boolean) => void;
  toggleRightSidebar: (open?: boolean) => void;
  canvasFitMode: "auto" | "100%";
  setCanvasFitMode: (mode: "auto" | "100%") => void;

  setDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
  setActivePage: (page: string) => void;
  selectBlock: (blockId: string | null) => void;
  
  togglePreviewMode: () => void;
  toggleCodeMode: () => void;
  toggleShortcutsHelp: (show?: boolean) => void;
  
  loadTheme: () => Promise<void>;
  saveTheme: () => Promise<void>;
  setUserId: (userId: string) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  setAccentColor: (accentColor: string) => void;
  
  createCustomPage: (slug: string) => void;
  duplicateCustomPage: (pageKey: string, newTitle: string) => void;
  updatePageTagFilter: (pageKey: string, tag: string) => void;
  addBlock: (type: string, parentId?: string) => void;
  insertBlockAt: (type: string, index: number, parentId?: string) => void;
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void;
  updateBlockStyles: (blockId: string, styles: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  unwrapBlock: (blockId: string) => void;
  wrapBlock: (blockId: string, wrapperType: "container" | "section" | "columns") => void;
  makeAdjacent: (blockId: string) => void;
  reorderBlocks: (sourceIndex: number, destinationIndex: number, parentId?: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  
  activeThemeId: string;
  setActiveThemeId: (themeId: string) => void;
  applyPageTemplate: (pageKey: string, templateId: string) => void;
  updateMetadata: (metadata: Partial<ThemeDocument["metadata"]>) => void;
  setDocument: (document: ThemeDocument, themeId?: string) => void;
  
  undo: () => void;
  redo: () => void;
  addAsset: (path: string, dataUri: string) => void;
}

import { componentRegistry } from "@/editor/components/registry";
import { PAGE_TEMPLATES } from "./templates";

const saveToHistory = (state: EditorState) => {
  return {
    past: [...state.past, JSON.parse(JSON.stringify(state.document))],
    future: [],
  };
};

const createNewBlock = (type: string): BuilderBlock => {
  const newId = generateId(type);
  const def = componentRegistry[type];
  return {
    id: newId,
    type,
    props: def ? JSON.parse(JSON.stringify(def.defaultProps)) : {},
    styles: def ? JSON.parse(JSON.stringify(def.defaultStyles)) : {},
    childrenIds: type === "section" || type === "container" || type === "columns" ? [] : undefined,
  };
};

const duplicateBlockRecursive = (blockId: string, blocks: Record<string, BuilderBlock>): { newId: string, clonedBlocks: Record<string, BuilderBlock> } => {
  const original = blocks[blockId];
  if (!original) return { newId: "", clonedBlocks: {} };
  
  const newId = generateId(original.type);
  const clone: BuilderBlock = {
    ...original,
    id: newId,
    props: JSON.parse(JSON.stringify(original.props)),
    styles: JSON.parse(JSON.stringify(original.styles)),
  };
  
  let newBlocks = { [newId]: clone };
  
  if (original.childrenIds) {
    const newChildrenIds: string[] = [];
    original.childrenIds.forEach((cid) => {
      const childResult = duplicateBlockRecursive(cid, blocks);
      newChildrenIds.push(childResult.newId);
      newBlocks = { ...newBlocks, ...childResult.clonedBlocks };
    });
    clone.childrenIds = newChildrenIds;
  }
  
  return { newId, clonedBlocks: newBlocks };
};

let autosaveTimeout: NodeJS.Timeout | null = null;

const triggerAutosave = (get: () => EditorState) => {
  if (autosaveTimeout) clearTimeout(autosaveTimeout);
  console.log("[Zustand Store] Triggering debounced autosave task in 400ms...");
  autosaveTimeout = setTimeout(() => {
    get().saveTheme();
  }, 400);
};

/**
 * Helper to check whether a block or any of its descendants is a header or footer.
 */
export const isHeaderOrFooterBlock = (
  blockId: string,
  blocks: Record<string, BuilderBlock>
): boolean => {
  const block = blocks[blockId];
  if (!block) return false;
  if (block.type === "header" || block.type === "footer") return true;
  if (block.childrenIds && block.childrenIds.length > 0) {
    return block.childrenIds.some((cid) => isHeaderOrFooterBlock(cid, blocks));
  }
  return false;
};

/**
 * Finds a layout block ID (header or footer) by searching the document blocks or page sections.
 */
export const findLayoutBlockId = (
  pages: ThemePages,
  blocks: Record<string, BuilderBlock>,
  type: "header" | "footer"
): string | null => {
  // 1. Direct block of type
  for (const block of Object.values(blocks)) {
    if (block.type === type) return block.id;
  }
  // 2. Section referencing type in children
  for (const page of Object.values(pages)) {
    for (const sid of page.sections || []) {
      const block = blocks[sid];
      if (block) {
        if (block.type === type) return sid;
        if (block.childrenIds) {
          for (const cid of block.childrenIds) {
            if (blocks[cid]?.type === type) return cid;
          }
        }
      }
    }
  }
  return null;
};

/**
 * Migrates a ThemeDocument to guarantee a valid `layouts` property
 * and strip header/footer blocks from page body sections.
 */
export function migrateThemeDocument(doc: ThemeDocument): ThemeDocument {
  const newBlocks = { ...doc.blocks };
  const newPages = { ...doc.pages };

  // Resolve header and footer layout references
  let headerId: string | null = doc.layouts?.header || null;
  let footerId: string | null = doc.layouts?.footer || null;

  if (!headerId || !newBlocks[headerId]) {
    headerId = findLayoutBlockId(newPages, newBlocks, "header");
  }
  if (!footerId || !newBlocks[footerId]) {
    footerId = findLayoutBlockId(newPages, newBlocks, "footer");
  }

  // If header or footer is a wrapper section containing a header/footer block, resolve to the actual component block
  if (headerId && newBlocks[headerId]?.type === "section" && newBlocks[headerId]?.childrenIds) {
    const childHdr = newBlocks[headerId].childrenIds!.find((cid) => newBlocks[cid]?.type === "header");
    if (childHdr) {
      headerId = childHdr;
    }
  }
  if (footerId && newBlocks[footerId]?.type === "section" && newBlocks[footerId]?.childrenIds) {
    const childFtr = newBlocks[footerId].childrenIds!.find((cid) => newBlocks[cid]?.type === "footer");
    if (childFtr) {
      footerId = childFtr;
    }
  }

  // If still missing, create default layout blocks
  if (!headerId) {
    headerId = "header-sec-1";
    newBlocks[headerId] = {
      id: headerId,
      type: "header",
      props: {},
      styles: { backgroundColor: "var(--color-bg)", paddingTop: "16px", paddingBottom: "16px" },
    };
  }
  if (!footerId) {
    footerId = "footer-sec-3";
    newBlocks[footerId] = {
      id: footerId,
      type: "footer",
      props: {
        copyright: "© 2026 Ghost Theme Builder. Published with Ghost.",
        general: {
          layoutStyle: "Simple Minimal",
          showSecondaryNav: true,
          secondaryNavTitle: "More",
          showSocialIcons: true,
          socialPlatforms: ["facebook", "twitter", "instagram", "linkedin"],
          showSubscribeBox: false,
          showCopyright: true,
          customCopyrightText: "© 2026 Ghost Theme Builder. Published with Ghost.",
        },
      },
      styles: { backgroundColor: "var(--color-bg)", paddingTop: "40px", paddingBottom: "40px" },
    };
  } else if (newBlocks[footerId]) {
    const ftr = newBlocks[footerId];
    const ftrProps = (ftr.props || {}) as Record<string, unknown>;
    const ftrGeneral = (ftrProps.general || {}) as Record<string, unknown>;
    newBlocks[footerId] = {
      ...ftr,
      props: {
        ...ftrProps,
        copyright: (ftrGeneral.customCopyrightText as string) || (ftrProps.copyright as string) || "© 2026 Ghost Theme Builder. Published with Ghost.",
        general: {
          layoutStyle: (ftrGeneral.layoutStyle as string) || "Simple Minimal",
          showSecondaryNav: ftrGeneral.showSecondaryNav !== false,
          secondaryNavTitle: (ftrGeneral.secondaryNavTitle as string) || "More",
          showSocialIcons: ftrGeneral.showSocialIcons !== false,
          socialPlatforms: Array.isArray(ftrGeneral.socialPlatforms) && ftrGeneral.socialPlatforms.length > 0
            ? ftrGeneral.socialPlatforms
            : ["facebook", "twitter", "instagram", "linkedin"],
          showSubscribeBox: ftrGeneral.showSubscribeBox === true,
          showCopyright: ftrGeneral.showCopyright !== false,
          customCopyrightText: (ftrGeneral.customCopyrightText as string) || (ftrProps.copyright as string) || "© 2026 Ghost Theme Builder. Published with Ghost.",
          socialUrls: (ftrGeneral.socialUrls as Record<string, string>) || (ftrProps.socialUrls as Record<string, string>) || {},
        },
      },
    };
  }

  // Strip all header/footer block references from page sections
  Object.keys(newPages).forEach((pageKey) => {
    const page = newPages[pageKey];
    if (!page?.sections) return;

    const filteredSections = page.sections.filter((sid) => {
      if (sid === headerId || sid === footerId) return false;
      if (isHeaderOrFooterBlock(sid, newBlocks)) return false;
      return true;
    });

    newPages[pageKey] = {
      ...page,
      sections: filteredSections,
    };
  });

  // Ensure default page templates exist and have standard blocks
  const initialBlocks = INITIAL_THEME_DOCUMENT.blocks;

  // Home page migration: ensure publication hero, featured-posts, post-grid, and newsletter
  const isOldSaasHome =
    newBlocks["hero-heading-1"]?.props?.text === "Build and deploy on the AI Cloud." ||
    newBlocks["hero-sec-1"]?.type === "section" ||
    (newPages.home?.sections && (
      newPages.home.sections.includes("posts-sec-2") ||
      (newPages.home.sections.length <= 2 && newPages.home.sections.includes("hero-sec-1") && !newPages.home.sections.includes("post-grid-sec"))
    ));

  if (isOldSaasHome) {
    newBlocks["hero-sec-1"] = JSON.parse(JSON.stringify(initialBlocks["hero-sec-1"]));
    delete newBlocks["hero-container-1"];
    delete newBlocks["hero-heading-1"];
    delete newBlocks["hero-text-1"];
    delete newBlocks["hero-cta-row-1"];
    delete newBlocks["hero-btn-primary"];
    delete newBlocks["hero-btn-secondary"];
    delete newBlocks["posts-sec-2"];
    delete newBlocks["posts-grid-1"];

    newPages.home = {
      sections: ["hero-sec-1", "featured-posts-sec", "post-grid-sec", "newsletter-sec"],
    };
  } else if (!newPages.home || !newPages.home.sections || newPages.home.sections.length === 0) {
    newPages.home = {
      sections: ["hero-sec-1", "featured-posts-sec", "post-grid-sec", "newsletter-sec"],
    };
  } else {
    // If user has home page but post-grid is missing, Ghost functionally requires a post feed
    const hasPostFeed = newPages.home.sections.some(
      (sid) => newBlocks[sid]?.type === "post-grid"
    );
    if (!hasPostFeed) {
      newPages.home.sections.push("post-grid-sec");
    }
  }

  // Post page migration
  if (!newPages.post || !newPages.post.sections || newPages.post.sections.length === 0) {
    newPages.post = { sections: ["post-content-sec", "post-author-sec", "post-nav-sec", "related-posts-sec", "comments-sec"] };
  } else {
    // Deduplicate post-navigation blocks if multiple exist on post page
    const navBlockIds = newPages.post.sections.filter(
      (sid) => newBlocks[sid]?.type === "post-navigation" || sid === "post-nav-sec" || sid.startsWith("post-navigation")
    );
    if (navBlockIds.length > 1) {
      // Keep custom post-navigation block (e.g. post-navigation-yryt5t) over default post-nav-sec
      const keptNavId = navBlockIds.find((id) => id !== "post-nav-sec") || navBlockIds[navBlockIds.length - 1];
      newPages.post.sections = newPages.post.sections.filter(
        (sid) => !(newBlocks[sid]?.type === "post-navigation" || sid === "post-nav-sec" || sid.startsWith("post-navigation")) || sid === keptNavId
      );
      // Remove default post-nav-sec if custom block is kept instead
      if (keptNavId !== "post-nav-sec" && newBlocks["post-nav-sec"]) {
        delete newBlocks["post-nav-sec"];
      }
    }

    const hasPostContent = newPages.post.sections.some(
      (sid) => newBlocks[sid]?.type === "post-content"
    );
    if (!hasPostContent) {
      newPages.post.sections = [
        "post-content-sec",
        "post-author-sec",
        "post-nav-sec",
        "related-posts-sec",
        "comments-sec",
      ];
    } else {
      const postTypes = newPages.post.sections.map((sid) => newBlocks[sid]?.type);
      if (!postTypes.includes("author-profile")) {
        newPages.post.sections.push("post-author-sec");
      }
      if (!postTypes.includes("post-navigation")) {
        newPages.post.sections.push("post-nav-sec");
      }
      if (!postTypes.includes("related-posts")) {
        newPages.post.sections.push("related-posts-sec");
      }
      if (!postTypes.includes("comments")) {
        newPages.post.sections.push("comments-sec");
      }
    }
  }

  // Author page migration: author-profile + post-grid
  if (!newPages.author || !newPages.author.sections || newPages.author.sections.length === 0) {
    newPages.author = { sections: ["author-profile-sec", "post-grid-sec"] };
  } else {
    const hasAuthorProfile = newPages.author.sections.some(
      (sid) => newBlocks[sid]?.type === "author-profile"
    );
    if (!hasAuthorProfile) {
      newPages.author.sections.unshift("author-profile-sec");
    }
    const hasPostGrid = newPages.author.sections.some(
      (sid) => newBlocks[sid]?.type === "post-grid"
    );
    if (!hasPostGrid) {
      newPages.author.sections.push("post-grid-sec");
    }
  }

  // Tag page migration: tag-header + post-grid
  if (!newPages.tag || !newPages.tag.sections || newPages.tag.sections.length === 0) {
    newPages.tag = { sections: ["tag-header-sec", "post-grid-sec"] };
  } else {
    const archiveIndex = newPages.tag.sections.findIndex(
      (sid) => sid === "tag-archive-sec" || newBlocks[sid]?.type === "tag-archive"
    );
    if (archiveIndex !== -1) {
      newPages.tag.sections[archiveIndex] = "tag-header-sec";
    }
    const hasTagHeader = newPages.tag.sections.some(
      (sid) => newBlocks[sid]?.type === "tag-header"
    );
    if (!hasTagHeader) {
      newPages.tag.sections.unshift("tag-header-sec");
    }
    const hasPostGrid = newPages.tag.sections.some(
      (sid) => newBlocks[sid]?.type === "post-grid"
    );
    if (!hasPostGrid) {
      newPages.tag.sections.push("post-grid-sec");
    }
  }

  // Page migration: ensure default page components (page-detail, share, comments, newsletter)
  if (!newPages.page || !newPages.page.sections || newPages.page.sections.length === 0) {
    newPages.page = {
      sections: ["page-content-sec", "page-share-sec", "page-comments-sec", "page-newsletter-sec"],
    };
  } else {
    const pageTypes = newPages.page.sections.map((sid) => newBlocks[sid]?.type);
    if (!pageTypes.includes("page-detail") && !newPages.page.sections.includes("page-content-sec")) {
      newPages.page.sections.unshift("page-content-sec");
    }
    if (!pageTypes.includes("share") && !newPages.page.sections.includes("page-share-sec")) {
      newPages.page.sections.push("page-share-sec");
    }
    if (!pageTypes.includes("comments") && !newPages.page.sections.includes("page-comments-sec")) {
      newPages.page.sections.push("page-comments-sec");
    }
    if (!pageTypes.includes("newsletter") && !newPages.page.sections.includes("page-newsletter-sec")) {
      newPages.page.sections.push("page-newsletter-sec");
    }
  }

  // Error page migration
  if (!newPages.error || !newPages.error.sections || newPages.error.sections.length === 0) {
    newPages.error = { sections: [...INITIAL_THEME_DOCUMENT.pages.error.sections] };
  }

  // Ensure any newly referenced block IDs exist in newBlocks and remove duplicates
  Object.keys(newPages).forEach((pageKey) => {
    // Remove duplicates to prevent React duplicate key errors
    newPages[pageKey].sections = Array.from(new Set(newPages[pageKey].sections));
    
    newPages[pageKey].sections.forEach((sid) => {
      if (!newBlocks[sid] && initialBlocks[sid]) {
        newBlocks[sid] = JSON.parse(JSON.stringify(initialBlocks[sid]));
      }
    });
  });

  return {
    ...doc,
    layouts: {
      header: headerId,
      footer: footerId,
    },
    blocks: newBlocks,
    pages: newPages,
  };
}

export function unwrapStandaloneSections(doc: ThemeDocument): ThemeDocument {
  const migrated = migrateThemeDocument(doc);
  const newBlocks = { ...migrated.blocks };
  const newPages = { ...migrated.pages };
  let modified = false;

  Object.keys(newPages).forEach((pageKey) => {
    const page = newPages[pageKey];
    if (!page?.sections) return;

    const newSections: string[] = [];
    page.sections.forEach((sid) => {
      const block = newBlocks[sid];
      // If it's a section with only a single child of type "image" or "heading"
      if (
        block &&
        block.type === "section" &&
        block.childrenIds &&
        block.childrenIds.length === 1
      ) {
        const childId = block.childrenIds[0];
        const child = newBlocks[childId];
        if (child && (child.type === "image" || child.type === "heading" || child.type === "text" || child.type === "share")) {
          newSections.push(childId);
          delete newBlocks[sid];
          modified = true;
          return;
        }
      }
      newSections.push(sid);
    });

    if (modified) {
      newPages[pageKey] = { ...page, sections: newSections };
    }
  });

  return modified ? { ...migrated, blocks: newBlocks, pages: newPages } : migrated;
}

interface LocalStorageThemeItem {
  id: string;
  name?: string;
  author?: string;
  version?: string;
  description?: string;
  updatedAt?: string;
  document?: ThemeDocument;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: unwrapStandaloneSections(INITIAL_THEME_DOCUMENT),
  selectedBlockId: null,
  activePage: "home",
  deviceMode: "desktop",
  past: [],
  future: [],
  isPreviewMode: false,
  isCodeMode: false,
  showShortcutsHelp: false,
  userId: "default-builder-user",
  activeThemeId: "theme-primary",
  isSaving: false,
  saveStatus: "idle",

  previewColorMode: "light",
  togglePreviewColorMode: () => set((state) => {
    const next = state.previewColorMode === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
    return { previewColorMode: next };
  }),
  setPreviewColorMode: (mode) => set(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
    return { previewColorMode: mode };
  }),

  appThemeMode: "light",
  toggleAppThemeMode: () => set((state) => {
    const next = state.appThemeMode === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("idli_app_theme_mode", next);
      } catch {}
    }
    return { appThemeMode: next };
  }),
  setAppThemeMode: (mode) => set(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("idli_app_theme_mode", mode);
      } catch {}
    }
    return { appThemeMode: mode };
  }),

  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  toggleLeftSidebar: (open) => set((state) => ({ isLeftSidebarOpen: open !== undefined ? open : !state.isLeftSidebarOpen })),
  toggleRightSidebar: (open) => set((state) => ({ isRightSidebarOpen: open !== undefined ? open : !state.isRightSidebarOpen })),
  canvasFitMode: "auto",
  setCanvasFitMode: (mode) => set({ canvasFitMode: mode }),

  setUserId: (userId) => {
    console.log(`[Zustand Store] Active userId set to: "${userId}"`);
    set({ userId });
  },
  setActiveThemeId: (themeId) => set({ activeThemeId: themeId }),
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setActivePage: (page) => set({ activePage: page, selectedBlockId: null }),
  selectBlock: (blockId) => set({ selectedBlockId: blockId }),

  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode, selectedBlockId: null })),
  toggleCodeMode: () => set((state) => ({ isCodeMode: !state.isCodeMode })),
  toggleShortcutsHelp: (show) => set((state) => ({ showShortcutsHelp: show !== undefined ? show : !state.showShortcutsHelp })),

  loadTheme: async () => {
    try {
      const { userId, activeThemeId } = get();
      // If we are actively editing a user-created local theme, don't overwrite it with default db record
      if (activeThemeId && activeThemeId !== "theme-primary") {
        console.log(`[Zustand Store] loadTheme skipped for active custom theme: "${activeThemeId}"`);
        return;
      }
      console.log(`[Zustand Store] loadTheme initiated for userId: "${userId}"`);
      const res = await fetch(`/api/theme?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.document) {
        console.log(`[Zustand Store] loadTheme completed. AST document successfully hydrated.`);
        const unwrappedDoc = unwrapStandaloneSections(data.document);
        const dbThemeId = unwrappedDoc.metadata?.themeId;
        if (dbThemeId && activeThemeId && dbThemeId !== activeThemeId) {
          console.log(`[Zustand Store] Skipping loadTheme: db themeId "${dbThemeId}" does not match active themeId "${activeThemeId}"`);
          return;
        }
        set({ document: unwrappedDoc, saveStatus: "saved" });
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("ghost_user_themes_v2");
            if (stored) {
              const parsed: LocalStorageThemeItem[] = JSON.parse(stored);
              const targetThemeId = dbThemeId || activeThemeId;
              const idx = parsed.findIndex((t: LocalStorageThemeItem) => t.id === targetThemeId);
              if (idx >= 0) {
                parsed[idx].document = unwrappedDoc;
                parsed[idx].name = unwrappedDoc.metadata?.name || parsed[idx].name;
                parsed[idx].author = unwrappedDoc.metadata?.author || parsed[idx].author;
                parsed[idx].version = unwrappedDoc.metadata?.version || parsed[idx].version;
                parsed[idx].description = unwrappedDoc.metadata?.description || parsed[idx].description;
                parsed[idx].updatedAt = "Just now";
                localStorage.setItem("ghost_user_themes_v2", JSON.stringify(parsed));
              }
            }
          } catch {}
        }
      } else {
        console.log(`[Zustand Store] loadTheme completed. No layout record found, using defaults.`);
      }
    } catch (error) {
      console.error("[Zustand Store] loadTheme task failed:", error);
    }
  },

  saveTheme: async () => {
    try {
      const { userId, document, activeThemeId } = get();
      console.log(`[Zustand Store] saveTheme task initiated for userId: "${userId}"`);
      set({ isSaving: true, saveStatus: "saving" });
      
      const docWithThemeId = {
        ...document,
        metadata: {
          ...document.metadata,
          themeId: activeThemeId,
        },
      };

      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, document: docWithThemeId }),
      });
      
      const data = await res.json();
      if (data.success) {
        console.log("[Zustand Store] saveTheme completed successfully.");
        set({ isSaving: false, saveStatus: "saved" });
      } else {
        console.warn("[Zustand Store] saveTheme returned validation errors.");
        set({ isSaving: false, saveStatus: "error" });
      }

      // Also sync into localStorage so dashboard stays instantly up to date
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("ghost_user_themes_v2");
          if (stored) {
            const parsed: LocalStorageThemeItem[] = JSON.parse(stored);
            const idx = parsed.findIndex((t: LocalStorageThemeItem) => t.id === activeThemeId);
            if (idx >= 0) {
              parsed[idx].document = document;
              parsed[idx].name = document.metadata?.name || parsed[idx].name;
              parsed[idx].author = document.metadata?.author || parsed[idx].author;
              parsed[idx].version = document.metadata?.version || parsed[idx].version;
              parsed[idx].description = document.metadata?.description || parsed[idx].description;
              parsed[idx].updatedAt = "Just now";
              localStorage.setItem("ghost_user_themes_v2", JSON.stringify(parsed));
            }
          }
        } catch {}
      }
    } catch (error) {
      console.error("[Zustand Store] saveTheme task failed:", error);
      set({ isSaving: false, saveStatus: "error" });
    }
  },

  updateMetadata: (metadata) => set((state) => {
    const historyUpdate = saveToHistory(state);
    const newDoc = {
      ...state.document,
      metadata: {
        ...state.document.metadata,
        ...metadata,
      },
      blocks: {
        ...state.document.blocks,
      },
    };

    if (metadata.name && newDoc.blocks && newDoc.blocks["header-sec-1"]) {
      const curTitle = newDoc.blocks["header-sec-1"].props?.general?.siteTitle;
      if (!curTitle || curTitle === "My Ghost Theme" || curTitle === state.document.metadata?.name) {
        newDoc.blocks["header-sec-1"] = {
          ...newDoc.blocks["header-sec-1"],
          props: {
            ...newDoc.blocks["header-sec-1"].props,
            general: {
              ...newDoc.blocks["header-sec-1"].props?.general,
              siteTitle: metadata.name,
            },
          },
        };
      }
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ghost_user_themes_v2");
        if (stored) {
          const parsed: LocalStorageThemeItem[] = JSON.parse(stored);
          const idx = parsed.findIndex((t: LocalStorageThemeItem) => t.id === state.activeThemeId);
          if (idx >= 0) {
            parsed[idx].document = newDoc;
            if (metadata.name) parsed[idx].name = metadata.name;
            if (metadata.author) parsed[idx].author = metadata.author;
            if (metadata.version) parsed[idx].version = metadata.version;
            if (metadata.description !== undefined) parsed[idx].description = metadata.description;
            parsed[idx].updatedAt = "Just now";
            localStorage.setItem("ghost_user_themes_v2", JSON.stringify(parsed));
          }
        }
      } catch {}
    }

    return {
      ...historyUpdate,
      document: newDoc,
    };
  }),

  setDocument: (document, themeId) => set((state) => {
    const historyUpdate = saveToHistory(state);
    const migratedDoc = unwrapStandaloneSections(document);
    return {
      ...historyUpdate,
      document: migratedDoc,
      selectedBlockId: null,
      activePage: "home",
      ...(themeId ? { activeThemeId: themeId } : {}),
    };
  }),

  createCustomPage: (slug) => set((state) => {
    let cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleanSlug.startsWith("custom-")) {
      cleanSlug = `custom-${cleanSlug}`;
    }

    if (state.document.pages[cleanSlug]) return {}; 

    const historyUpdate = saveToHistory(state);

    const customSecId = generateId("section");
    const customContentId = generateId("container");
    const customHeadingId = generateId("heading");

    const newBlocks = {
      ...state.document.blocks,
      [customSecId]: {
        id: customSecId,
        type: "section",
        props: {},
        styles: { paddingTop: "96px", paddingBottom: "96px", backgroundColor: "var(--color-bg)" },
        childrenIds: [customContentId],
      },
      [customContentId]: {
        id: customContentId,
        type: "container",
        props: {},
        styles: { textAlign: "center" },
        childrenIds: [customHeadingId],
      },
      [customHeadingId]: {
        id: customHeadingId,
        type: "heading",
        props: { text: `Custom Page Template: ${cleanSlug}`, level: 1 },
        styles: { fontSize: "36px", marginBottom: "16px" },
      },
    };

    const newPages = {
      ...state.document.pages,
      [cleanSlug]: {
        sections: [customSecId],
      },
    };

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        blocks: newBlocks,
        pages: newPages,
      },
      activePage: cleanSlug,
      selectedBlockId: customHeadingId,
    };
  }),

  duplicateCustomPage: (pageKey, newTitle) => set((state) => {
    let cleanSlug = newTitle.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleanSlug.startsWith("custom-")) {
      cleanSlug = `custom-${cleanSlug}`;
    }
    if (state.document.pages[cleanSlug]) return {};

    const historyUpdate = saveToHistory(state);
    const sourcePage = state.document.pages[pageKey];
    if (!sourcePage) return {};

    const newBlocks = { ...state.document.blocks };
    const newSections: string[] = [];

    sourcePage.sections.forEach((sid) => {
      if (
        sid === state.document.layouts?.header ||
        sid === state.document.layouts?.footer ||
        isHeaderOrFooterBlock(sid, state.document.blocks)
      ) {
        return;
      }
      const { newId, clonedBlocks } = duplicateBlockRecursive(sid, newBlocks);
      Object.assign(newBlocks, clonedBlocks);
      newSections.push(newId);
    });

    const newPages = {
      ...state.document.pages,
      [cleanSlug]: {
        sections: newSections,
        tagFilter: sourcePage.tagFilter || undefined,
      },
    };

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        blocks: newBlocks,
        pages: newPages,
      },
      activePage: cleanSlug,
      selectedBlockId: null,
    };
  }),

  updatePageTagFilter: (pageKey, tag) => set((state) => {
    const page = state.document.pages[pageKey];
    if (!page) return {};

    const historyUpdate = saveToHistory(state);
    const newPages = {
      ...state.document.pages,
      [pageKey]: {
        ...page,
        tagFilter: tag,
      },
    };

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        pages: newPages,
      },
    };
  }),

  applyPageTemplate: (pageKey, templateId) => set((state) => {
    const template = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return {};
    
    const page = state.document.pages[pageKey];
    if (!page) return {};

    const historyUpdate = saveToHistory(state);
    
    // Find header and footer from current page to preserve them
    let headerId: string | null = null;
    let footerId: string | null = null;
    
    const isHeaderOrFooter = (blockId: string): { isHeader: boolean; isFooter: boolean } => {
      const block = state.document.blocks[blockId];
      if (!block) return { isHeader: false, isFooter: false };
      if (block.type === "header") return { isHeader: true, isFooter: false };
      if (block.type === "footer") return { isHeader: false, isFooter: true };
      if (block.childrenIds) {
        for (const cid of block.childrenIds) {
          const res = isHeaderOrFooter(cid);
          if (res.isHeader || res.isFooter) return res;
        }
      }
      return { isHeader: false, isFooter: false };
    };

    page.sections.forEach((sid) => {
      const res = isHeaderOrFooter(sid);
      if (res.isHeader) headerId = sid;
      if (res.isFooter) footerId = sid;
    });

    // Generate new template blocks
    const { sections, blocks } = template.generateBlocks();
    
    const newSections = [...sections];
    if (headerId) newSections.unshift(headerId);
    if (footerId) newSections.push(footerId);

    const newBlocks = { ...state.document.blocks, ...blocks };
    
    // Remove old sections that belonged to this page (excluding header/footer and shared blocks across other pages if any, 
    // but for simplicity we can just leave them in blocks dict as orphaned, or we can rely on standard cleanup. 
    // Orphaned blocks won't break the render, they just take up a tiny bit of state memory.)

    const newPages = {
      ...state.document.pages,
      [pageKey]: {
        ...page,
        sections: newSections,
      }
    };

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        blocks: newBlocks,
        pages: newPages,
      },
      selectedBlockId: null, // Clear selection
    };
  }),

  addBlock: (type, parentId) => set((state) => {
    if (type === "header" || type === "footer") return {};
    const historyUpdate = saveToHistory(state);
    const newBlock = createNewBlock(type);
    const newId = newBlock.id;
    const newBlocks = { ...state.document.blocks, [newId]: newBlock };
    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;

    if (parentId && state.document.blocks[parentId]) {
      const parent = { ...state.document.blocks[parentId] };
      parent.childrenIds = [...(parent.childrenIds || []), newId];
      newBlocks[parentId] = parent;
    } else {
      if (!STANDALONE_SECTION_TYPES.has(type)) {
        const autoSectionId = generateId("section");
        newBlocks[autoSectionId] = {
          id: autoSectionId,
          type: "section",
          props: {},
          styles: { paddingTop: "48px", paddingBottom: "48px" },
          childrenIds: [newId],
        };
        newPages[state.activePage].sections = [...newPages[state.activePage].sections, autoSectionId];
      } else {
        newPages[state.activePage].sections = [...newPages[state.activePage].sections, newId];
      }
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: newId,
    };
  }),

  insertBlockAt: (type, index, parentId) => set((state) => {
    if (type === "header" || type === "footer") return {};
    const historyUpdate = saveToHistory(state);
    const newBlock = createNewBlock(type);
    const newId = newBlock.id;
    const newBlocks = { ...state.document.blocks, [newId]: newBlock };
    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;

    if (parentId && state.document.blocks[parentId]) {
      const parent = { ...state.document.blocks[parentId] };
      const childrenIds = [...(parent.childrenIds || [])];
      childrenIds.splice(index, 0, newId);
      parent.childrenIds = childrenIds;
      newBlocks[parentId] = parent;
    } else {
      if (!STANDALONE_SECTION_TYPES.has(type)) {
        const autoSectionId = generateId("section");
        newBlocks[autoSectionId] = {
          id: autoSectionId,
          type: "section",
          props: {},
          styles: { paddingTop: "48px", paddingBottom: "48px" },
          childrenIds: [newId],
        };
        const sections = [...newPages[state.activePage].sections];
        sections.splice(index, 0, autoSectionId);
        newPages[state.activePage].sections = sections;
      } else {
        const sections = [...newPages[state.activePage].sections];
        sections.splice(index, 0, newId);
        newPages[state.activePage].sections = sections;
      }
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: newId,
    };
  }),

  moveBlock: (activeId, overId) => set((state) => {
    if (activeId === overId) return {};
    const historyUpdate = saveToHistory(state);

    const newBlocks = { ...state.document.blocks };
    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;

    const findParent = (id: string): { parentId: string | null; isRoot: boolean; index: number } => {
      const rootIndex = newPages[state.activePage].sections.indexOf(id);
      if (rootIndex !== -1) {
        return { parentId: null, isRoot: true, index: rootIndex };
      }
      
      for (const pid of Object.keys(newBlocks)) {
        const block = newBlocks[pid];
        if (block.childrenIds) {
          const idx = block.childrenIds.indexOf(id);
          if (idx !== -1) {
            return { parentId: pid, isRoot: false, index: idx };
          }
        }
      }
      return { parentId: null, isRoot: false, index: -1 };
    };

    const activeInfo = findParent(activeId);
    const overInfo = findParent(overId);

    if (activeInfo.index === -1) return {};

    if (activeInfo.isRoot) {
      newPages[state.activePage].sections.splice(activeInfo.index, 1);
    } else if (activeInfo.parentId) {
      const parent = { ...newBlocks[activeInfo.parentId] };
      parent.childrenIds = (parent.childrenIds || []).filter(id => id !== activeId);
      newBlocks[activeInfo.parentId] = parent;
    }

    // If dropping directly onto an insertion slot
    if (overId.startsWith("drop-slot-")) {
      const slotParts = overId.replace("drop-slot-", "").split("-");
      if (slotParts.length === 1) {
        const slotIdx = parseInt(slotParts[0], 10);
        const sections = [...newPages[state.activePage].sections];
        sections.splice(isNaN(slotIdx) ? sections.length : slotIdx, 0, activeId);
        newPages[state.activePage].sections = sections;
      } else {
        const slotIdx = parseInt(slotParts[slotParts.length - 1], 10);
        const slotParentId = slotParts.slice(0, -1).join("-");
        if (newBlocks[slotParentId]) {
          const parent = { ...newBlocks[slotParentId] };
          const childrenIds = [...(parent.childrenIds || [])];
          childrenIds.splice(isNaN(slotIdx) ? childrenIds.length : slotIdx, 0, activeId);
          parent.childrenIds = childrenIds;
          newBlocks[slotParentId] = parent;
        }
      }
      setTimeout(() => triggerAutosave(get), 0);
      return {
        ...historyUpdate,
        document: { ...state.document, blocks: newBlocks, pages: newPages }
      };
    }

    const targetIndex = overInfo.index === -1 ? 0 : overInfo.index;

    // Check if dropping onto a layout container directly
    const overBlock = newBlocks[overId];
    const isTargetLayoutContainer =
      overBlock &&
      (overBlock.type === "section" || overBlock.type === "container" || overBlock.type === "columns") &&
      !(newBlocks[activeId]?.type === "section" && overBlock.type === "section");

    if (isTargetLayoutContainer) {
      // Append inside the target layout container
      const parent = { ...overBlock };
      const childrenIds = [...(parent.childrenIds || [])];
      childrenIds.push(activeId);
      parent.childrenIds = childrenIds;
      newBlocks[overId] = parent;
    } else if (overInfo.parentId && newBlocks[overInfo.parentId]) {
      // Insert adjacent to sibling child inside container
      const parent = { ...newBlocks[overInfo.parentId] };
      const childrenIds = [...(parent.childrenIds || [])];
      childrenIds.splice(targetIndex, 0, activeId);
      parent.childrenIds = childrenIds;
      newBlocks[overInfo.parentId] = parent;
    } else {
      // Dropping at root page level
      const sections = [...newPages[state.activePage].sections];
      sections.splice(targetIndex, 0, activeId);
      newPages[state.activePage].sections = sections;
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages }
    };
  }),

  updateBlockProps: (blockId, props) => set((state) => {
    if (!state.document.blocks[blockId]) return {};
    const historyUpdate = saveToHistory(state);
    
    const updatedBlock = {
      ...state.document.blocks[blockId],
      props: {
        ...state.document.blocks[blockId].props,
        ...props,
      },
    };

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        blocks: {
          ...state.document.blocks,
          [blockId]: updatedBlock,
        },
      },
    };
  }),

  addAsset: (path, dataUri) => set((state) => {
    const newAssets = { ...(state.document.assets || {}), [path]: dataUri };
    return {
      document: { ...state.document, assets: newAssets }
    };
  }),

  updateThemeSettings: (settingsUpdate) => set((state) => {
    const historyUpdate = saveToHistory(state);
    const currentSettings = state.document.settings;
    const newSettings = { ...currentSettings, ...settingsUpdate };
    if (settingsUpdate.accentColor) {
      newSettings.designTokens = {
        ...newSettings.designTokens,
        colors: {
          ...newSettings.designTokens.colors,
          accent: settingsUpdate.accentColor,
        },
      };
    }
    setTimeout(() => triggerAutosave(get), 0);
    return {
      ...historyUpdate,
      document: {
        ...state.document,
        settings: newSettings,
      },
    };
  }),

  setAccentColor: (accentColor) => {
    get().updateThemeSettings({ accentColor });
  },

  updateBlockStyles: (blockId, styles) => set((state) => {
    if (!state.document.blocks[blockId]) return {};
    const historyUpdate = saveToHistory(state);
    
    const updatedBlock = {
      ...state.document.blocks[blockId],
      styles: {
        ...state.document.blocks[blockId].styles,
        ...styles,
      },
    };

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: {
        ...state.document,
        blocks: { ...state.document.blocks, [blockId]: updatedBlock },
      },
    };
  }),

  deleteBlock: (blockId) => set((state) => {
    if (
      !state.document.blocks[blockId] ||
      state.document.layouts?.header === blockId ||
      state.document.layouts?.footer === blockId ||
      state.document.blocks[blockId]?.type === "header" ||
      state.document.blocks[blockId]?.type === "footer"
    ) {
      return {};
    }
    const historyUpdate = saveToHistory(state);

    const newBlocks = { ...state.document.blocks };
    delete newBlocks[blockId];

    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;
    newPages[state.activePage].sections = newPages[state.activePage].sections.filter(id => id !== blockId);

    Object.keys(newBlocks).forEach((id) => {
      const block = newBlocks[id];
      if (block.childrenIds && block.childrenIds.includes(blockId)) {
        newBlocks[id] = {
          ...block,
          childrenIds: block.childrenIds.filter(cid => cid !== blockId),
        };
      }
    });

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
    };
  }),

  duplicateBlock: (blockId) => set((state) => {
    if (
      !state.document.blocks[blockId] ||
      state.document.layouts?.header === blockId ||
      state.document.layouts?.footer === blockId ||
      state.document.blocks[blockId]?.type === "header" ||
      state.document.blocks[blockId]?.type === "footer"
    ) {
      return {};
    }
    const historyUpdate = saveToHistory(state);

    const newBlocks = { ...state.document.blocks };
    const { newId, clonedBlocks } = duplicateBlockRecursive(blockId, newBlocks);
    Object.assign(newBlocks, clonedBlocks);

    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;
    const sections = newPages[state.activePage].sections;

    const idx = sections.indexOf(blockId);
    if (idx !== -1) {
      sections.splice(idx + 1, 0, newId);
      newPages[state.activePage].sections = sections;
    } else {
      for (const pid of Object.keys(newBlocks)) {
        const parent = newBlocks[pid];
        if (parent.childrenIds) {
          const cidx = parent.childrenIds.indexOf(blockId);
          if (cidx !== -1) {
            const children = [...parent.childrenIds];
            children.splice(cidx + 1, 0, newId);
            parent.childrenIds = children;
            newBlocks[pid] = parent;
            break;
          }
        }
      }
    }

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: newId,
    };
  }),

  unwrapBlock: (blockId) => set((state) => {
    if (
      !state.document.blocks[blockId] ||
      state.document.layouts?.header === blockId ||
      state.document.layouts?.footer === blockId ||
      state.document.blocks[blockId]?.type === "header" ||
      state.document.blocks[blockId]?.type === "footer"
    ) {
      return {};
    }
    const targetBlock = state.document.blocks[blockId];
    const childrenIds = targetBlock.childrenIds ? [...targetBlock.childrenIds] : [];
    const historyUpdate = saveToHistory(state);

    const newBlocks = { ...state.document.blocks };
    delete newBlocks[blockId];

    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;
    const sections = newPages[state.activePage].sections;
    const secIdx = sections.indexOf(blockId);

    if (secIdx !== -1) {
      sections.splice(secIdx, 1, ...childrenIds);
    } else {
      Object.keys(newBlocks).forEach((pid) => {
        const parent = newBlocks[pid];
        if (parent.childrenIds && parent.childrenIds.includes(blockId)) {
          const cidx = parent.childrenIds.indexOf(blockId);
          const updatedCids = [...parent.childrenIds];
          updatedCids.splice(cidx, 1, ...childrenIds);
          newBlocks[pid] = { ...parent, childrenIds: updatedCids };
        }
      });
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: childrenIds[0] || null,
    };
  }),

  wrapBlock: (blockId, wrapperType) => set((state) => {
    if (
      !state.document.blocks[blockId] ||
      state.document.layouts?.header === blockId ||
      state.document.layouts?.footer === blockId ||
      state.document.blocks[blockId]?.type === "header" ||
      state.document.blocks[blockId]?.type === "footer"
    ) {
      return {};
    }
    const historyUpdate = saveToHistory(state);
    const wrapperBlock = createNewBlock(wrapperType);
    wrapperBlock.childrenIds = [blockId];
    if (wrapperType === "columns") {
      wrapperBlock.props = { ...wrapperBlock.props, columnsCount: 2, layoutPreset: "equal" };
    }

    const newBlocks = { ...state.document.blocks, [wrapperBlock.id]: wrapperBlock };
    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;
    const sections = newPages[state.activePage].sections;
    const secIdx = sections.indexOf(blockId);

    if (secIdx !== -1) {
      sections.splice(secIdx, 1, wrapperBlock.id);
    } else {
      Object.keys(newBlocks).forEach((pid) => {
        const parent = newBlocks[pid];
        if (parent.childrenIds && parent.childrenIds.includes(blockId)) {
          const cidx = parent.childrenIds.indexOf(blockId);
          const updatedCids = [...parent.childrenIds];
          updatedCids.splice(cidx, 1, wrapperBlock.id);
          newBlocks[pid] = { ...parent, childrenIds: updatedCids };
        }
      });
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: wrapperBlock.id,
    };
  }),

  makeAdjacent: (blockId) => set((state) => {
    if (
      !state.document.blocks[blockId] ||
      state.document.layouts?.header === blockId ||
      state.document.layouts?.footer === blockId ||
      state.document.blocks[blockId]?.type === "header" ||
      state.document.blocks[blockId]?.type === "footer"
    ) {
      return {};
    }
    const historyUpdate = saveToHistory(state);
    const newBlocks = { ...state.document.blocks };
    const { newId: clonedId, clonedBlocks } = duplicateBlockRecursive(blockId, newBlocks);
    Object.assign(newBlocks, clonedBlocks);

    const newPages = JSON.parse(JSON.stringify(state.document.pages)) as ThemePages;
    const sections = newPages[state.activePage].sections;

    let foundColumnsParentId: string | null = null;
    for (const pid of Object.keys(newBlocks)) {
      const p = newBlocks[pid];
      if (p.type === "columns" && p.childrenIds && p.childrenIds.includes(blockId)) {
        foundColumnsParentId = pid;
        break;
      }
    }

    if (foundColumnsParentId) {
      const parentCol = newBlocks[foundColumnsParentId];
      const curChildren = [...(parentCol.childrenIds || [])];
      const curIdx = curChildren.indexOf(blockId);
      curChildren.splice(curIdx + 1, 0, clonedId);
      const newCount = Math.max(Number(parentCol.props?.columnsCount) || 2, curChildren.length);
      newBlocks[foundColumnsParentId] = {
        ...parentCol,
        childrenIds: curChildren,
        props: { ...parentCol.props, columnsCount: Math.min(4, newCount) },
      };
    } else {
      const colBlock = createNewBlock("columns");
      colBlock.props = { ...colBlock.props, columnsCount: 2, layoutPreset: "equal" };
      colBlock.childrenIds = [blockId, clonedId];
      newBlocks[colBlock.id] = colBlock;

      const secIdx = sections.indexOf(blockId);
      if (secIdx !== -1) {
        sections.splice(secIdx, 1, colBlock.id);
      } else {
        Object.keys(newBlocks).forEach((pid) => {
          const parent = newBlocks[pid];
          if (parent.childrenIds && parent.childrenIds.includes(blockId)) {
            const cidx = parent.childrenIds.indexOf(blockId);
            const updatedCids = [...parent.childrenIds];
            updatedCids.splice(cidx, 1, colBlock.id);
            newBlocks[pid] = { ...parent, childrenIds: updatedCids };
          }
        });
      }
    }

    setTimeout(() => triggerAutosave(get), 0);

    return {
      ...historyUpdate,
      document: { ...state.document, blocks: newBlocks, pages: newPages },
      selectedBlockId: clonedId,
    };
  }),

  reorderBlocks: (sourceIndex, destinationIndex, parentId) => set((state) => {
    const historyUpdate = saveToHistory(state);
    
    if (parentId && state.document.blocks[parentId]) {
      const parent = { ...state.document.blocks[parentId] };
      const childrenIds = [...(parent.childrenIds || [])];
      const [removed] = childrenIds.splice(sourceIndex, 1);
      childrenIds.splice(destinationIndex, 0, removed);
      parent.childrenIds = childrenIds;

      return {
        ...historyUpdate,
        document: {
          ...state.document,
          blocks: { ...state.document.blocks, [parentId]: parent },
        },
      };
    } else {
      const sections = [...state.document.pages[state.activePage].sections];
      const [removed] = sections.splice(sourceIndex, 1);
      sections.splice(destinationIndex, 0, removed);

      const newPages = {
        ...state.document.pages,
        [state.activePage]: {
          ...state.document.pages[state.activePage],
          sections,
        },
      };

      return {
        ...historyUpdate,
        document: { ...state.document, pages: newPages },
      };
    }
  }),

  undo: () => set((state) => {
    if (state.past.length === 0) return {};
    const newPast = [...state.past];
    const previous = newPast.pop()!;
    
    return {
      past: newPast,
      future: [JSON.parse(JSON.stringify(state.document)), ...state.future],
      document: previous,
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const newFuture = [...state.future];
    const next = newFuture.shift()!;
    
    return {
      past: [...state.past, JSON.parse(JSON.stringify(state.document))],
      future: newFuture,
      document: next,
    };
  }),
}));
