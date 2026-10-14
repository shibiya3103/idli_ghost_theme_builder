import { BuilderBlock } from "@/types/theme";
import { HeroSlide } from "./schema";
import { getBackgroundCSS } from "../shared/background";
import { escapeHtml, escapeUrl } from "../shared/escape";

function resolveStyleValue(val: unknown, fallback: string = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    return String(obj.desktop || obj.mobile || obj.tablet || fallback);
  }
  return fallback;
}

function resolveHbsAsset(url?: string): string {
  if (!url) return "";
  if (url.startsWith("asset://")) {
    const rel = url.replace(/^asset:\/\/(assets\/)?/, "");
    return `{{asset "${rel}"}}`;
  }
  return url;
}

export const compileToHbs = (block: BuilderBlock): string => {
  const p = block.props || {};
  const isCarousel = !!p.enableCarousel;
  const useSiteData = p.useSiteData ?? false;
  const useCoverImageAsBackground = p.useCoverImageAsBackground ?? true;
  const showCover = useSiteData && useCoverImageAsBackground;
  const textColor = (p.textColor as string) || "";
  const layout = (block.styles?.layout as string) || "center";

  const uid = `hero-${Math.random().toString(36).slice(2, 9)}`;

  const pt = resolveStyleValue(block.styles?.paddingTop, "3rem");
  const pb = resolveStyleValue(block.styles?.paddingBottom, "5rem");
  const bgCSS = getBackgroundCSS(block.styles as Record<string, unknown>);

  let r = 0, g = 0, b = 0;
  const overlayColor = (block.styles?.bgOverlayColor as string) || "#000000";
  if (overlayColor.length === 7) {
    r = parseInt(overlayColor.slice(1, 3), 16);
    g = parseInt(overlayColor.slice(3, 5), 16);
    b = parseInt(overlayColor.slice(5, 7), 16);
  }
  const overlayOpacity = block.styles?.bgOverlayOpacity !== undefined ? (block.styles.bgOverlayOpacity as number) : 0.6;
  const overlay = `rgba(${r}, ${g}, ${b}, ${overlayOpacity})`;

  let blockTextAlign = "center";
  let contentFlexDirectionDesktop = "column";
  const contentFlexDirectionMobile = "column";
  let contentAlignItems = "center";
  let textContainerAlignItems = "center";
  let actionsJustifyContent = "center";
  let contentMaxWidth = "800px";
  let blockDisplay = "block";
  const blockFlexDirection = "column";
  let blockJustifyContent = "flex-start";

  switch (layout) {
    case "left":
      blockTextAlign = "left";
      contentAlignItems = "flex-start";
      textContainerAlignItems = "flex-start";
      actionsJustifyContent = "flex-start";
      break;
    case "bottom":
      blockTextAlign = "center";
      blockDisplay = "flex";
      blockJustifyContent = "flex-end";
      break;
    case "split-left":
      blockTextAlign = "left";
      contentFlexDirectionDesktop = "row";
      contentAlignItems = "center";
      textContainerAlignItems = "flex-start";
      actionsJustifyContent = "flex-start";
      contentMaxWidth = "1200px";
      break;
    case "split-right":
      blockTextAlign = "left";
      contentFlexDirectionDesktop = "row-reverse";
      contentAlignItems = "center";
      textContainerAlignItems = "flex-start";
      actionsJustifyContent = "flex-start";
      contentMaxWidth = "1200px";
      break;
    case "center":
    default:
      break;
  }

  // Common styles shared across carousel and standard hero
  const commonStyles = `
<style>
  #${uid}.hero-block {
    ${showCover ? 'background-color: #111111; background-size: cover; background-position: center;' : bgCSS}
    position: relative;
    overflow: hidden;
    text-align: ${blockTextAlign};
    padding: ${pt} 0 ${pb} 0;
    ${blockDisplay === 'flex' ? `display: flex; flex-direction: ${blockFlexDirection}; justify-content: ${blockJustifyContent};` : ''}
    ${textColor ? `color: ${textColor};` : (showCover ? 'color: #ffffff;' : '')}
  }
  #${uid} .hero-content {
    display: flex;
    flex-direction: ${contentFlexDirectionMobile};
    align-items: ${contentAlignItems};
    justify-content: center;
    gap: 2rem;
    max-width: min(${contentMaxWidth}, 100%);
    margin: 0 auto;
    padding: 0 1rem;
    position: relative;
    z-index: 10;
    width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 640px) {
    #${uid} .hero-content {
      padding: 0 1.5rem;
      gap: 2.5rem;
    }
  }
  @media (min-width: 1024px) {
    #${uid} .hero-content {
      flex-direction: ${contentFlexDirectionDesktop};
    }
  }
  #${uid} .hero-text-container {
    display: flex;
    flex-direction: column;
    align-items: ${textContainerAlignItems};
    gap: 1.25rem;
    ${layout.startsWith('split') ? 'width: 100%; flex: 1;' : ''}
  }
  @media (min-width: 1024px) {
    #${uid} .hero-text-container {
      ${layout.startsWith('split') ? 'width: 50%;' : ''}
    }
  }
  @media (min-width: 768px) {
    #${uid} .hero-text-container:only-child {
      width: 100%;
      align-items: center;
      text-align: center;
    }
  }
  #${uid} .hero-image-container {
    width: 100%;
    display: flex;
    justify-content: center;
    flex: 1;
  }
  @media (min-width: 1024px) {
    #${uid} .hero-image-container {
      width: 50%;
    }
  }
  #${uid} .hero-image-container img {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    max-height: 600px;
    object-fit: cover;
  }
  #${uid} .hero-eyebrow {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: ${(showCover || textColor) ? 'rgba(255, 255, 255, 0.15)' : 'color-mix(in srgb, var(--ghost-accent-color, #0070f3) 15%, transparent)'};
    color: ${textColor ? textColor : (showCover ? '#ffffff' : 'var(--ghost-accent-color, #0070f3)')};
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  #${uid} .hero-title {
    font-family: var(--gh-font-heading, var(--font-heading));
    font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);
    font-weight: 700;
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: inherit;
  }
  #${uid} .hero-subtitle {
    font-family: var(--gh-font-body, var(--font-body));
    font-size: clamp(1rem, 1.25vw + 0.25rem, 1.25rem);
    color: inherit;
    opacity: 0.8;
    margin: 0;
    max-width: 600px;
    line-height: 1.625;
  }
  #${uid} .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: ${actionsJustifyContent};
    margin-top: 1.5rem;
    width: 100%;
  }
  #${uid} .hero-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem 2rem;
    border-radius: 9999px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  #${uid} .hero-btn-primary {
    background-color: ${p.buttonBgColor || 'var(--ghost-accent-color, var(--color-accent))'};
    color: ${p.buttonTextColor || '#ffffff'};
    border: 1px solid transparent;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  #${uid} .hero-btn-primary:hover {
    opacity: 0.9;
  }
  #${uid} .hero-btn-secondary {
    background-color: transparent;
    color: inherit;
    border: 2px solid ${(showCover || textColor) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
  }
  #${uid} .hero-btn-secondary:hover {
    border-color: ${(showCover || textColor) ? (textColor || '#ffffff') : 'var(--color-fg, #171717)'};
    ${!(showCover || textColor) ? 'color: var(--color-fg, #171717);' : ''}
  }
  html.dark #${uid}.hero-block {
    ${(() => {
      if (showCover) return '';
      if (block.styles?.backgroundType && block.styles.backgroundType !== 'solid') return '';
      const bg = (block.styles?.backgroundColor || '').trim().toLowerCase();
      const isDefault = !bg || bg === '#ffffff' || bg === '#fff' || bg === 'white'
        || bg === 'rgb(255, 255, 255)' || bg === 'rgb(255,255,255)'
        || bg.startsWith('var(--color-bg') || bg.startsWith('var(--color-canvas');
      return isDefault ? 'background-color: var(--color-bg, #111111);' : '';
    })()}
    ${!textColor && !showCover ? 'color: var(--color-fg, #ffffff);' : ''}
  }
  html.dark #${uid} .hero-btn-primary {
    background-color: ${p.buttonBgColor && p.buttonBgColor !== '#171717' ? p.buttonBgColor : 'var(--ghost-accent-color, var(--color-accent))'};
    color: ${p.buttonTextColor && p.buttonTextColor !== '#ffffff' ? p.buttonTextColor : '#ffffff'};
  }
  html.dark #${uid} .hero-btn-secondary {
    border-color: rgba(255,255,255,0.2);
  }
  html.dark #${uid} .hero-btn-secondary:hover {
    border-color: #ffffff;
    color: #ffffff;
  }
  html.dark #${uid} .hero-eyebrow {
    background-color: ${(showCover || textColor) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(59, 130, 246, 0.25)'};
    color: ${textColor ? textColor : (showCover ? '#ffffff' : '#60a5fa')};
  }

  /* Carousel specific styles */
  #${uid} .carousel-slide {
    display: none;
    width: 100%;
    animation: ${p.transitionEffect === 'fade' ? 'heroFade 0.5s ease-in-out' : 'heroSlide 0.4s ease-out'};
  }
  #${uid} .carousel-slide.active {
    display: block;
  }
  @keyframes heroFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes heroSlide {
    from { opacity: 0; transform: translateX(16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  #${uid} .carousel-btn-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    background-color: rgba(255, 255, 255, 0.85);
    color: var(--color-fg, #171717);
    border: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  #${uid} .carousel-btn-nav:hover {
    background-color: var(--color-bg, #ffffff);
    transform: translateY(-50%) scale(1.05);
  }
  #${uid} .carousel-prev { left: 1rem; }
  #${uid} .carousel-next { right: 1rem; }
  #${uid} .carousel-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
    position: relative;
    z-index: 20;
  }
  #${uid} .carousel-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background-color: rgba(0,0,0,0.2);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  #${uid} .carousel-dot.active {
    width: 1.75rem;
    background-color: var(--color-fg, #171717);
  }
  html.dark #${uid} .carousel-btn-nav {
    background-color: rgba(30, 30, 30, 0.85);
    color: var(--color-fg, #ffffff);
    border-color: rgba(255,255,255,0.1);
  }
  html.dark #${uid} .carousel-btn-nav:hover {
    background-color: #262626;
  }
  html.dark #${uid} .carousel-dot {
    background-color: rgba(255,255,255,0.3);
  }
  html.dark #${uid} .carousel-dot.active {
    background-color: var(--color-fg, #ffffff);
  }
</style>`;

  // If CAROUSEL is enabled
  if (isCarousel) {
    const isDynamic = p.carouselMode === "dynamic";
    const rawTag = (p.dynamicTag || "hero-carousel").replace(/^#\s*/, "").trim();
    const dynamicTag = rawTag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
    const showArrows = p.showArrows ?? true;
    const showDots = p.showDots ?? true;
    const autoplay = p.autoplay ?? true;
    const autoplayInterval = p.autoplayInterval || 5000;

    let slidesHtml = "";

    const slides: HeroSlide[] = (p.slides && p.slides.length > 0) ? p.slides : [
      {
        id: "slide-1",
        eyebrowText: "Featured",
        title: "Discover Verve Edition",
        subtitle: "Experience modern publishing with fluid visual storytelling.",
        buttonLabel: "Explore Now",
        buttonUrl: "#",
        imageUrl: "",
        imageAlt: "Slide 1 Image",
      }
    ];

    const staticSlidesHtml = slides.map((slide, idx) => `
    <div class="carousel-slide${idx === 0 ? ' active' : ''}" role="group" aria-roledescription="slide">
      <div class="hero-content">
        <div class="hero-text-container">
          ${slide.eyebrowText ? `<span class="hero-eyebrow">${escapeHtml(slide.eyebrowText)}</span>` : ''}
          <h1 class="hero-title heading">${escapeHtml(slide.title)}</h1>
          ${slide.subtitle ? `<p class="hero-subtitle text-content">${escapeHtml(slide.subtitle)}</p>` : ''}
          <div class="hero-actions">
            <a href="${escapeUrl(slide.buttonUrl)}" class="hero-btn hero-btn-primary">${escapeHtml(slide.buttonLabel || p.buttonLabel || "Learn More")}</a>
            ${(p.showSecondaryButton ?? true) ? `<a href="${escapeUrl(p.secondaryButtonUrl)}" class="hero-btn hero-btn-secondary">${escapeHtml(p.secondaryButtonLabel || "Documentation")}</a>` : ''}
          </div>
        </div>
        ${layout.startsWith('split') && slide.imageUrl ? `
        <div class="hero-image-container">
          <img src="${resolveHbsAsset(slide.imageUrl)}" alt="${escapeHtml(slide.imageAlt || slide.title)}" />
        </div>
        ` : ''}
      </div>
    </div>`).join('\n');

    if (isDynamic) {
      slidesHtml = `
  {{#get "posts" filter="tags:${dynamicTag}" include="tags,authors" limit="10"}}
    {{#if posts}}
      {{#foreach posts}}
      <div class="carousel-slide{{#if @first}} active{{/if}}" role="group" aria-roledescription="slide">
        <div class="hero-content">
          <div class="hero-text-container">
            {{#if primary_tag}}<span class="hero-eyebrow">{{primary_tag.name}}</span>{{/if}}
            <h1 class="hero-title heading">{{title}}</h1>
            {{#if excerpt}}<p class="hero-subtitle text-content">{{excerpt}}</p>{{/if}}
            <div class="hero-actions">
              <a href="{{url}}" class="hero-btn hero-btn-primary">${p.buttonLabel || "Read Article"}</a>
              ${(p.showSecondaryButton ?? true) ? `<a href="${p.secondaryButtonUrl || "#"}" class="hero-btn hero-btn-secondary">${p.secondaryButtonLabel || "Documentation"}</a>` : ''}
            </div>
          </div>
          ${layout.startsWith('split') ? `
          {{#if feature_image}}
          <div class="hero-image-container">
            <img src="{{img_url feature_image size="m"}}" alt="{{title}}" />
          </div>
          {{/if}}
          ` : ''}
        </div>
      </div>
      {{/foreach}}
    {{else}}
      ${staticSlidesHtml}
    {{/if}}
  {{/get}}`;
    } else {
      slidesHtml = staticSlidesHtml;
    }

    const scriptHtml = `
<script>
  (function() {
    const root = document.getElementById('${uid}');
    if (!root) return;
    const slides = root.querySelectorAll('.carousel-slide');
    const prevBtn = root.querySelector('.carousel-prev');
    const nextBtn = root.querySelector('.carousel-next');
    const dotsContainer = root.querySelector('.carousel-dots');

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsContainer) dotsContainer.style.display = 'none';
      return;
    }

    let dots = root.querySelectorAll('.carousel-dot');
    
    if (dotsContainer && dots.length === 0) {
      slides.forEach(function(_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dotsContainer.appendChild(dot);
      });
      dots = root.querySelectorAll('.carousel-dot');
    }

    let currentIndex = 0;
    let timer = null;

    function showSlide(index) {
      slides.forEach(function(s, i) {
        s.classList.toggle('active', i === index);
      });
      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === index);
      });
      currentIndex = index;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        const next = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(next);
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        const next = (currentIndex + 1) % slides.length;
        showSlide(next);
        resetTimer();
      });
    }

    const dotsElements = root.querySelectorAll('.carousel-dot');
    dotsElements.forEach(function(dot) {
      dot.addEventListener('click', function() {
        const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
        showSlide(idx);
        resetTimer();
      });
    });

    function resetTimer() {
      if (timer) clearInterval(timer);
      ${autoplay ? `timer = setInterval(function() {
        showSlide((currentIndex + 1) % slides.length);
      }, ${autoplayInterval});` : ''}
    }

    ${autoplay ? `
    root.addEventListener('mouseenter', function() {
      if (timer) clearInterval(timer);
    });
    root.addEventListener('mouseleave', function() {
      resetTimer();
    });
    resetTimer();` : ''}

    let touchStartX = 0;
    root.addEventListener('touchstart', function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });
    root.addEventListener('touchend', function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            showSlide((currentIndex + 1) % slides.length);
          } else {
            showSlide((currentIndex - 1 + slides.length) % slides.length);
          }
          resetTimer();
        }
      }
    }, { passive: true });
  })();
</script>`;

    const arrowsHtml = showArrows ? `
  <button type="button" class="carousel-btn-nav carousel-prev" aria-label="Previous slide">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  </button>
  <button type="button" class="carousel-btn-nav carousel-next" aria-label="Next slide">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>` : '';

    const dotsHtml = showDots ? `
  <div class="carousel-dots">
    ${isDynamic ? '' : ((p.slides as HeroSlide[] | undefined) || []).map((_: HeroSlide, idx: number) => `
      <button type="button" class="carousel-dot${idx === 0 ? ' active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
    `).join('')}
  </div>` : '';

    return `
${commonStyles}
<div id="${uid}" class="hero-block ${!showCover && block.styles?.backgroundType === "mesh" ? 'mesh-glow' : ''}">
  ${slidesHtml}
  ${arrowsHtml}
  ${dotsHtml}
</div>
${scriptHtml}`;
  }

  // STANDARD NON-CAROUSEL HERO
  const eyebrowHtml = p.eyebrowText
    ? `<span class="hero-eyebrow">${escapeHtml(p.eyebrowText)}</span>`
    : "";

  const title = useSiteData ? "{{@site.title}}" : escapeHtml(p.title || "Thoughts, stories & ideas.");
  const subtitle = useSiteData ? "{{@site.description}}" : escapeHtml(p.subtitle || "Insightful articles, thoughtful perspectives, and fresh ideas delivered directly to your feed.");
  const buttonLabel = escapeHtml(p.buttonLabel || "Start Reading");
  const buttonUrl = escapeUrl(p.buttonUrl || "#posts");
  const buttonBgColor = p.buttonBgColor;
  const buttonTextColor = p.buttonTextColor;
  const showSecondaryButton = p.showSecondaryButton ?? true;
  const secondaryButtonLabel = escapeHtml(p.secondaryButtonLabel || "Subscribe");
  const secondaryButtonUrl = escapeUrl(p.secondaryButtonUrl || "#newsletter");
  const imageUrl = p.imageUrl || "";
  const imageAlt = escapeHtml(p.imageAlt || "Hero Image");

  return `
${commonStyles}
<div id="${uid}" class="hero-block ${!showCover && block.styles?.backgroundType === "mesh" ? 'mesh-glow' : ''}" ${showCover ? `{{#if @site.cover_image}}style="background-image: linear-gradient(${overlay}, ${overlay}), url({{@site.cover_image}});"{{/if}}` : ''}>
  <div class="hero-content">
    <div class="hero-text-container">
      ${eyebrowHtml}
      <h1 class="hero-title heading">${title}</h1>
      <p class="hero-subtitle text-content">${subtitle}</p>
      <div class="hero-actions">
        <a href="${buttonUrl}" class="hero-btn hero-btn-primary" ${buttonBgColor || buttonTextColor ? `style="${buttonBgColor ? `background-color: ${buttonBgColor}; border-color: ${buttonBgColor};` : ''} ${buttonTextColor ? `color: ${buttonTextColor};` : ''}"` : ''}>${buttonLabel}</a>
        ${showSecondaryButton ? `<a href="${secondaryButtonUrl}" class="hero-btn hero-btn-secondary">${secondaryButtonLabel}</a>` : ''}
      </div>
    </div>
    ${layout.startsWith('split') ? (
      useSiteData ? `
    {{#if @site.cover_image}}
    <div class="hero-image-container">
      <img src="{{@site.cover_image}}" alt="{{@site.title}}" />
    </div>
    {{/if}}
      ` : (imageUrl ? `
    <div class="hero-image-container">
      <img src="${resolveHbsAsset(imageUrl)}" alt="${imageAlt}" />
    </div>
      ` : '')
    ) : ''}
  </div>
</div>`;
};