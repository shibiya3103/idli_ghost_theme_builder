import { BuilderBlock } from "@/types/theme";
import { getBackgroundCSS } from "../shared/background";
import { escapeHtml } from "../shared/escape";

export const compileToHbs = (block: BuilderBlock) => {
  const bgCSS = getBackgroundCSS(block.styles);
  const layout = block.styles?.layout || "right";
  
  // Base wrapper styles
  let wrapperFlexDirectionDesktop = "row";
  let wrapperFlexDirectionMobile = "column";
  let wrapperJustifyContent = "space-between";
  let wrapperAlignItems = "center";
  let wrapperTextAlign = "left";
  
  // Text wrapper styles
  let textMaxWidth = "400px";
  let textWidth = "auto";
  
  // Form container styles
  let formMaxWidth = "320px";
  let formAlignItems = "stretch";
  
  switch (layout) {
    case "right":
      wrapperFlexDirectionDesktop = "row";
      wrapperFlexDirectionMobile = "column";
      wrapperJustifyContent = "space-between";
      wrapperAlignItems = "center";
      wrapperTextAlign = "left";
      textMaxWidth = "400px";
      formMaxWidth = "320px";
      break;
    case "left":
      wrapperFlexDirectionDesktop = "row-reverse";
      wrapperFlexDirectionMobile = "column"; // keep column on mobile for left? Usually row-reverse becomes column. Let's make mobile row-reverse or column-reverse. Actually, 'flex-col md:flex-row-reverse' means column on mobile.
      wrapperJustifyContent = "space-between";
      wrapperAlignItems = "center";
      wrapperTextAlign = "left";
      textMaxWidth = "400px";
      formMaxWidth = "320px";
      break;
    case "below":
      wrapperFlexDirectionDesktop = "column";
      wrapperFlexDirectionMobile = "column";
      wrapperJustifyContent = "flex-start";
      wrapperAlignItems = "flex-start";
      wrapperTextAlign = "left";
      textMaxWidth = "100%";
      textWidth = "100%";
      formMaxWidth = "100%";
      break;
    case "above":
      wrapperFlexDirectionDesktop = "column-reverse";
      wrapperFlexDirectionMobile = "column-reverse";
      wrapperJustifyContent = "flex-start";
      wrapperAlignItems = "flex-start";
      wrapperTextAlign = "left";
      textMaxWidth = "100%";
      textWidth = "100%";
      formMaxWidth = "100%";
      break;
    case "center":
      wrapperFlexDirectionDesktop = "column";
      wrapperFlexDirectionMobile = "column";
      wrapperJustifyContent = "flex-start";
      wrapperAlignItems = "center";
      wrapperTextAlign = "center";
      textMaxWidth = "600px";
      textWidth = "100%";
      formMaxWidth = "400px";
      formAlignItems = "center"; // to center the form inputs if it was flex column, but form is row.
      break;
  }
  
  return `<style>
  #newsletter-${block.id} {
    ${bgCSS}
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: var(--radius-md);
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: ${wrapperFlexDirectionMobile};
    justify-content: ${wrapperJustifyContent};
    align-items: ${wrapperAlignItems};
    text-align: ${wrapperTextAlign};
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    #newsletter-${block.id} {
      flex-direction: ${wrapperFlexDirectionDesktop};
    }
  }
  #newsletter-${block.id} .newsletter-text {
    flex-grow: 1;
    position: relative;
    z-index: 10;
    max-width: ${textMaxWidth};
    width: ${textWidth};
  }
  #newsletter-${block.id} .newsletter-title {
    font-family: var(--gh-font-heading, var(--font-heading));
    font-size: 1.125rem;
    font-weight: bold;
    margin: 0;
  }
  #newsletter-${block.id} .newsletter-subtitle {
    font-family: var(--gh-font-body, var(--font-body));
    font-size: 0.75rem;
    color: var(--color-muted);
    margin: 0;
  }
  #newsletter-${block.id} .newsletter-form {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: ${formMaxWidth};
    align-items: ${formAlignItems};
    position: relative;
    z-index: 10;
  }
  @media (min-width: 768px) {
    #newsletter-${block.id} .newsletter-form {
      width: ${formMaxWidth !== '100%' ? 'auto' : '100%'};
    }
  }
  #newsletter-${block.id} .input-field {
    padding: 0.5rem 1rem;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: var(--radius-sm);
    flex-grow: 1;
  }
  #newsletter-${block.id} .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background-color: var(--ghost-accent-color, var(--color-accent));
    color: #ffffff;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  #newsletter-${block.id} .btn-primary:hover {
    opacity: 0.85;
  }
  #newsletter-${block.id} .input-field:focus {
    border-color: var(--ghost-accent-color, var(--color-accent));
    outline: 2px solid var(--ghost-accent-color, var(--color-accent));
  }
  html.dark #newsletter-${block.id} {
    border-color: rgba(255,255,255,0.1);
  }
  html.dark #newsletter-${block.id} .input-field {
    background-color: var(--color-canvas-soft, #1a1a1a);
    border-color: rgba(255,255,255,0.15);
    color: var(--color-fg, #ffffff);
  }
  html.dark #newsletter-${block.id} .newsletter-title {
    color: var(--color-fg, #ffffff);
  }
</style>
<div id="newsletter-${block.id}" class="newsletter-block">
  <div class="newsletter-text">
    <h3 class="newsletter-title">${escapeHtml(block.props.title || "Subscribe to our publication")}</h3>
    <p class="newsletter-subtitle">${escapeHtml(block.props.subtitle || "Get the latest articles and design insights delivered directly to your inbox.")}</p>
  </div>
  <form class="newsletter-form">
    <input type="email" placeholder="${escapeHtml(block.props.placeholder || 'you@domain.com')}" required class="input-field" />
    <button type="submit" class="btn-primary shrink-0">${escapeHtml(block.props.buttonLabel || 'Subscribe')}</button>
  </form>
</div>`;
};