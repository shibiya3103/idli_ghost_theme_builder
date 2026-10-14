import { BuilderBlock } from "@/types/theme";
import { FAQProps, defaultProps } from "./schema";
import { getBackgroundCSS } from "../shared/background";
import { escapeHtml } from "../shared/escape";
import { isDarkColor } from "../heading/schema";

export const generateHTML = (block: BuilderBlock): string => {
  const p = { ...defaultProps, ...block.props } as FAQProps;
  const general = p.general;
  const items = p.items || [];
  const appearance = p.appearance;
  const spacing = p.spacing;
  const styles = block.styles || {};
  
  const bgCss = getBackgroundCSS(styles, appearance);
  const wrapperId = p.advanced?.htmlAnchor || `faq-${block.id}`;
  const cornerRadius = (general.itemCornerStyle || "rounded") === "rectangle" ? "0px" : "0.75rem";
  const itemBg = appearance?.itemBgColor || "var(--color-canvas-soft, #f8fafc)";
  const darkItemBg = (appearance?.itemBgColor && isDarkColor(appearance.itemBgColor))
    ? appearance.itemBgColor
    : "var(--color-canvas-soft, #1a1a1a)";
  
  const renderFaqItem = (item: FAQProps["items"][number], idx: number) => {
    const isFirst = idx === 0;
    const safeItemId = escapeHtml(item.id || idx);
    const questionText = escapeHtml(item.question || "");
    const answerText = escapeHtml(item.answer || "");
    return `
      <div class="faq-item">
        <dt>
          <button
            type="button"
            class="faq-button"
            aria-controls="faq-content-${block.id}-${safeItemId}"
            aria-expanded="${isFirst ? 'true' : 'false'}"
            data-faq-id="${safeItemId}"
          >
            <span class="faq-question">${questionText}</span>
            <span class="faq-chevron-wrapper">
              <svg class="faq-chevron" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </button>
        </dt>
        <dd 
          class="faq-answer-wrapper ${isFirst ? 'is-open' : ''}" 
          id="faq-content-${block.id}-${safeItemId}"
        >
          <div class="faq-answer-inner">
            <p class="faq-answer-text">${answerText}</p>
          </div>
        </dd>
      </div>
    `;
  };

  let contentHtml = "";

  if (general.layoutStyle === "two-column") {
    const mid = Math.ceil(items.length / 2);
    const col1 = items.slice(0, mid);
    const col2 = items.slice(mid);
    contentHtml = `
      <div class="faq-two-col mx-auto mt-12 max-w-7xl grid grid-cols-1 gap-x-8 gap-y-0 lg:grid-cols-2">
        <dl>
          ${col1.map((item, idx) => renderFaqItem(item, idx)).join("")}
        </dl>
        <dl class="lg:mt-0 mt-4">
          ${col2.map((item, idx) => renderFaqItem(item, idx + col1.length)).join("")}
        </dl>
      </div>
    `;
  } else if (general.layoutStyle === "categorized") {
    const categories = Array.from(new Set(items.map(i => i.category || "General")));
    let globalIndex = 0;
    contentHtml = `
      <div class="faq-categorized mx-auto mt-12 max-w-3xl">
        ${categories.map((cat) => {
          const catItems = items.filter(i => (i.category || "General") === cat);
          const safeCat = escapeHtml(cat);
          const catHtml = `
            <div class="faq-category mb-10">
              <h3 class="faq-category-title text-xl font-bold tracking-tight mb-4">${safeCat}</h3>
              <dl>
                ${catItems.map((item) => {
                  const html = renderFaqItem(item, globalIndex);
                  globalIndex++;
                  return html;
                }).join("")}
              </dl>
            </div>
          `;
          return catHtml;
        }).join("")}
      </div>
    `;
  } else {
    // Accordion default
    contentHtml = `
      <div class="faq-accordion mx-auto mt-12 max-w-3xl">
        <dl>
          ${items.map((item, idx) => renderFaqItem(item, idx)).join("")}
        </dl>
      </div>
    `;
  }

  const headingHtml = (general.heading || general.subheading) ? `
    <div class="faq-header mx-auto max-w-4xl text-center mb-8">
      ${general.heading ? `<h2 class="faq-heading text-3xl font-bold tracking-tight sm:text-4xl">${escapeHtml(general.heading)}</h2>` : ''}
      ${general.subheading ? `<p class="faq-subheading mt-4 text-base leading-7">${escapeHtml(general.subheading)}</p>` : ''}
    </div>
  ` : '';

  // Inline script for accordion interactivity
  const scriptHtml = `
    <script>
      (function() {
        var wrapper = document.getElementById('${wrapperId}');
        if (!wrapper) return;
        var allowMultiple = ${general.allowMultipleOpen ? 'true' : 'false'};
        var buttons = wrapper.querySelectorAll('.faq-button');
        
        buttons.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var isExpanded = btn.getAttribute('aria-expanded') === 'true';
            var targetId = btn.getAttribute('aria-controls');
            var content = document.getElementById(targetId);
            
            if (!allowMultiple && !isExpanded) {
              buttons.forEach(function(otherBtn) {
                if (otherBtn !== btn) {
                  otherBtn.setAttribute('aria-expanded', 'false');
                  var otherId = otherBtn.getAttribute('aria-controls');
                  var otherContent = document.getElementById(otherId);
                  if (otherContent) otherContent.classList.remove('is-open');
                }
              });
            }
            
            if (!isExpanded) {
              btn.setAttribute('aria-expanded', 'true');
              if (content) content.classList.add('is-open');
            } else {
              btn.setAttribute('aria-expanded', 'false');
              if (content) content.classList.remove('is-open');
            }
          });
        });
      })();
    </script>
  `;

  return `<style>
  #${wrapperId} {
    ${bgCss}
    padding-top: ${spacing.paddingTop || '4rem'};
    padding-bottom: ${spacing.paddingBottom || '4rem'};
    position: relative;
  }
  #${wrapperId} .faq-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  #${wrapperId} .faq-heading {
    font-family: var(--gh-font-heading, var(--font-heading));
    color: ${appearance.headingColor || 'var(--color-fg)'};
    margin: 0;
  }
  #${wrapperId} .faq-subheading {
    font-family: var(--gh-font-body, var(--font-body));
    color: ${appearance.subheadingColor || 'var(--color-mute)'};
  }
  #${wrapperId} .faq-category-title {
    font-family: var(--gh-font-heading, var(--font-heading));
    color: ${appearance.headingColor || 'var(--color-fg)'};
  }
  #${wrapperId} .faq-item {
    background-color: ${itemBg};
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: ${cornerRadius};
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease-in-out;
  }
  #${wrapperId} .faq-button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    gap: 1rem;
  }
  #${wrapperId} .faq-question {
    font-family: var(--gh-font-heading, var(--font-heading));
    font-weight: 700;
    font-size: 1.125rem;
    line-height: 1.4;
    color: ${appearance.headingColor || 'var(--color-fg)'};
    flex: 1;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  #${wrapperId} .faq-chevron-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, 0.04);
    flex-shrink: 0;
    transition: background-color 0.2s;
  }
  #${wrapperId} .faq-button:hover .faq-chevron-wrapper {
    background-color: rgba(0, 0, 0, 0.08);
  }
  #${wrapperId} .faq-chevron {
    width: 1rem;
    height: 1rem;
    transition: transform 0.3s ease-in-out;
    color: currentColor;
  }
  #${wrapperId} .faq-button[aria-expanded="true"] .faq-chevron {
    transform: rotate(180deg);
  }
  #${wrapperId} .faq-answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition: grid-template-rows 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease, padding-top 0.3s ease;
  }
  #${wrapperId} .faq-button[aria-expanded="true"] + .faq-answer-wrapper,
  #${wrapperId} .faq-answer-wrapper.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  #${wrapperId} .faq-answer-inner {
    overflow: hidden;
  }
  #${wrapperId} .faq-answer-text {
    font-family: var(--gh-font-body, var(--font-body));
    color: ${appearance.subheadingColor || 'var(--color-mute)'};
    font-size: 0.95rem;
    line-height: 1.625;
    margin: 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  /* Utilities used in markup */
  #${wrapperId} .mx-auto { margin-left: auto; margin-right: auto; }
  #${wrapperId} .mt-12 { margin-top: 3rem; }
  #${wrapperId} .mt-4 { margin-top: 1rem; }
  #${wrapperId} .mb-10 { margin-bottom: 2.5rem; }
  #${wrapperId} .mb-8 { margin-bottom: 2rem; }
  #${wrapperId} .mb-4 { margin-bottom: 1rem; }
  #${wrapperId} .w-full { width: 100%; }
  #${wrapperId} .text-left { text-align: left; }
  #${wrapperId} .text-center { text-align: center; }
  #${wrapperId} .max-w-7xl { max-width: 80rem; }
  #${wrapperId} .max-w-4xl { max-width: 56rem; }
  #${wrapperId} .max-w-3xl { max-width: 48rem; }
  #${wrapperId} .grid { display: grid; }
  #${wrapperId} .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  #${wrapperId} .gap-x-8 { column-gap: 2rem; }
  #${wrapperId} .gap-y-0 { row-gap: 0; }
  
  @media (max-width: 768px) {
    #${wrapperId} {
      padding-top: 2.5rem !important;
      padding-bottom: 2.5rem !important;
    }
    #${wrapperId} .faq-inner {
      padding: 0 1rem;
    }
    #${wrapperId} .faq-header {
      margin-bottom: 1.5rem;
    }
    #${wrapperId} .faq-heading {
      font-size: 1.5rem !important;
    }
    #${wrapperId} .faq-item {
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    #${wrapperId} .faq-question {
      font-size: 1rem;
    }
    #${wrapperId} .faq-answer-text {
      font-size: 0.875rem;
    }
    #${wrapperId} .mt-12 {
      margin-top: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    #${wrapperId} .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    #${wrapperId} .lg\\:mt-0 { margin-top: 0; }
  }
  html.dark #${wrapperId} .faq-item {
    background-color: ${darkItemBg};
    border-color: rgba(255, 255, 255, 0.08);
  }
  html.dark #${wrapperId} .faq-chevron-wrapper {
    background-color: rgba(255, 255, 255, 0.08);
  }
  html.dark #${wrapperId} .faq-button:hover .faq-chevron-wrapper {
    background-color: rgba(255, 255, 255, 0.15);
  }
  html.dark #${wrapperId} .faq-answer-wrapper.is-open,
  html.dark #${wrapperId} .faq-button[aria-expanded="true"] + .faq-answer-wrapper {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
</style>
<div id="${wrapperId}" class="faq-section ${styles.backgroundType === 'mesh' ? 'mesh-glow' : ''}">
  <div class="faq-inner">
    ${headingHtml}
    ${contentHtml}
  </div>
  ${scriptHtml}
</div>`;
};

export const compileToHbs = generateHTML;
