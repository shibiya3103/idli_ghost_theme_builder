import { BuilderBlock } from "@/types/theme";
import { getBackgroundCSS } from "../shared/background";

export const compileToHbs = (block: BuilderBlock, compiledChildren: string) => {
  const { backgroundVideoUrl, enableParallax = false, contentWidth } = block.styles || {};
  const rawMaxWidth = (block.props?.contentWidth as string) || (contentWidth as string) || "var(--container-width, 1200px)";
  const maxWidth = `min(${rawMaxWidth}, 100%)`;
  const videoHtml = backgroundVideoUrl
    ? `\n<video src="${backgroundVideoUrl}" autoplay loop muted playsinline style="position: ${
        enableParallax ? "fixed" : "absolute"
      }; top: 0; left: 0; width: ${
        enableParallax ? "100vw" : "100%"
      }; height: ${
        enableParallax ? "100vh" : "100%"
      }; object-fit: cover; z-index: 0; pointer-events: none;"></video>\n`
    : "";
  const extraClasses = [
    backgroundVideoUrl ? "relative overflow-hidden" : "",
    block.styles?.backgroundType === "mesh" ? "mesh-glow" : "",
  ].filter(Boolean).join(" ");
  const classAttr = extraClasses ? ` ${extraClasses}` : "";
  const bgCss = getBackgroundCSS(block.styles);
  const parallaxCss = backgroundVideoUrl && enableParallax ? "clip-path: inset(0px); " : "";
  const sectionStyle = ` style="${parallaxCss}${bgCss}"`;
  const innerStyle = ` style="max-width: ${maxWidth}; width: 100%; position: relative; z-index: 10; box-sizing: border-box;"`;

  return `<section class="section${classAttr}"${sectionStyle}>${videoHtml}
  <div class="container-width mx-auto px-4 sm:px-6"${innerStyle}>
    ${compiledChildren}
  </div>
</section>`;
};