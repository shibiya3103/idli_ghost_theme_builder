import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";
import { getBackgroundStyle } from "../shared/background";

import { useEditorStore } from "@/store/editorStore";

export const CanvasElement = ({
  block,
  renderChildren,
}: {
  block?: BuilderBlock;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  renderChildren?: () => React.ReactNode;
}) => {
  useCanvasDarkMode();
  const deviceMode = useEditorStore((s) => s.deviceMode) || "desktop";
  const isMobile = deviceMode === "mobile";

  const resolveStyleLocal = (val: unknown, fallback: string): string => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number") return `${val}px`;
    if (typeof val === "object" && val !== null) {
      const rec = val as Record<string, string | number | undefined>;
      const resolved = rec[deviceMode] || rec.desktop || fallback;
      return typeof resolved === "number" ? `${resolved}px` : (resolved || fallback);
    }
    return fallback;
  };

  const rawMaxWidth = resolveStyleLocal(block?.props?.maxWidth || block?.styles?.width, "1200px");
  const maxWidth = `min(${rawMaxWidth}, 100%)`;
  const alignment = (block?.props?.alignment as string) || "center";
  const paddingTop = resolveStyleLocal(block?.styles?.paddingTop || block?.props?.paddingY, "0px");
  const paddingBottom = resolveStyleLocal(block?.styles?.paddingBottom || block?.props?.paddingY, "0px");
  const defaultPl = isMobile ? "16px" : "24px";
  const paddingLeft = resolveStyleLocal(block?.styles?.paddingLeft || block?.props?.paddingX, defaultPl);
  const paddingRight = resolveStyleLocal(block?.styles?.paddingRight || block?.props?.paddingX, defaultPl);
  const direction = (block?.props?.direction as string) || "column";
  const gap = (block?.props?.gap as string) || "16px";

  const marginLeft = alignment === "left" ? "0" : "auto";
  const marginRight = alignment === "right" ? "0" : "auto";

  const rawBg = (block?.styles?.backgroundColor as string) || (block?.props?.backgroundColor as string) || "";
  const bgType = block?.styles?.backgroundType || "solid";
  const hasBg = Boolean((rawBg && rawBg !== "transparent") || (bgType && bgType !== "solid"));
  const bgStyle = hasBg ? getBackgroundStyle(block?.styles, { backgroundColor: rawBg }) : {};

  return (
    <div
      className={`w-full box-border text-brand-ink dark:text-brand-ink transition-all min-h-[32px] ${hasBg ? "rounded-sm" : ""}`}
      style={{
        maxWidth,
        marginLeft,
        marginRight,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        ...bgStyle,
        display: direction === "row" ? "flex" : undefined,
        flexDirection: direction === "row" ? "row" : undefined,
        flexWrap: direction === "row" ? "wrap" : undefined,
        gap: direction === "row" ? gap : undefined,
        alignItems: direction === "row" ? "flex-start" : undefined,
      }}
    >
      {renderChildren ? renderChildren() : null}
    </div>
  );
};