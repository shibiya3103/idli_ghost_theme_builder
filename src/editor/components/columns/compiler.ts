import { BuilderBlock } from "@/types/theme";
import { getBackgroundCSS } from "../shared/background";

export const compileToHbs = (block: BuilderBlock, compiledChildren: string) => {
  const cols = Number(block.props?.columnsCount) || 2;
  const preset = (block.props?.layoutPreset as string) || "equal";
  const gap = (block.props?.gap as string) || "24px";
  const align = (block.props?.alignItems as string) || "stretch";
  const stackMobile = block.props?.stackOnMobile !== false;

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

  const mobileRule = stackMobile
    ? `@media (max-width: 767px) { #cols-${block.id} { grid-template-columns: 1fr !important; } }`
    : "";
  const tabletRule = cols === 4
    ? `@media (min-width: 768px) and (max-width: 1024px) { #cols-${block.id} { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }`
    : "";

  const rawBg = (block.styles?.backgroundColor as string) || (block.props?.backgroundColor as string) || "";
  const bgType = block.styles?.backgroundType || "solid";
  const hasBg = Boolean((rawBg && rawBg !== "transparent") || (bgType && bgType !== "solid"));
  const bgCss = hasBg ? getBackgroundCSS(block.styles, { backgroundColor: rawBg }) : "";
  const pt = (block.styles?.paddingTop as string) || (block.props?.padding as string) || "";
  const pb = (block.styles?.paddingBottom as string) || (block.props?.padding as string) || "";
  const pl = (block.styles?.paddingLeft as string) || (block.props?.padding as string) || "";
  const pr = (block.styles?.paddingRight as string) || (block.props?.padding as string) || "";

  const paddingStyle = pt || pb || pl || pr
    ? `padding-top: ${pt || "0"}; padding-bottom: ${pb || "0"}; padding-left: ${pl || "0"}; padding-right: ${pr || "0"};`
    : (hasBg ? "padding: 16px;" : "");

  const extraStyles = [
    bgCss,
    paddingStyle,
    hasBg ? "border-radius: 6px;" : "",
  ].filter(Boolean).join(" ");

  return `<style>
  #cols-${block.id} {
    display: grid;
    grid-template-columns: ${templateCols};
    gap: ${gap};
    align-items: ${align};
    width: 100%;
    box-sizing: border-box;
    ${extraStyles}
  }
  ${mobileRule}
  ${tabletRule}
</style>
<div id="cols-${block.id}" class="theme-columns">
  ${compiledChildren}
</div>`;
};