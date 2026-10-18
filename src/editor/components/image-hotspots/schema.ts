export interface HotspotItem {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  description: string;
  linkUrl?: string;
  linkLabel?: string;
  openInNewTab?: boolean;
}

export type HotspotContentWidth = "narrow" | "standard" | "wide" | "full";
export type HotspotAspectRatio = "16/9" | "4/3" | "3/2" | "1/1" | "21/9" | "auto";
export type HotspotBorderRadius =
  | "rounded-none"
  | "rounded-sm"
  | "rounded-md"
  | "rounded-lg"
  | "rounded-xl"
  | "rounded-2xl";
export type HotspotMarkerIcon = "dot" | "plus" | "number";
export type HotspotTooltipTheme = "dark" | "light";

export interface ImageHotspotsProps {
  content: {
    heading?: string;
    description?: string;
    image: string;
    alt: string;
  };
  hotspots: HotspotItem[];
  marker: {
    color: string;
    pulse: boolean;
    icon: HotspotMarkerIcon;
  };
  tooltip: {
    theme: HotspotTooltipTheme;
  };
  layout: {
    contentWidth: HotspotContentWidth;
    aspectRatio: HotspotAspectRatio;
    customHeight?: string;
    borderRadius: HotspotBorderRadius;
    paddingX?: string;
  };
  activeHotspotId?: string;
  advanced?: {
    htmlAnchor?: string;
    ariaLabel?: string;
  };
}

export const defaultProps: ImageHotspotsProps = {
  content: {
    heading: "Interactive Feature Hotspots",
    description: "Explore the standout features and components by interacting with the markers on the image.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    alt: "Technology hardware setup showcase",
  },
  hotspots: [
    {
      id: "hotspot-1",
      x: 28,
      y: 36,
      title: "High-Performance Core",
      description: "Dedicated processing unit designed for ultra-low latency and complex computational workflows.",
      linkUrl: "#specs",
      linkLabel: "Learn more",
      openInNewTab: false,
    },
    {
      id: "hotspot-2",
      x: 68,
      y: 44,
      title: "Integrated Heat Dissipation",
      description: "Precision-machined vapor chamber cooling with multi-directional passive airflow vents.",
      linkUrl: "#cooling",
      linkLabel: "View cooling",
      openInNewTab: false,
    },
    {
      id: "hotspot-3",
      x: 48,
      y: 72,
      title: "Modular Interface Port",
      description: "Universal high-bandwidth connector supporting dynamic hot-plug expansions.",
      linkUrl: "#ports",
      linkLabel: "Explore ports",
      openInNewTab: false,
    },
  ],
  marker: {
    color: "#0070f3",
    pulse: true,
    icon: "plus",
  },
  tooltip: {
    theme: "dark",
  },
  layout: {
    contentWidth: "standard",
    aspectRatio: "16/9",
    customHeight: "480px",
    borderRadius: "rounded-xl",
    paddingX: "24px",
  },
  advanced: {
    htmlAnchor: "",
    ariaLabel: "Interactive image with feature hotspots",
  },
};

export const defaultStyles: Record<string, unknown> = {
  paddingTop: "48px",
  paddingBottom: "48px",
  paddingLeft: "24px",
  paddingRight: "24px",
};

/**
 * Safely parses and normalizes raw block props into ImageHotspotsProps,
 * clamping percentages and ensuring all nested defaults are preserved.
 */
export function resolveImageHotspotsProps(props?: Record<string, unknown>): ImageHotspotsProps {
  const p = (props || {}) as Partial<ImageHotspotsProps>;
  const content = (p.content || {}) as Partial<ImageHotspotsProps["content"]>;
  const marker = (p.marker || {}) as Partial<ImageHotspotsProps["marker"]>;
  const tooltip = (p.tooltip || {}) as Partial<ImageHotspotsProps["tooltip"]>;
  const layout = (p.layout || {}) as Partial<ImageHotspotsProps["layout"]>;
  const advanced = (p.advanced || {}) as Partial<ImageHotspotsProps["advanced"]>;

  // Safely normalize hotspots array
  const rawHotspots = Array.isArray(p.hotspots) ? p.hotspots : defaultProps.hotspots;
  const hotspots: HotspotItem[] = rawHotspots.map((item, idx) => {
    const rawItem = (item || {}) as Partial<HotspotItem>;
    const rawX = typeof rawItem.x === "number" && !isNaN(rawItem.x) ? rawItem.x : 50;
    const rawY = typeof rawItem.y === "number" && !isNaN(rawItem.y) ? rawItem.y : 50;
    return {
      id: typeof rawItem.id === "string" && rawItem.id.trim() ? rawItem.id : `hotspot-${idx + 1}`,
      x: Math.max(0, Math.min(100, Math.round(rawX * 10) / 10)),
      y: Math.max(0, Math.min(100, Math.round(rawY * 10) / 10)),
      title: typeof rawItem.title === "string" ? rawItem.title : `Feature Point ${idx + 1}`,
      description: typeof rawItem.description === "string" ? rawItem.description : "",
      linkUrl: typeof rawItem.linkUrl === "string" ? rawItem.linkUrl : "",
      linkLabel: typeof rawItem.linkLabel === "string" && rawItem.linkLabel.trim() ? rawItem.linkLabel : "Learn more",
      openInNewTab: Boolean(rawItem.openInNewTab),
    };
  });

  const validWidths: HotspotContentWidth[] = ["narrow", "standard", "wide", "full"];
  const validAspects: HotspotAspectRatio[] = ["16/9", "4/3", "3/2", "1/1", "21/9", "auto"];
  const validRadii: HotspotBorderRadius[] = [
    "rounded-none",
    "rounded-sm",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
  ];
  const validIcons: HotspotMarkerIcon[] = ["dot", "plus", "number"];
  const validThemes: HotspotTooltipTheme[] = ["dark", "light"];

  return {
    content: {
      heading: typeof content.heading === "string" ? content.heading : defaultProps.content.heading,
      description: typeof content.description === "string" ? content.description : defaultProps.content.description,
      image: typeof content.image === "string" ? content.image : defaultProps.content.image,
      alt: typeof content.alt === "string" ? content.alt : defaultProps.content.alt,
    },
    hotspots,
    marker: {
      color: typeof marker.color === "string" && marker.color.trim() ? marker.color : defaultProps.marker.color,
      pulse: marker.pulse !== undefined ? Boolean(marker.pulse) : defaultProps.marker.pulse,
      icon: validIcons.includes(marker.icon as HotspotMarkerIcon) ? (marker.icon as HotspotMarkerIcon) : defaultProps.marker.icon,
    },
    tooltip: {
      theme: validThemes.includes(tooltip.theme as HotspotTooltipTheme)
        ? (tooltip.theme as HotspotTooltipTheme)
        : defaultProps.tooltip.theme,
    },
    layout: {
      contentWidth: validWidths.includes(layout.contentWidth as HotspotContentWidth)
        ? (layout.contentWidth as HotspotContentWidth)
        : defaultProps.layout.contentWidth,
      aspectRatio: validAspects.includes(layout.aspectRatio as HotspotAspectRatio)
        ? (layout.aspectRatio as HotspotAspectRatio)
        : defaultProps.layout.aspectRatio,
      customHeight: typeof layout.customHeight === "string" ? layout.customHeight : defaultProps.layout.customHeight,
      borderRadius: validRadii.includes(layout.borderRadius as HotspotBorderRadius)
        ? (layout.borderRadius as HotspotBorderRadius)
        : defaultProps.layout.borderRadius,
      paddingX: typeof layout.paddingX === "string" ? layout.paddingX : defaultProps.layout.paddingX,
    },
    activeHotspotId: typeof p.activeHotspotId === "string" ? p.activeHotspotId : undefined,
    advanced: {
      htmlAnchor: typeof advanced?.htmlAnchor === "string" ? advanced.htmlAnchor : "",
      ariaLabel:
        typeof advanced?.ariaLabel === "string" && advanced.ariaLabel.trim()
          ? advanced.ariaLabel
          : defaultProps.advanced?.ariaLabel,
    },
  };
}
