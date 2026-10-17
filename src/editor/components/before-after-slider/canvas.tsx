"use client";

import React, { useState, useRef } from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import {
  BeforeAfterSliderProps,
  resolveBeforeAfterProps,
  SliderContentWidth,
  SliderAspectRatio,
  SliderBorderRadius,
} from "./schema";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";
import { Image as ImageIcon } from "lucide-react";

const EMPTY_ASSETS: Record<string, string> = {};

const WIDTH_CLASSES: Record<SliderContentWidth, string> = {
  narrow: "max-w-2xl",
  standard: "max-w-4xl",
  wide: "max-w-6xl",
  full: "w-full",
};

const ASPECT_RATIO_STYLES: Record<SliderAspectRatio, string | undefined> = {
  "16/9": "16 / 9",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
  "1/1": "1 / 1",
  "21/9": "21 / 9",
  auto: undefined,
};

const BORDER_RADIUS_CLASSES: Record<SliderBorderRadius, string> = {
  "rounded-none": "rounded-none",
  "rounded-sm": "rounded-sm",
  "rounded-md": "rounded-md",
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-2xl": "rounded-2xl",
};

export function CanvasElement({ block }: { block: BuilderBlock }) {
  useCanvasDarkMode();
  const p: BeforeAfterSliderProps = resolveBeforeAfterProps(block.props);
  const assets = useEditorStore((state) => state.document.assets) || EMPTY_ASSETS;

  // Local interactive slider position override during user drag/keyboard interaction
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if initialPosition was changed from the sidebar
  const [prevInitial, setPrevInitial] = useState(p.slider.initialPosition);
  if (prevInitial !== p.slider.initialPosition) {
    setPrevInitial(p.slider.initialPosition);
    setDragPosition(null);
  }

  const sliderPosition = dragPosition !== null ? dragPosition : p.slider.initialPosition;

  // Resolve asset:// or direct URLs
  const resolveUrl = (rawUrl?: string): string => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("asset://")) {
      const path = rawUrl.replace("asset://", "");
      return assets[path] || assets[`assets/${path}`] || rawUrl;
    }
    return rawUrl;
  };

  const beforeSrc = resolveUrl(p.content.beforeImage);
  const afterSrc = resolveUrl(p.content.afterImage);

  // Calculate percentage from pointer event
  const updatePositionFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setDragPosition(Math.round(percentage * 10) / 10);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary mouse button or touch
    if (e.button !== 0) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  };

  // Keyboard accessibility on handle
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    const step = e.shiftKey ? 10 : 2;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        delta = -step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        delta = step;
        break;
      case "Home":
        setDragPosition(0);
        e.preventDefault();
        return;
      case "End":
        setDragPosition(100);
        e.preventDefault();
        return;
      default:
        return;
    }

    e.preventDefault();
    setDragPosition(Math.max(0, Math.min(100, Math.round((sliderPosition + delta) * 10) / 10)));
  };

  const formatCustomHeight = (val?: string) => {
    if (!val || !val.trim()) return "480px";
    const trimmed = val.trim();
    if (/^\d+$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  };

  const aspectRatioStyle = ASPECT_RATIO_STYLES[p.layout.aspectRatio];
  const containerHeight = p.layout.aspectRatio === "auto" ? formatCustomHeight(p.layout.customHeight) : undefined;
  const widthClass = WIDTH_CLASSES[p.layout.contentWidth] || "max-w-4xl";
  const radiusClass = BORDER_RADIUS_CLASSES[p.layout.borderRadius] || "rounded-xl";

  const hasBottomCaptions = Boolean(p.content.showAltText && (p.content.beforeAlt || p.content.afterAlt));
  const labelPosClass = p.labels.position === "top" ? "top-3" : hasBottomCaptions ? "bottom-12" : "bottom-3";

  const rawAnchor = typeof p.advanced?.htmlAnchor === "string" ? p.advanced.htmlAnchor.trim() : "";
  const safeAnchor = rawAnchor.replace(/^#+/, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || undefined;

  return (
    <div
      id={safeAnchor}
      className={`w-full mx-auto ${widthClass} font-sans`}
    >
      {/* Optional Heading & Description */}
      {(p.content.heading || p.content.description) && (
        <div className="text-center mb-6 max-w-2xl mx-auto">
          {p.content.heading && (
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-ink mb-2">
              {p.content.heading}
            </h2>
          )}
          {p.content.description && (
            <p className="text-sm sm:text-base text-brand-body leading-relaxed">
              {p.content.description}
            </p>
          )}
        </div>
      )}

      {/* Comparison Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full overflow-hidden select-none touch-none cursor-ew-resize bg-brand-canvas-soft border border-brand-hairline shadow-level-2 ${radiusClass}`}
        style={{
          aspectRatio: aspectRatioStyle,
          height: containerHeight,
          minHeight: "260px",
        }}
      >
        {/* AFTER (Base / Background) Layer */}
        <div className="absolute inset-0 w-full h-full">
          {afterSrc ? (
            <img
              src={afterSrc}
              alt={p.content.afterAlt || "After"}
              className="w-full h-full object-cover pointer-events-none select-none block"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
              <ImageIcon size={36} className="mb-2 opacity-50" />
              <span className="text-xs font-semibold">After Image Not Set</span>
              <span className="text-[11px] opacity-75">Upload an image in the right sidebar</span>
            </div>
          )}

          {/* After Label Badge */}
          {p.labels.showLabels && (
            <div
              className={`absolute right-3 ${labelPosClass} z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm pointer-events-none transition-opacity duration-150 ${
                sliderPosition > 95 ? "opacity-0" : "opacity-100"
              }`}
            >
              {p.labels.afterLabel || "After"}
            </div>
          )}

          {/* After Alt Text Caption at bottom of image */}
          {p.content.showAltText && p.content.afterAlt && (
            <div
              className={`absolute right-3 bottom-3 z-10 px-3 py-1 rounded-md text-xs font-medium bg-black/65 backdrop-blur-md text-white border border-white/15 shadow-sm pointer-events-none transition-opacity duration-150 ${
                sliderPosition > 95 ? "opacity-0" : "opacity-100"
              }`}
            >
              {p.content.afterAlt}
            </div>
          )}
        </div>

        {/* BEFORE (Overlay / Clipped) Layer */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
            WebkitClipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
          }}
        >
          {beforeSrc ? (
            <img
              src={beforeSrc}
              alt={p.content.beforeAlt || "Before"}
              className="w-full h-full object-cover pointer-events-none select-none block"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500 p-4 text-center">
              <ImageIcon size={36} className="mb-2 opacity-50" />
              <span className="text-xs font-semibold">Before Image Not Set</span>
              <span className="text-[11px] opacity-75">Upload an image in the right sidebar</span>
            </div>
          )}

          {/* Before Label Badge */}
          {p.labels.showLabels && (
            <div
              className={`absolute left-3 ${labelPosClass} z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm pointer-events-none transition-opacity duration-150 ${
                sliderPosition < 5 ? "opacity-0" : "opacity-100"
              }`}
            >
              {p.labels.beforeLabel || "Before"}
            </div>
          )}

          {/* Before Alt Text Caption at bottom of image */}
          {p.content.showAltText && p.content.beforeAlt && (
            <div
              className={`absolute left-3 bottom-3 z-10 px-3 py-1 rounded-md text-xs font-medium bg-black/65 backdrop-blur-md text-white border border-white/15 shadow-sm pointer-events-none transition-opacity duration-150 ${
                sliderPosition < 5 ? "opacity-0" : "opacity-100"
              }`}
            >
              {p.content.beforeAlt}
            </div>
          )}
        </div>

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{
            left: `${sliderPosition}%`,
            width: "2px",
            backgroundColor: p.slider.dividerColor || "#ffffff",
            boxShadow: "0 0 8px rgba(0,0,0,0.35)",
            transform: "translateX(-50%)",
          }}
        />

        {/* Draggable & Accessible Slider Handle */}
        <div
          role="slider"
          tabIndex={0}
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={p.advanced?.ariaLabel || "Before and after comparison slider"}
          onKeyDown={handleKeyDown}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-level-3 flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
            isDragging ? "scale-110 shadow-level-4 cursor-grabbing" : "hover:scale-105"
          }`}
          style={{
            left: `calc(clamp(22px, ${sliderPosition}%, calc(100% - 22px)))`,
            backgroundColor: p.slider.handleColor || "#ffffff",
            color: "#171717",
          }}
        >
          {p.slider.showHandleArrows ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-900 pointer-events-none"
            >
              <polyline points="8 17 3 12 8 7" />
              <polyline points="16 7 21 12 16 17" />
            </svg>
          ) : (
            <div className="flex gap-1 items-center pointer-events-none">
              <span className="w-0.5 h-4 bg-gray-400 rounded-full" />
              <span className="w-0.5 h-4 bg-gray-400 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
