import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useCanvasDarkMode } from "../shared/useCanvasDarkMode";
import { useEditorStore } from "@/store/editorStore";
import { getBackgroundStyle } from "../shared/background";

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
  const { deviceMode, isPreviewMode } = useEditorStore();

  const cols = Number(block?.props?.columnsCount) || 2;
  const preset = (block?.props?.layoutPreset as string) || "equal";
  const gap = (block?.props?.gap as string) || "24px";
  const alignItems = (block?.props?.alignItems as string) || "stretch";
  const stackOnMobile = block?.props?.stackOnMobile !== false;

  let templateCols = `repeat(${cols}, minmax(0, 1fr))`;
  if (cols === 2) {
    if (preset === "left-heavy") templateCols = "2fr 1fr";
    else if (preset === "right-heavy") templateCols = "1fr 2fr";
    else if (preset === "golden") templateCols = "1.618fr 1fr";
    else templateCols = "1fr 1fr";
  } else if (cols === 3) {
    templateCols = "repeat(3, minmax(0, 1fr))";
  } else if (cols === 4) {
    templateCols = "repeat(4, minmax(0, 1fr))";
  }

  const isMobile = deviceMode === "mobile" && stackOnMobile;
  const isTablet = deviceMode === "tablet";
  let activeCols = templateCols;
  if (isMobile) {
    activeCols = "1fr";
  } else if (isTablet && cols === 4) {
    activeCols = "repeat(2, minmax(0, 1fr))";
  }
  const rawBg = (block?.styles?.backgroundColor as string) || (block?.props?.backgroundColor as string) || "";
  const bgType = block?.styles?.backgroundType || "solid";
  const hasBg = Boolean((rawBg && rawBg !== "transparent") || (bgType && bgType !== "solid"));
  const bgStyle = hasBg ? getBackgroundStyle(block?.styles, { backgroundColor: rawBg }) : {};
  const pt = (block?.styles?.paddingTop as string) || (block?.props?.padding as string) || (hasBg ? "16px" : undefined);
  const pb = (block?.styles?.paddingBottom as string) || (block?.props?.padding as string) || (hasBg ? "16px" : undefined);
  const pl = (block?.styles?.paddingLeft as string) || (block?.props?.padding as string) || (hasBg ? "16px" : undefined);
  const pr = (block?.styles?.paddingRight as string) || (block?.props?.padding as string) || (hasBg ? "16px" : undefined);

  return (
    <div className="w-full flex flex-col gap-2">
      {!isPreviewMode && (
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-brand-mute select-none">
          <span className="flex items-center gap-1.5 font-semibold text-brand-body uppercase">
            <span>{cols}-Column Row Container</span>
            {cols === 2 && preset !== "equal" && (
              <span className="text-[10px] text-brand-mute font-normal">({preset})</span>
            )}
          </span>
          <span className="text-[10px] text-brand-mute">Gap: {gap}</span>
        </div>
      )}
      <div
        className={`w-full grid text-brand-ink dark:text-brand-ink transition-all min-h-[40px] ${hasBg ? "rounded-md" : ""}`}
        style={{
          gridTemplateColumns: activeCols,
          gap,
          alignItems,
          width: "100%",
          boxSizing: "border-box",
          ...bgStyle,
          paddingTop: pt,
          paddingBottom: pb,
          paddingLeft: pl,
          paddingRight: pr,
        }}
      >
        {renderChildren ? renderChildren() : null}
      </div>
    </div>
  );
};