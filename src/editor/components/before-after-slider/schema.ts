export type SliderAspectRatio = "16/9" | "4/3" | "3/2" | "1/1" | "21/9" | "auto";
export type SliderContentWidth = "narrow" | "standard" | "wide" | "full";
export type SliderBorderRadius =
  | "rounded-none"
  | "rounded-sm"
  | "rounded-md"
  | "rounded-lg"
  | "rounded-xl"
  | "rounded-2xl";

export interface BeforeAfterSliderProps {
  content: {
    heading?: string;
    description?: string;
    beforeImage: string;
    beforeAlt: string;
    afterImage: string;
    afterAlt: string;
    showAltText?: boolean;
  };
  labels: {
    showLabels: boolean;
    beforeLabel: string;
    afterLabel: string;
    position: "top" | "bottom";
  };
  slider: {
    initialPosition: number;
    handleColor: string;
    dividerColor: string;
    showHandleArrows: boolean;
  };
  layout: {
    contentWidth: SliderContentWidth;
    aspectRatio: SliderAspectRatio;
    customHeight?: string;
    borderRadius: SliderBorderRadius;
  };
  advanced?: {
    htmlAnchor?: string;
    ariaLabel?: string;
  };
}

export const defaultProps: BeforeAfterSliderProps = {
  content: {
    heading: "Before & After",
    description: "Drag the slider to compare the transformation.",
    beforeImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    beforeAlt: "Before transformation",
    afterImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    afterAlt: "After transformation",
    showAltText: true,
  },
  labels: {
    showLabels: true,
    beforeLabel: "Before",
    afterLabel: "After",
    position: "top",
  },
  slider: {
    initialPosition: 50,
    handleColor: "#ffffff",
    dividerColor: "#ffffff",
    showHandleArrows: true,
  },
  layout: {
    contentWidth: "standard",
    aspectRatio: "16/9",
    customHeight: "480px",
    borderRadius: "rounded-xl",
  },
  advanced: {
    htmlAnchor: "",
    ariaLabel: "Before and after comparison slider",
  },
};

export const defaultStyles = {
  paddingTop: "48px",
  paddingBottom: "48px",
  paddingLeft: "0px",
  paddingRight: "0px",
};

export function resolveBeforeAfterProps(props?: Record<string, unknown>): BeforeAfterSliderProps {
  const p = (props || {}) as Partial<BeforeAfterSliderProps>;
  const content = (p.content || {}) as Partial<BeforeAfterSliderProps["content"]>;
  const labels = (p.labels || {}) as Partial<BeforeAfterSliderProps["labels"]>;
  const slider = (p.slider || {}) as Partial<BeforeAfterSliderProps["slider"]>;
  const layout = (p.layout || {}) as Partial<BeforeAfterSliderProps["layout"]>;
  const advanced = (p.advanced || {}) as Partial<BeforeAfterSliderProps["advanced"]>;

  return {
    content: {
      heading: typeof content.heading === "string" ? content.heading : defaultProps.content.heading,
      description: typeof content.description === "string" ? content.description : defaultProps.content.description,
      beforeImage: typeof content.beforeImage === "string" ? content.beforeImage : defaultProps.content.beforeImage,
      beforeAlt: typeof content.beforeAlt === "string" ? content.beforeAlt : defaultProps.content.beforeAlt,
      afterImage: typeof content.afterImage === "string" ? content.afterImage : defaultProps.content.afterImage,
      afterAlt: typeof content.afterAlt === "string" ? content.afterAlt : defaultProps.content.afterAlt,
      showAltText: content.showAltText !== undefined ? Boolean(content.showAltText) : (defaultProps.content.showAltText ?? true),
    },
    labels: {
      showLabels: labels.showLabels !== undefined ? Boolean(labels.showLabels) : defaultProps.labels.showLabels,
      beforeLabel: typeof labels.beforeLabel === "string" ? labels.beforeLabel : defaultProps.labels.beforeLabel,
      afterLabel: typeof labels.afterLabel === "string" ? labels.afterLabel : defaultProps.labels.afterLabel,
      position: labels.position === "bottom" ? "bottom" : "top",
    },
    slider: {
      initialPosition:
        typeof slider.initialPosition === "number" && !isNaN(slider.initialPosition)
          ? Math.max(0, Math.min(100, slider.initialPosition))
          : defaultProps.slider.initialPosition,
      handleColor: typeof slider.handleColor === "string" && slider.handleColor ? slider.handleColor : defaultProps.slider.handleColor,
      dividerColor: typeof slider.dividerColor === "string" && slider.dividerColor ? slider.dividerColor : defaultProps.slider.dividerColor,
      showHandleArrows: slider.showHandleArrows !== undefined ? Boolean(slider.showHandleArrows) : defaultProps.slider.showHandleArrows,
    },
    layout: {
      contentWidth: (["narrow", "standard", "wide", "full"].includes(layout.contentWidth as string)
        ? layout.contentWidth
        : defaultProps.layout.contentWidth) as SliderContentWidth,
      aspectRatio: (["16/9", "4/3", "3/2", "1/1", "21/9", "auto"].includes(layout.aspectRatio as string)
        ? layout.aspectRatio
        : defaultProps.layout.aspectRatio) as SliderAspectRatio,
      customHeight: typeof layout.customHeight === "string" ? layout.customHeight : defaultProps.layout.customHeight,
      borderRadius: (["rounded-none", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl"].includes(layout.borderRadius as string)
        ? layout.borderRadius
        : defaultProps.layout.borderRadius) as SliderBorderRadius,
    },
    advanced: {
      htmlAnchor: typeof advanced?.htmlAnchor === "string" ? advanced.htmlAnchor : "",
      ariaLabel: typeof advanced?.ariaLabel === "string" && advanced.ariaLabel ? advanced.ariaLabel : "Before and after comparison slider",
    },
  };
}
