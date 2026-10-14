import { BuilderBlock } from "@/types/theme";
import { resolvePostNavigationProps } from "./schema";

export const compileToHbs = (block: BuilderBlock): string => {
  const p = resolvePostNavigationProps(block.props);
  const styles = block.styles || {};
  const marginBottom = (styles.marginBottom as string) || "";
  const wrapperId = `post-nav-${block.id}`;
  const styleAttr = marginBottom ? ` style="margin-bottom: ${marginBottom};"` : "";

  const layoutStyle = p.layoutStyle || "split";

  const prevImageMarkup = p.showImage
    ? `\n      {{#if feature_image}}
      <div class="gh-post-nav-thumb">
        <img src="{{img_url feature_image size="xs"}}" alt="{{title}}" loading="lazy" />
      </div>
      {{/if}}`
    : "";

  const nextImageMarkup = p.showImage
    ? `\n      {{#if feature_image}}
      <div class="gh-post-nav-thumb">
        <img src="{{img_url feature_image size="xs"}}" alt="{{title}}" loading="lazy" />
      </div>
      {{/if}}`
    : "";

  const prevExcerptMarkup = p.showExcerpt
    ? `\n        <p class="gh-post-nav-excerpt">{{#if custom_excerpt}}{{custom_excerpt}}{{else}}{{excerpt words="12"}}{{/if}}</p>`
    : "";

  const nextExcerptMarkup = p.showExcerpt
    ? `\n        <p class="gh-post-nav-excerpt">{{#if custom_excerpt}}{{custom_excerpt}}{{else}}{{excerpt words="12"}}{{/if}}</p>`
    : "";

  let layoutMarkup = "";
  let layoutCss = "";

  if (layoutStyle === "minimal") {
    layoutCss = `
  #${wrapperId} .gh-post-nav-minimal-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  @media (min-width: 640px) {
    #${wrapperId} .gh-post-nav-minimal-container {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
  #${wrapperId} .gh-post-nav-minimal-link {
    text-decoration: none;
    color: inherit;
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: opacity 0.2s;
  }
  #${wrapperId} .gh-post-nav-minimal-link:hover {
    opacity: 0.8;
  }
  #${wrapperId} .gh-post-nav-minimal-link.gh-post-nav-next {
    text-align: right;
    align-items: flex-end;
  }
  #${wrapperId} .gh-post-nav-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-family: var(--font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #737373);
    font-weight: 600;
  }
  #${wrapperId} .gh-post-nav-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-fg, #171717);
    margin: 0.25rem 0 0 0;
    line-height: 1.35;
  }`;

    layoutMarkup = `
  <div class="gh-post-nav-minimal-container">
    {{#prev_post}}
    <a href="{{url}}" class="gh-post-nav-minimal-link gh-post-nav-prev">
      <span class="gh-post-nav-label">&larr; Previous Post</span>
      <h4 class="gh-post-nav-title">{{title}}</h4>
    </a>
    {{/prev_post}}
    {{#next_post}}
    <a href="{{url}}" class="gh-post-nav-minimal-link gh-post-nav-next">
      <span class="gh-post-nav-label">Next Post &rarr;</span>
      <h4 class="gh-post-nav-title">{{title}}</h4>
    </a>
    {{/next_post}}
  </div>`;
  } else if (layoutStyle === "centered-arrows") {
    layoutCss = `
  #${wrapperId} .gh-post-nav-centered-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  @media (min-width: 640px) {
    #${wrapperId} .gh-post-nav-centered-container {
      flex-direction: row;
      justify-content: space-between;
      align-items: stretch;
    }
  }
  #${wrapperId} .gh-post-nav-centered-link {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background-color: var(--color-bg, transparent);
    border-radius: var(--radius-lg, 12px);
    text-decoration: none;
    color: inherit;
    flex: 1;
    transition: background-color 0.2s;
  }
  #${wrapperId} .gh-post-nav-centered-link:hover {
    background-color: var(--color-canvas-soft, #f5f5f5);
  }
  html.dark #${wrapperId} .gh-post-nav-centered-link:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  #${wrapperId} .gh-post-nav-centered-link.gh-post-nav-next {
    flex-direction: row-reverse;
    text-align: right;
  }
  #${wrapperId} .gh-post-nav-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background-color: var(--color-bg, #ffffff);
    border: 1px solid var(--color-hairline, #ebebeb);
    color: var(--color-muted, #737373);
    font-size: 1.25rem;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  html.dark #${wrapperId} .gh-post-nav-arrow {
    background-color: var(--color-bg, #111111);
    border-color: var(--color-hairline, #333333);
  }
  #${wrapperId} .gh-post-nav-centered-link:hover .gh-post-nav-arrow {
    border-color: var(--color-primary, #171717);
    color: var(--color-primary, #171717);
  }
  html.dark #${wrapperId} .gh-post-nav-centered-link:hover .gh-post-nav-arrow {
    border-color: var(--color-primary, #ffffff);
    color: var(--color-primary, #ffffff);
  }
  #${wrapperId} .gh-post-nav-content {
    flex: 1;
    min-width: 0;
  }
  #${wrapperId} .gh-post-nav-label {
    display: block;
    font-size: 0.625rem;
    font-family: var(--font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #737373);
    font-weight: 600;
  }
  #${wrapperId} .gh-post-nav-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-fg, #171717);
    margin: 0.25rem 0 0 0;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }`;

    layoutMarkup = `
  <div class="gh-post-nav-centered-container">
    {{#prev_post}}
    <a href="{{url}}" class="gh-post-nav-centered-link gh-post-nav-prev">
      <div class="gh-post-nav-arrow">&larr;</div>
      <div class="gh-post-nav-content">
        <span class="gh-post-nav-label">Previous</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>
      </div>
    </a>
    {{/prev_post}}
    {{#next_post}}
    <a href="{{url}}" class="gh-post-nav-centered-link gh-post-nav-next">
      <div class="gh-post-nav-arrow">&rarr;</div>
      <div class="gh-post-nav-content">
        <span class="gh-post-nav-label">Next</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>
      </div>
    </a>
    {{/next_post}}
  </div>`;
  } else if (layoutStyle === "image-background") {
    layoutCss = `
  #${wrapperId} .gh-post-nav-image-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    #${wrapperId} .gh-post-nav-image-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  #${wrapperId} .gh-post-nav-image-link {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 240px;
    padding: 2rem;
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    text-decoration: none;
    background-color: var(--color-primary, #171717);
    background-size: cover;
    background-position: center;
  }
  #${wrapperId} .gh-post-nav-image-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    transition: background 0.2s;
    z-index: 0;
  }
  #${wrapperId} .gh-post-nav-image-link:hover .gh-post-nav-image-overlay {
    background: rgba(0, 0, 0, 0.5);
  }
  #${wrapperId} .gh-post-nav-image-content {
    position: relative;
    z-index: 10;
    color: #ffffff;
    text-align: left;
  }
  #${wrapperId} .gh-post-nav-image-link.gh-post-nav-next .gh-post-nav-image-content {
    text-align: right;
  }
  #${wrapperId} .gh-post-nav-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-family: var(--font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  #${wrapperId} .gh-post-nav-image-link:hover .gh-post-nav-label {
    color: #ffffff;
  }
  #${wrapperId} .gh-post-nav-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.25;
  }
  #${wrapperId} .gh-post-nav-image-link:hover .gh-post-nav-title {
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.5);
    text-underline-offset: 4px;
  }
  #${wrapperId} .gh-post-nav-excerpt {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0.5rem 0 0 0;
    line-height: 1.5;
  }`;

    layoutMarkup = `
  <div class="gh-post-nav-image-container">
    {{#prev_post}}
    <a href="{{url}}" class="gh-post-nav-image-link gh-post-nav-prev" {{#if feature_image}}style="background-image: url('{{img_url feature_image size="m"}}')"{{/if}}>
      <div class="gh-post-nav-image-overlay"></div>
      <div class="gh-post-nav-image-content">
        <span class="gh-post-nav-label">&larr; Previous Post</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>${prevExcerptMarkup}
      </div>
    </a>
    {{/prev_post}}
    {{#next_post}}
    <a href="{{url}}" class="gh-post-nav-image-link gh-post-nav-next" {{#if feature_image}}style="background-image: url('{{img_url feature_image size="m"}}')"{{/if}}>
      <div class="gh-post-nav-image-overlay"></div>
      <div class="gh-post-nav-image-content">
        <span class="gh-post-nav-label">Next Post &rarr;</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>${nextExcerptMarkup}
      </div>
    </a>
    {{/next_post}}
  </div>`;
  } else if (layoutStyle === "large-typography") {
    layoutCss = `
  #${wrapperId} .gh-post-nav-large-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  @media (min-width: 768px) {
    #${wrapperId} .gh-post-nav-large-container {
      flex-direction: row;
      justify-content: space-between;
      gap: 2rem;
    }
  }
  #${wrapperId} .gh-post-nav-large-link {
    text-decoration: none;
    color: inherit;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  #${wrapperId} .gh-post-nav-large-link:hover .gh-post-nav-label {
    color: var(--color-fg, #171717);
  }
  #${wrapperId} .gh-post-nav-large-link:hover .gh-post-nav-title {
    color: var(--ghost-accent-color, var(--color-accent));
  }
  html.dark #${wrapperId} .gh-post-nav-large-link:hover .gh-post-nav-label {
    color: #ffffff;
  }
  #${wrapperId} .gh-post-nav-large-link.gh-post-nav-next {
    text-align: right;
    align-items: flex-end;
  }
  #${wrapperId} .gh-post-nav-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-muted, #737373);
    margin-bottom: 0.75rem;
    transition: color 0.2s;
  }
  #${wrapperId} .gh-post-nav-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--color-fg, #171717);
    margin: 0;
    line-height: 1.15;
    letter-spacing: -0.02em;
    transition: color 0.2s;
  }
  #${wrapperId} .gh-post-nav-excerpt {
    font-size: 1rem;
    color: var(--color-muted, #737373);
    margin: 1rem 0 0 0;
    line-height: 1.5;
    max-width: 32rem;
  }`;

    layoutMarkup = `
  <div class="gh-post-nav-large-container">
    {{#prev_post}}
    <a href="{{url}}" class="gh-post-nav-large-link gh-post-nav-prev">
      <span class="gh-post-nav-label">&larr; Previous Article</span>
      <h4 class="gh-post-nav-title">{{title}}</h4>${prevExcerptMarkup}
    </a>
    {{/prev_post}}
    {{#next_post}}
    <a href="{{url}}" class="gh-post-nav-large-link gh-post-nav-next">
      <span class="gh-post-nav-label">Next Article &rarr;</span>
      <h4 class="gh-post-nav-title">{{title}}</h4>${nextExcerptMarkup}
    </a>
    {{/next_post}}
  </div>`;
  } else {
    // split or stacked
    const gridStyle = layoutStyle === "stacked"
      ? `
  #${wrapperId} .gh-post-nav-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 48rem;
    margin: 0 auto;
  }`
      : `
  #${wrapperId} .gh-post-nav-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    #${wrapperId} .gh-post-nav-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    #${wrapperId} .gh-post-nav-next:only-child {
      grid-column: 2;
    }
  }`;

    layoutCss = `
  ${gridStyle}
  #${wrapperId} .gh-post-nav-card {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background-color: var(--color-bg, #ffffff);
    border: 1px solid var(--color-hairline, #ebebeb);
    border-radius: var(--radius-md, 8px);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    box-sizing: border-box;
  }
  #${wrapperId} .gh-post-nav-card:hover {
    border-color: var(--color-primary, #171717);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  #${wrapperId} .gh-post-nav-next {
    flex-direction: row-reverse;
    text-align: right;
  }
  #${wrapperId} .gh-post-nav-thumb {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: var(--radius-sm, 4px);
    overflow: hidden;
    border: 1px solid var(--color-hairline, #ebebeb);
    flex-shrink: 0;
    background-color: var(--color-canvas-soft, #f5f5f5);
  }
  #${wrapperId} .gh-post-nav-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  #${wrapperId} .gh-post-nav-content {
    flex: 1;
    min-width: 0;
  }
  #${wrapperId} .gh-post-nav-label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    font-family: var(--font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #737373);
    font-weight: 600;
  }
  #${wrapperId} .gh-post-nav-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-fg, #171717);
    margin: 0.25rem 0 0 0;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #${wrapperId} .gh-post-nav-excerpt {
    font-size: 0.6875rem;
    color: var(--color-muted, #737373);
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  html.dark #${wrapperId} .gh-post-nav-card {
    background-color: var(--color-bg, #111111);
    border-color: var(--color-hairline, #333333);
  }`;

    layoutMarkup = `
  <div class="gh-post-nav-grid">
    {{#prev_post}}
    <a href="{{url}}" class="gh-post-nav-card gh-post-nav-prev">${prevImageMarkup}
      <div class="gh-post-nav-content">
        <span class="gh-post-nav-label">&larr; Previous Post</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>${prevExcerptMarkup}
      </div>
    </a>
    {{/prev_post}}
    {{#next_post}}
    <a href="{{url}}" class="gh-post-nav-card gh-post-nav-next">${nextImageMarkup}
      <div class="gh-post-nav-content">
        <span class="gh-post-nav-label">Next Post &rarr;</span>
        <h4 class="gh-post-nav-title">{{title}}</h4>${nextExcerptMarkup}
      </div>
    </a>
    {{/next_post}}
  </div>`;
  }

  return `<style>
  #${wrapperId} {
    width: 100%;
    max-width: min(var(--container-width, 1200px), 100%);
    margin-left: auto;
    margin-right: auto;
    padding: 2.5rem 1.5rem;
    border-top: 1px solid var(--color-hairline, #ebebeb);
    box-sizing: border-box;
  }
  @media (max-width: 640px) {
    #${wrapperId} {
      padding: 1.5rem 1rem;
    }
  }
  html.dark #${wrapperId} {
    border-top-color: var(--color-hairline, #333333);
  }
${layoutCss}
</style>
<nav id="${wrapperId}" class="gh-post-nav" data-layout="${layoutStyle}"${styleAttr}>
${layoutMarkup}
</nav>`;
};
