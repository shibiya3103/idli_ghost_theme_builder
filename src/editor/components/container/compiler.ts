import { BuilderBlock } from "@/types/theme";
import { getBackgroundCSS } from "../shared/background";

export const compileToHbs = (block: BuilderBlock, compiledChildren: string) => {
  const rawMaxWidth = (block.props?.maxWidth as string) || (block.styles?.width as string) || "var(--container-width, 1200px)";
  const maxWidth = `min(${rawMaxWidth}, 100%)`;
  const alignment = (block.props?.alignment as string) || "center";
  const margin = alignment === "left" ? "0 auto 0 0" : alignment === "right" ? "0 0 0 auto" : "0 auto";
  const paddingTop = (block.styles?.paddingTop as string) || (block.props?.paddingY as string) || "0px";
  const paddingBottom = (block.styles?.paddingBottom as string) || (block.props?.paddingY as string) || "0px";
  const paddingLeft = (block.styles?.paddingLeft as string) || (block.props?.paddingX as string) || "clamp(1rem, 4vw, 2.5rem)";
  const paddingRight = (block.styles?.paddingRight as string) || (block.props?.paddingX as string) || "clamp(1rem, 4vw, 2.5rem)";
  const rawBg = (block.styles?.backgroundColor as string) || (block.props?.backgroundColor as string) || "";
  const bgType = block.styles?.backgroundType || "solid";
  const hasBg = (rawBg && rawBg !== "transparent") || (bgType && bgType !== "solid");
  const bgCss = hasBg ? ` ${getBackgroundCSS(block.styles, { backgroundColor: rawBg })} border-radius: 6px;` : "";
  const direction = (block.props?.direction as string) || "column";
  const gap = (block.props?.gap as string) || "16px";
  const flexStyle = direction === "row" ? ` display: flex; flex-direction: row; flex-wrap: wrap; gap: ${gap}; align-items: flex-start;` : "";

  return `<div class="container-inner" style="width: 100%; max-width: ${maxWidth}; margin: ${margin}; padding-left: ${paddingLeft}; padding-right: ${paddingRight}; padding-top: ${paddingTop}; padding-bottom: ${paddingBottom}; box-sizing: border-box;${bgCss}${flexStyle}">
  ${compiledChildren}
</div>`;
};