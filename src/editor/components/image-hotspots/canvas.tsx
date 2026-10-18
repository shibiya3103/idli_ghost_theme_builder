"use client";

import React, { useState, useRef, useEffect } from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import {
  HotspotItem,
  resolveImageHotspotsProps,
  HotspotContentWidth,
  HotspotAspectRatio,
  HotspotBorderRadius,
} from "./schema";
import {
  Image as ImageIcon,
  Plus,
  X,
  Info,
  ExternalLink,
} from "lucide-react";

const EMPTY_ASSETS: Record<string, string> = {};

const WIDTH_CLASSES: Record<HotspotContentWidth, string> = {
  narrow: "max-w-2xl",
  standard: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-full",
};

const ASPECT_RATIO_STYLES: Record<HotspotAspectRatio, string | undefined> = {
  "16/9": "16 / 9",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
  "1/1": "1 / 1",
  "21/9": "21 / 9",
  auto: undefined,
};

const BORDER_RADIUS_CLASSES: Record<HotspotBorderRadius, string> = {
  "rounded-none": "rounded-none",
  "rounded-sm": "rounded-sm",
  "rounded-md": "rounded-md",
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-2xl": "rounded-2xl",
};

export function CanvasElement({
  block,
  isSelected,
}: {
  block: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) {
  const p = resolveImageHotspotsProps(block.props);
  const updateBlockProps = useEditorStore((state) => state.updateBlockProps);
  const deviceMode = useEditorStore((state) => state.deviceMode);
  const assets = useEditorStore((state) => state.document.assets) || EMPTY_ASSETS;

  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(p.hotspots[0]?.id || null);
  const [dismissed, setDismissed] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ clientX: number; clientY: number; moved: boolean }>({ clientX: 0, clientY: 0, moved: false });
  const activeSpotRef = useRef<HotspotItem | null>(null);

  const resolveUrl = (rawUrl?: string): string => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("asset://")) {
      const path = rawUrl.replace("asset://", "");
      return assets[path] || assets[`assets/${path}`] || rawUrl;
    }
    return rawUrl;
  };

  const imageSrc = resolveUrl(p.content.image);



  const handleImageClick = () => {
    // If a drag just occurred, do not dismiss
    if (dragStartPosRef.current.moved) {
      dragStartPosRef.current.moved = false;
      return;
    }
    setDismissed(true);
    setActiveHotspotId(null);
    if (p.activeHotspotId) {
      updateBlockProps(block.id, { activeHotspotId: "" });
    }
  };

  const startMarkerDrag = (e: React.PointerEvent, spot: HotspotItem) => {
    e.stopPropagation();
    e.preventDefault();

    activeSpotRef.current = spot;
    dragStartPosRef.current = { clientX: e.clientX, clientY: e.clientY, moved: false };
    setDraggingId(spot.id);
    setDragCoords({ x: spot.x, y: spot.y });

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!containerRef.current || !activeSpotRef.current) return;
      const dist = Math.hypot(
        moveEv.clientX - dragStartPosRef.current.clientX,
        moveEv.clientY - dragStartPosRef.current.clientY
      );
      if (dist > 4) {
        dragStartPosRef.current.moved = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const newX = Math.max(0, Math.min(100, Math.round(((moveEv.clientX - rect.left) / rect.width) * 1000) / 10));
      const newY = Math.max(0, Math.min(100, Math.round(((moveEv.clientY - rect.top) / rect.height) * 1000) / 10));

      setDragCoords({ x: newX, y: newY });
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      const targetId = activeSpotRef.current?.id;
      const wasMoved = dragStartPosRef.current.moved;

      if (wasMoved && targetId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const finalX = Math.max(0, Math.min(100, Math.round(((upEv.clientX - rect.left) / rect.width) * 1000) / 10));
        const finalY = Math.max(0, Math.min(100, Math.round(((upEv.clientY - rect.top) / rect.height) * 1000) / 10));

        const updated = p.hotspots.map((item) =>
          item.id === targetId ? { ...item, x: finalX, y: finalY } : item
        );
        updateBlockProps(block.id, { hotspots: updated });
      } else if (!wasMoved && targetId) {
        // Simple click -> toggle tooltip popup
        setDismissed(false);
        setActiveHotspotId((prev) => (prev === targetId ? null : targetId));
        updateBlockProps(block.id, { activeHotspotId: targetId });
      }

      setDraggingId(null);
      setDragCoords(null);
      activeSpotRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  // Close popup only if clicking outside the component and outside sidebar/controls
  useEffect(() => {
    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        containerRef.current?.contains(target) ||
        target?.closest("[data-sidebar]") ||
        target?.closest(".editor-sidebar") ||
        target?.closest("aside") ||
        target?.closest("button") ||
        target?.closest("input") ||
        target?.closest("textarea") ||
        target?.closest("select")
      ) {
        return;
      }
      setDismissed(true);
      setActiveHotspotId(null);
    };
    window.addEventListener("mousedown", handleWindowClick);
    return () => window.removeEventListener("mousedown", handleWindowClick);
  }, []);

  const widthClass = WIDTH_CLASSES[p.layout.contentWidth] || "max-w-4xl";
  const radiusClass = BORDER_RADIUS_CLASSES[p.layout.borderRadius] || "rounded-xl";
  const aspectRatio = ASPECT_RATIO_STYLES[p.layout.aspectRatio];
  const containerHeight = p.layout.aspectRatio === "auto" ? p.layout.customHeight || "480px" : undefined;

  const rawAnchor = typeof p.advanced?.htmlAnchor === "string" ? p.advanced.htmlAnchor.trim() : "";
  const safeAnchor = rawAnchor.replace(/^#+/, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || undefined;

  // Determine active hotspot: either props.activeHotspotId, or local state, or fallback to first hotspot
  const effectiveActiveId = dismissed
    ? null
    : p.activeHotspotId || activeHotspotId || (isSelected ? p.hotspots[0]?.id : p.hotspots[0]?.id || null);

  const activeHotspot = p.hotspots.find((h) => h.id === effectiveActiveId);

  const horizontalPadding =
    (block.styles?.paddingLeft as string) ||
    p.layout.paddingX ||
    "24px";

  return (
    <div
      id={safeAnchor}
      className={`w-full mx-auto ${widthClass} font-sans box-border`}
      style={{
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        boxSizing: "border-box",
      }}
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

      {/* Interactive Image Frame */}
      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={`relative w-full overflow-hidden select-none bg-brand-canvas-soft border border-brand-hairline shadow-level-2 group/canvas-img ${radiusClass} ${
          imageSrc ? "cursor-default" : "cursor-default"
        }`}
        style={{
          aspectRatio,
          height: containerHeight,
          minHeight: "260px",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={p.content.alt || "Interactive Hotspots Image"}
            className="w-full h-full object-cover block pointer-events-none select-none"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-100 text-gray-400 min-h-[300px]">
            <ImageIcon size={44} className="mb-3 opacity-50 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">No Image Selected</span>
            <span className="text-xs text-gray-500 mt-1 max-w-xs">
              Upload an image or paste an image URL in the right sidebar to begin placing hotspots.
            </span>
          </div>
        )}


        {/* Hotspots Marker Overlays */}
        {imageSrc &&
          p.hotspots.map((spot, idx) => {
            const isDragging = draggingId === spot.id;
            const currentX = isDragging && dragCoords ? dragCoords.x : spot.x;
            const currentY = isDragging && dragCoords ? dragCoords.y : spot.y;
            const isActive = activeHotspotId === spot.id;

            return (
              <div
                key={spot.id}
                onPointerDown={(e) => startMarkerDrag(e, spot)}
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 touch-none cursor-grab active:cursor-grabbing select-none ${
                  isDragging ? "scale-125 z-40 cursor-grabbing" : "hover:scale-110"
                }`}
                style={{
                  left: `${currentX}%`,
                  top: `${currentY}%`,
                }}
              >
                {/* Outer Pulse Ring */}
                {p.marker.pulse && (
                  <span
                    className="absolute -inset-1.5 rounded-full animate-ping opacity-75 pointer-events-none"
                    style={{ backgroundColor: p.marker.color || "#0070f3" }}
                  />
                )}

                {/* Marker Button */}
                <div
                  className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-level-3 border-2 border-white transition-all ${
                    isActive ? "ring-2 ring-blue-500 ring-offset-2 scale-110" : ""
                  }`}
                  style={{
                    backgroundColor: p.marker.color || "#0070f3",
                    color: "#ffffff",
                  }}
                  title={spot.title || `Hotspot #${idx + 1}`}
                >
                  {p.marker.icon === "number" ? (
                    <span className="text-[11px] sm:text-xs font-bold leading-none">{idx + 1}</span>
                  ) : p.marker.icon === "plus" ? (
                    <Plus size={14} strokeWidth={2.5} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  )}
                </div>

                {/* Indicator Label badge on hover */}
                {!isActive && !isDragging && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-0.5 rounded-sm bg-black/80 backdrop-blur-md text-white text-[10px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/canvas-img:opacity-90 transition-opacity">
                    {spot.title || `Hotspot ${idx + 1}`}
                  </div>
                )}
              </div>
            );
          })}

        {/* Selected Hotspot View-Only Preview Card (strictly non-editable on canvas) */}
        {imageSrc && activeHotspot && (() => {
          const isLightTheme = p.tooltip.theme === "light";
          const pinX = activeHotspot.x;
          const pinY = activeHotspot.y;

          // Responsive popup geometry:
          // Clamps horizontally within 12px margins so pins on left, right, or corners never clip.
          // On mobile, docks cleanly above or below the pin to maximize readable space.
          const isMobileMode = deviceMode === "mobile";

          let popupStyle: React.CSSProperties;
          if (isMobileMode) {
            popupStyle = {
              left: "12px",
              right: "12px",
              width: "auto",
              maxWidth: "calc(100% - 24px)",
              maxHeight: "calc(100% - 24px)",
              top: pinY > 50 ? "12px" : "auto",
              bottom: pinY > 50 ? "auto" : "12px",
            };
          } else {
            popupStyle = {
              width: "min(280px, calc(100% - 24px))",
              maxWidth: "calc(100% - 24px)",
              left: `clamp(12px, calc(${pinX}% - 140px), calc(100% - 292px))`,
              top: pinY > 50 ? "auto" : `calc(${pinY}% + 18px)`,
              bottom: pinY > 50 ? `calc(${100 - pinY}% + 18px)` : "auto",
              maxHeight: pinY > 50 ? `calc(${pinY}% - 22px)` : `calc(100% - ${pinY}% - 22px)`,
            };
          }

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`absolute z-40 p-3.5 sm:p-4 rounded-xl transition-all duration-150 select-text text-left shadow-2xl border overflow-y-auto ${
                isLightTheme
                  ? "bg-white text-gray-900 border-gray-200/90 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
                  : "bg-neutral-950 text-white border-neutral-700/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
              }`}
              style={{
                ...popupStyle,
                boxSizing: "border-box",
              }}
            >
              {/* Header: Title and Close button */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: p.marker.color || "#0070f3" }}
                  />
                  <h4
                    className={`font-bold text-xs sm:text-sm tracking-tight truncate ${
                      isLightTheme ? "text-gray-950" : "text-white"
                    }`}
                    title={activeHotspot.title || "Untitled Hotspot"}
                  >
                    {activeHotspot.title || "Untitled Hotspot"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDismissed(true);
                    setActiveHotspotId(null);
                    if (p.activeHotspotId) {
                      updateBlockProps(block.id, { activeHotspotId: "" });
                    }
                  }}
                  className={`p-1.5 -mr-1 -mt-1 rounded-md transition-colors cursor-pointer shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center ${
                    isLightTheme
                      ? "hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                      : "hover:bg-white/10 text-neutral-400 hover:text-white"
                  }`}
                  aria-label="Close popup"
                  title="Close preview"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body: Description (without line-clamp so full text is readable, scrolling cleanly inside max-height) */}
              {activeHotspot.description ? (
                <p
                  className={`text-xs leading-relaxed break-words ${
                    isLightTheme ? "text-gray-600" : "text-neutral-300"
                  }`}
                >
                  {activeHotspot.description}
                </p>
              ) : (
                <p className={`text-[11px] italic ${isLightTheme ? "text-gray-400" : "text-neutral-500"}`}>
                  No description added. Add details in the sidebar.
                </p>
              )}

              {/* Footer: Action Navigation Link CTA (if URL configured) */}
              {activeHotspot.linkUrl && (
                <div
                  className={`mt-3 pt-2.5 border-t flex items-center justify-start ${
                    isLightTheme ? "border-gray-100" : "border-neutral-800"
                  }`}
                >
                  <a
                    href={activeHotspot.linkUrl}
                    target={activeHotspot.openInNewTab ? "_blank" : undefined}
                    rel={activeHotspot.openInNewTab ? "noopener noreferrer" : undefined}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
                      isLightTheme
                        ? "bg-gray-950 hover:bg-black text-white shadow-xs"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                    }`}
                    title={`Navigates to: ${activeHotspot.linkUrl}`}
                  >
                    <span>{activeHotspot.linkLabel || "Learn more"}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Empty Hotspots Hint */}
      {imageSrc && p.hotspots.length === 0 && (
        <div className="mt-3 p-3 text-center border border-dashed border-brand-hairline rounded-md bg-brand-canvas-soft text-brand-body text-xs flex items-center justify-center gap-2">
          <Info size={14} className="text-brand-mute" />
          <span>No hotspots configured yet. Use the sidebar Hotspots section to add feature markers.</span>
        </div>
      )}
    </div>
  );
}
