import { BuilderBlock } from "@/types/theme";
import { resolveRelatedPostsProps } from "./schema";
import { getBackgroundCSS } from "../shared/background";
import { escapeHtml } from "../shared/escape";

function resolveStyleValue(val: unknown, fallback: string = ""): string {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return `${val}px`;
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.desktop === "string") return obj.desktop;
    if (typeof obj.desktop === "number") return `${obj.desktop}px`;
  }
  return fallback;
}

export const compileToHbs = (block: BuilderBlock): string => {
  const p = resolveRelatedPostsProps(block.props);
  const styles = block.styles || {};
  const marginBottom = resolveStyleValue(styles.marginBottom, "");
  const wrapperId = (block.props?.advanced as Record<string, unknown> | undefined)?.htmlAnchor as string || `related-${block.id}`;
  const styleAttr = marginBottom ? ` style="margin-bottom: ${marginBottom};"` : "";
  const limit = Math.min(Math.max(1, p.count), 12);
  const autoScroll = Boolean(p.autoScroll);
  const layout = p.layout || "grid";

  const headingColor = p.headingColor || "#171717";
  const descriptionColor = p.descriptionColor || "#666666";
  const cardTitleColor = p.cardTitleColor || "#171717";
  const cardTextColor = p.cardTextColor || "#4d4d4d";

  const bgCss = getBackgroundCSS(styles, p.appearance);
  const isMesh = styles.backgroundType === "mesh";

  const imageMarkup = p.showImage
    ? `\n          {{#if feature_image}}
          <div class="gh-related-image">
            <img src="{{img_url feature_image size="m"}}" alt="{{title}}" loading="lazy" />
          </div>
          {{/if}}`
    : "";

  const secondaryImageMarkup = p.showImage
    ? `\n          {{#if feature_image}}
          <div class="gh-related-secondary-image">
            <img src="{{img_url feature_image size="s"}}" alt="{{title}}" loading="lazy" />
          </div>
          {{/if}}`
    : "";

  const listImageMarkup = p.showImage
    ? `\n          {{#if feature_image}}
          <div class="gh-related-list-image">
            <img src="{{img_url feature_image size="m"}}" alt="{{title}}" loading="lazy" />
          </div>
          {{/if}}`
    : "";

  const bentoImageMarkup = p.showImage
    ? `\n          {{#if feature_image}}
          <div class="gh-related-bento-image">
            <img src="{{img_url feature_image size="m"}}" alt="{{title}}" loading="lazy" />
          </div>
          {{/if}}`
    : "";

  const masonryImageMarkup = p.showImage
    ? `\n          {{#if feature_image}}
          <div class="gh-related-masonry-image">
            <img src="{{img_url feature_image size="m"}}" alt="{{title}}" loading="lazy" />
          </div>
          {{/if}}`
    : "";

  const excerptMarkup = p.showExcerpt
    ? `\n            <p class="gh-related-excerpt">{{#if custom_excerpt}}{{custom_excerpt}}{{else}}{{excerpt words="20"}}{{/if}}</p>`
    : "";

  let layoutMarkup = "";

  if (layout === "split") {
    layoutMarkup = `
    <div class="gh-related-split">
      {{#foreach related}}
        {{#if @first}}
          <article class="gh-related-main-card">
            <a class="gh-related-card-link" href="{{url}}">
              ${imageMarkup}
              <div class="gh-related-main-content">
                {{#if primary_tag}}
                  <span class="gh-related-tag">{{primary_tag.name}}</span>
                {{/if}}
                <h3 class="gh-related-main-title">{{title}}</h3>
                ${excerptMarkup}
              </div>
            </a>
          </article>
          <div class="gh-related-secondary-list">
        {{else}}
          <article class="gh-related-secondary-card">
            <a class="gh-related-secondary-link" href="{{url}}">
              ${secondaryImageMarkup}
              <div class="gh-related-secondary-content">
                {{#if primary_tag}}
                  <span class="gh-related-tag">{{primary_tag.name}}</span>
                {{/if}}
                <h4 class="gh-related-secondary-title">{{title}}</h4>
              </div>
            </a>
          </article>
        {{/if}}
        {{#if @last}}
          </div>
        {{/if}}
      {{/foreach}}
    </div>`;
  } else if (layout === "grid") {
    layoutMarkup = `
    <div class="gh-related-grid">
      {{#foreach related}}
        <article class="gh-related-card">
          <a class="gh-related-card-link" href="{{url}}">
            ${imageMarkup}
            <div class="gh-related-content">
              {{#if primary_tag}}
                <span class="gh-related-tag">{{primary_tag.name}}</span>
              {{/if}}
              <h3 class="gh-related-title">{{title}}</h3>
              ${excerptMarkup}
            </div>
          </a>
        </article>
      {{/foreach}}
    </div>`;
  } else if (layout === "list") {
    layoutMarkup = `
    <div class="gh-related-list">
      {{#foreach related}}
        <article class="gh-related-list-card">
          <a class="gh-related-list-link" href="{{url}}">
            ${listImageMarkup}
            <div class="gh-related-list-content">
              {{#if primary_tag}}
                <span class="gh-related-tag">{{primary_tag.name}}</span>
              {{/if}}
              <h3 class="gh-related-title-list">{{title}}</h3>
              ${excerptMarkup}
            </div>
          </a>
        </article>
      {{/foreach}}
    </div>`;
  } else if (layout === "carousel") {
    if (autoScroll) {
      layoutMarkup = `
      <div class="gh-related-carousel gh-related-carousel-autoscroll">
        <div class="carousel-track-container">
          <div class="carousel-track">
            {{#foreach related}}
              <article class="gh-related-carousel-card">
                <a class="gh-related-card-link" href="{{url}}">
                  ${imageMarkup}
                  <div class="gh-related-content">
                    {{#if primary_tag}}
                      <span class="gh-related-tag">{{primary_tag.name}}</span>
                    {{/if}}
                    <h3 class="gh-related-title">{{title}}</h3>
                    ${excerptMarkup}
                  </div>
                </a>
              </article>
            {{/foreach}}
            {{#foreach related}}
              <article class="gh-related-carousel-card">
                <a class="gh-related-card-link" href="{{url}}">
                  ${imageMarkup}
                  <div class="gh-related-content">
                    {{#if primary_tag}}
                      <span class="gh-related-tag">{{primary_tag.name}}</span>
                    {{/if}}
                    <h3 class="gh-related-title">{{title}}</h3>
                    ${excerptMarkup}
                  </div>
                </a>
              </article>
            {{/foreach}}
          </div>
        </div>
      </div>`;
    } else {
      layoutMarkup = `
      <div class="gh-related-carousel">
        {{#foreach related}}
          <article class="gh-related-carousel-card">
            <a class="gh-related-card-link" href="{{url}}">
              ${imageMarkup}
              <div class="gh-related-content">
                {{#if primary_tag}}
                  <span class="gh-related-tag">{{primary_tag.name}}</span>
                {{/if}}
                <h3 class="gh-related-title">{{title}}</h3>
                ${excerptMarkup}
              </div>
            </a>
          </article>
        {{/foreach}}
      </div>`;
    }
  } else if (layout === "bento") {
    layoutMarkup = `
    <div class="gh-related-bento">
      {{#foreach related}}
        <article class="gh-related-bento-card">
          <a class="gh-related-card-link" href="{{url}}">
            ${bentoImageMarkup}
            <div class="gh-related-bento-content">
              <div class="gh-related-bento-meta">
                {{#if primary_author}}
                  {{#if primary_author.profile_image}}
                    <img class="gh-related-author-avatar" src="{{primary_author.profile_image}}" alt="{{primary_author.name}}" />
                  {{/if}}
                {{/if}}
                {{#if primary_tag}}
                  <span class="gh-related-tag">{{primary_tag.name}}</span>
                {{/if}}
                <span class="gh-related-date">{{date format="MMM D, YYYY"}}</span>
              </div>
              <h3 class="gh-related-bento-title">{{title}}</h3>
              ${excerptMarkup}
              <span class="gh-related-read-more">Read Full Article &rarr;</span>
            </div>
          </a>
        </article>
      {{/foreach}}
    </div>`;
  } else if (layout === "editorial") {
    layoutMarkup = `
    <div class="gh-related-editorial">
      <div class="gh-related-editorial-top">
        {{#foreach related}}
          {{#if @first}}
            <article class="gh-related-editorial-main">
              <a class="gh-related-card-link" href="{{url}}">
                ${imageMarkup}
                <div class="gh-related-editorial-content">
                  {{#if primary_tag}}
                    <span class="gh-related-tag">{{primary_tag.name}}</span>
                  {{/if}}
                  <h3 class="gh-related-editorial-title">{{title}}</h3>
                  ${excerptMarkup}
                </div>
              </a>
            </article>
            <div class="gh-related-editorial-sidebar">
              <div class="editorial-sidebar-header">
                <span class="editorial-star">&#9733;</span>
                <h4>Recommended</h4>
              </div>
              <ul class="editorial-sidebar-list">
          {{else}}
            <li class="editorial-sidebar-item">
              <a href="{{url}}">
                <span class="editorial-index">0{{@index}}</span>
                <div class="editorial-info">
                  <h5>{{title}}</h5>
                  <span class="editorial-date">{{date format="MMM D"}}</span>
                </div>
              </a>
            </li>
          {{/if}}
          {{#if @last}}
              </ul>
            </div>
          {{/if}}
        {{/foreach}}
      </div>
    </div>`;
  } else if (layout === "masonry") {
    if (autoScroll) {
      layoutMarkup = `
      <div class="gh-related-masonry-autoscroll">
        <div class="masonry-autoscroll-grid">
          <div class="masonry-column masonry-col-up">
            <div class="masonry-column-track">
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
            </div>
          </div>
          <div class="masonry-column masonry-col-down">
            <div class="masonry-column-track">
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
            </div>
          </div>
          <div class="masonry-column masonry-col-up">
            <div class="masonry-column-track">
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
              {{#foreach related}}
                <article class="gh-related-masonry-card">
                  <a class="gh-related-card-link" href="{{url}}">
                    ${masonryImageMarkup}
                    <div class="gh-related-content">
                      {{#if primary_tag}}
                        <span class="gh-related-tag">{{primary_tag.name}}</span>
                      {{/if}}
                      <h3 class="gh-related-title">{{title}}</h3>
                      ${excerptMarkup}
                    </div>
                  </a>
                </article>
              {{/foreach}}
            </div>
          </div>
        </div>
      </div>`;
    } else {
      layoutMarkup = `
      <div class="gh-related-masonry">
        {{#foreach related}}
          <article class="gh-related-masonry-card">
            <a class="gh-related-card-link" href="{{url}}">
              ${masonryImageMarkup}
              <div class="gh-related-content">
                {{#if primary_tag}}
                  <span class="gh-related-tag">{{primary_tag.name}}</span>
                {{/if}}
                <h3 class="gh-related-title">{{title}}</h3>
                ${excerptMarkup}
              </div>
            </a>
          </article>
        {{/foreach}}
      </div>`;
    }
  }

  return `<style>
  #${wrapperId} {
    ${bgCss}
    width: 100%;
    max-width: min(var(--container-width, 1200px), 100%);
    margin-left: auto;
    margin-right: auto;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem);
    box-sizing: border-box;
    border-radius: var(--radius-md, 8px);
  }
  #${wrapperId} .gh-related-header {
    margin-bottom: 2rem;
    text-align: center;
  }
  #${wrapperId} .gh-related-heading {
    font-family: var(--font-heading, inherit);
    font-size: 1.5rem;
    font-weight: 700;
    color: ${headingColor};
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.015em;
  }
  #${wrapperId} .gh-related-description {
    font-size: 0.875rem;
    color: ${descriptionColor};
    margin: 0;
    line-height: 1.5;
  }
  #${wrapperId} .gh-related-tag {
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: var(--ghost-accent-color, var(--color-accent));
    margin-bottom: 0.25rem;
    display: inline-block;
  }
  #${wrapperId} .gh-related-card-link,
  #${wrapperId} .gh-related-list-link,
  #${wrapperId} .gh-related-secondary-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Color mappings */
  #${wrapperId} .gh-related-title,
  #${wrapperId} .gh-related-main-title,
  #${wrapperId} .gh-related-secondary-title,
  #${wrapperId} .gh-related-title-list,
  #${wrapperId} .gh-related-bento-title,
  #${wrapperId} .gh-related-editorial-title {
    color: ${cardTitleColor};
  }
  #${wrapperId} .gh-related-excerpt {
    color: ${cardTextColor};
    font-size: 0.75rem;
    line-height: 1.5;
    margin: 0.5rem 0 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 1. Split Layout */
  #${wrapperId} .gh-related-split {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 992px) {
    #${wrapperId} .gh-related-split {
      grid-template-columns: 7fr 5fr;
    }
  }
  #${wrapperId} .gh-related-main-card {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 0.375rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  #${wrapperId} .gh-related-main-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  #${wrapperId} .gh-related-main-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
  }
  #${wrapperId} .gh-related-secondary-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  #${wrapperId} .gh-related-secondary-card {
    border-bottom: 1px solid var(--color-border, #ebebeb);
    padding-bottom: 1.25rem;
  }
  #${wrapperId} .gh-related-secondary-card:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  #${wrapperId} .gh-related-secondary-link {
    flex-direction: row;
    gap: 1rem;
    align-items: flex-start;
  }
  #${wrapperId} .gh-related-secondary-image {
    width: 6rem;
    height: 5rem;
    flex-shrink: 0;
    border-radius: 0.25rem;
    overflow: hidden;
    background: var(--color-canvas-soft, #fafafa);
  }
  #${wrapperId} .gh-related-secondary-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #${wrapperId} .gh-related-secondary-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  #${wrapperId} .gh-related-secondary-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }

  /* 2. Grid Layout */
  #${wrapperId} .gh-related-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(1rem, 2.5vw, 1.5rem);
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 640px) {
    #${wrapperId} .gh-related-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1024px) {
    #${wrapperId} .gh-related-grid {
      grid-template-columns: repeat(${Math.min(limit, 3)}, 1fr);
    }
  }
  #${wrapperId} .gh-related-card,
  #${wrapperId} .gh-related-carousel-card {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  #${wrapperId} .gh-related-card:hover,
  #${wrapperId} .gh-related-carousel-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  #${wrapperId} .gh-related-image {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--color-canvas-soft, #fafafa);
    width: 100%;
    display: block;
  }
  #${wrapperId} .gh-related-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s;
  }
  #${wrapperId} .gh-related-card:hover .gh-related-image img {
    transform: scale(1.03);
  }
  #${wrapperId} .gh-related-content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }
  #${wrapperId} .gh-related-title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.35;
    margin: 0;
  }

  /* 3. List Layout */
  #${wrapperId} .gh-related-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  #${wrapperId} .gh-related-list-card {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 0.375rem;
    padding: 1rem;
  }
  #${wrapperId} .gh-related-list-link {
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }
  #${wrapperId} .gh-related-list-image {
    width: 10rem;
    height: 7rem;
    flex-shrink: 0;
    border-radius: 0.25rem;
    overflow: hidden;
    background: var(--color-canvas-soft, #fafafa);
  }
  #${wrapperId} .gh-related-list-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #${wrapperId} .gh-related-list-content {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
  }
  #${wrapperId} .gh-related-title-list {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  /* 4. Carousel Layout */
  #${wrapperId} .gh-related-carousel {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    scroll-snap-type: x mandatory;
    width: 100%;
    box-sizing: border-box;
  }
  #${wrapperId} .gh-related-carousel-card {
    min-width: 260px;
    max-width: 300px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
  #${wrapperId} .carousel-track-container {
    overflow: hidden;
    width: 100%;
    padding: 0.5rem 0;
  }
  #${wrapperId} .carousel-track {
    display: flex;
    gap: 1.5rem;
    width: max-content;
    animation: ghMarquee 25s linear infinite;
  }
  #${wrapperId} .gh-related-carousel-autoscroll:hover .carousel-track {
    animation-play-state: paused;
  }
  @keyframes ghMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* 5. Bento Layout */
  #${wrapperId} .gh-related-bento {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 768px) {
    #${wrapperId} .gh-related-bento {
      grid-template-columns: repeat(2, 1fr);
    }
    #${wrapperId} .gh-related-bento-card:nth-child(3n+1) {
      grid-column: span 2;
    }
  }
  #${wrapperId} .gh-related-bento-card {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 1rem;
    overflow: hidden;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  #${wrapperId} .gh-related-bento-image {
    aspect-ratio: 16 / 9;
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--color-canvas-soft, #fafafa);
  }
  #${wrapperId} .gh-related-bento-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #${wrapperId} .gh-related-bento-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  #${wrapperId} .gh-related-bento-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.6875rem;
    color: var(--color-mute, #888888);
  }
  #${wrapperId} .gh-related-author-avatar {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    object-fit: cover;
  }
  #${wrapperId} .gh-related-bento-title {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }
  #${wrapperId} .gh-related-read-more {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ghost-accent-color, var(--color-accent));
    margin-top: 0.25rem;
  }
  #${wrapperId} .gh-related-date {
    font-size: 0.6875rem;
    color: var(--color-mute, #888888);
  }

  /* 6. Editorial Layout */
  #${wrapperId} .gh-related-editorial-top {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 992px) {
    #${wrapperId} .gh-related-editorial-top {
      grid-template-columns: 7fr 5fr;
    }
  }
  #${wrapperId} .gh-related-editorial-main {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 0.75rem;
    overflow: hidden;
  }
  #${wrapperId} .gh-related-editorial-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  #${wrapperId} .gh-related-editorial-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }
  #${wrapperId} .gh-related-editorial-sidebar {
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  #${wrapperId} .editorial-sidebar-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border, #ebebeb);
  }
  #${wrapperId} .editorial-star {
    color: #f59e0b;
    font-size: 1rem;
  }
  #${wrapperId} .editorial-sidebar-header h4 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    color: ${headingColor};
  }
  #${wrapperId} .editorial-sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  #${wrapperId} .editorial-sidebar-item a {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
  }
  #${wrapperId} .editorial-index {
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--ghost-accent-color, var(--color-accent));
  }
  #${wrapperId} .editorial-info h5 {
    font-size: 0.8125rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: ${cardTitleColor};
  }
  #${wrapperId} .editorial-date {
    font-size: 0.6875rem;
    color: var(--color-mute, #888888);
  }

  /* 7. Masonry Layout */
  #${wrapperId} .gh-related-masonry {
    column-count: 1;
    column-gap: 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 640px) {
    #${wrapperId} .gh-related-masonry {
      column-count: 2;
    }
  }
  @media (min-width: 1024px) {
    #${wrapperId} .gh-related-masonry {
      column-count: 3;
    }
  }
  #${wrapperId} .gh-related-masonry-card {
    break-inside: avoid;
    margin-bottom: 1.5rem;
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #ebebeb);
    border-radius: 0.75rem;
    overflow: hidden;
  }
  #${wrapperId} .gh-related-masonry-image {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--color-canvas-soft, #fafafa);
  }
  #${wrapperId} .gh-related-masonry-card:nth-child(3n+1) .gh-related-masonry-image {
    aspect-ratio: 1 / 1;
  }
  #${wrapperId} .gh-related-masonry-card:nth-child(3n+2) .gh-related-masonry-image {
    aspect-ratio: 4 / 5;
  }
  #${wrapperId} .gh-related-masonry-card:nth-child(3n+3) .gh-related-masonry-image {
    aspect-ratio: 16 / 9;
  }
  #${wrapperId} .gh-related-masonry-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #${wrapperId} .masonry-autoscroll-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    height: 500px;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
  }
  #${wrapperId} .masonry-column {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  #${wrapperId} .masonry-column-track {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  #${wrapperId} .masonry-col-up .masonry-column-track {
    animation: ghScrollUp 30s linear infinite;
  }
  #${wrapperId} .masonry-col-down .masonry-column-track {
    animation: ghScrollDown 30s linear infinite;
  }
  #${wrapperId} .gh-related-masonry-autoscroll:hover .masonry-column-track {
    animation-play-state: paused;
  }
  @keyframes ghScrollUp {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  @keyframes ghScrollDown {
    0% { transform: translateY(-50%); }
    100% { transform: translateY(0); }
  }

  @media (max-width: 640px) {
    #${wrapperId} {
      padding: 2rem 1rem;
    }
  }
  html.dark #${wrapperId} .gh-related-card,
  html.dark #${wrapperId} .gh-related-main-card,
  html.dark #${wrapperId} .gh-related-list-card,
  html.dark #${wrapperId} .gh-related-bento-card,
  html.dark #${wrapperId} .gh-related-editorial-main,
  html.dark #${wrapperId} .gh-related-editorial-sidebar,
  html.dark #${wrapperId} .gh-related-masonry-card {
    background-color: var(--color-bg, #111111);
    border-color: var(--color-hairline, #333333);
  }
</style>
<section id="${wrapperId}" class="gh-related-posts ${isMesh ? "mesh-glow" : ""}"${styleAttr}>
  ${
    p.heading || p.description
      ? `<div class="gh-related-header">
    ${p.heading ? `<h3 class="gh-related-heading">${escapeHtml(p.heading)}</h3>` : ""}
    ${p.description ? `<p class="gh-related-description">${escapeHtml(p.description)}</p>` : ""}
  </div>`
      : ""
  }
  {{#get "posts" filter="tags:{{primary_tag.slug}}+id:-{{id}}" limit="${limit}" include="authors,tags" as |related|}}
    {{#if related}}
    ${layoutMarkup}
    {{/if}}
  {{/get}}
</section>`;
};
