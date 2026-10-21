import assert from "assert";
import { generateThemeFiles, getSkeletonCss, compileBlockToHbs } from "../src/components/builder/compiler";
import { INITIAL_THEME_DOCUMENT } from "../src/store/editorStore";
import { ThemeDocument, BuilderBlock } from "../src/types/theme";

console.log("=== Testing Responsive Layout & Ghost Export ===");

// 1. Verify CSS reset for responsive media (img, svg, video, iframe)
const skeletonCss = getSkeletonCss();
assert(
  skeletonCss.includes("img, svg, video, iframe { max-width: 100%; height: auto; }") ||
  skeletonCss.includes("max-width: 100%"),
  "CSS must include media max-width: 100% reset to prevent overflow"
);
console.log("  [PASS] Responsive media max-width constraint present in skeleton CSS");

// 2. Verify responsive utility classes in skeleton CSS
const requiredResponsiveUtilities = [
  ".grid",
  ".grid-cols-1",
  ".grid-cols-2",
  ".grid-cols-3",
  ".grid-cols-4",
  ".gap-2",
  ".gap-4",
  ".gap-8",
  ".shrink-0",
  ".max-w-3xl",
  ".max-w-6xl",
  ".max-w-7xl",
  ".sm\\:grid-cols-2",
  ".sm\\:flex-row",
  ".sm\\:text-4xl",
  ".md\\:grid-cols-2",
  ".md\\:grid-cols-3",
  ".md\\:flex-row",
  ".lg\\:grid-cols-2",
  ".lg\\:grid-cols-3",
  ".lg\\:grid-cols-4",
  ".lg\\:mt-0",
];

for (const cls of requiredResponsiveUtilities) {
  assert(
    skeletonCss.includes(cls),
    `Skeleton CSS must contain responsive utility: ${cls}`
  );
}
console.log(`  [PASS] All ${requiredResponsiveUtilities.length} required responsive utility classes found in skeleton CSS`);

// 3. Verify ResponsiveStyleValue compilation to scoped media queries
const testBlockWithResponsiveStyles: BuilderBlock = {
  id: "test-responsive-block-1",
  type: "section",
  props: {},
  styles: {
    paddingTop: {
      desktop: "80px",
      tablet: "48px",
      mobile: "24px",
    },
    paddingBottom: {
      desktop: "80px",
      tablet: "40px",
      mobile: "20px",
    },
  },
  childrenIds: [],
};

const compiledBlockHbs = compileBlockToHbs(
  "test-responsive-block-1",
  { "test-responsive-block-1": testBlockWithResponsiveStyles }
);
assert(
  compiledBlockHbs.includes('data-block-id="test-responsive-block-1"'),
  "Root element of compiled block must contain data-block-id"
);
assert(
  compiledBlockHbs.includes("@media (max-width: 1024px)"),
  "Block responsive styles must generate tablet media query (max-width: 1024px)"
);
assert(
  compiledBlockHbs.includes("@media (max-width: 768px)"),
  "Block responsive styles must generate mobile media query (max-width: 768px)"
);
assert(
  compiledBlockHbs.includes("48px !important"),
  "Tablet paddingTop must be present in tablet media query"
);
assert(
  compiledBlockHbs.includes("24px !important"),
  "Mobile paddingTop must be present in mobile media query"
);
console.log("  [PASS] Block with ResponsiveStyleValue generates scoped @media queries in Handlebars");

// 3b. Negative test: Verify that a block WITHOUT responsive overrides does NOT receive responsive CSS or empty media queries
const testBlockWithoutResponsiveStyles: BuilderBlock = {
  id: "test-static-block-1",
  type: "section",
  props: {},
  styles: {
    paddingTop: "60px",
    paddingBottom: "60px",
  },
  childrenIds: [],
};

const compiledStaticHbs = compileBlockToHbs(
  "test-static-block-1",
  { "test-static-block-1": testBlockWithoutResponsiveStyles }
);

assert(
  !compiledStaticHbs.includes("@media"),
  "Static block without responsive overrides must NOT emit any @media queries"
);
assert(
  !compiledStaticHbs.includes("<style>"),
  "Static block without responsive overrides must NOT emit unnecessary <style> tags"
);
assert(
  !compiledStaticHbs.includes('data-block-id="test-static-block-1"'),
  "Static block without responsive overrides must NOT inject data-block-id attribute"
);
console.log("  [PASS] Negative test: Block without responsive overrides emits clean markup without unnecessary responsive CSS or attributes");

// 4. Verify columns compiler responsive stacking
const columnsBlock: BuilderBlock = {
  id: "test-cols-1",
  type: "columns",
  props: {
    columnsCount: 4,
    stackOnMobile: true,
  },
  styles: {},
  childrenIds: [],
};

const compiledCols = compileBlockToHbs("test-cols-1", { "test-cols-1": columnsBlock });
assert(
  compiledCols.includes("@media (max-width: 767px)"),
  "Columns compiler must stack on mobile (max-width: 767px) without breaking 768px tablets"
);
assert(
  compiledCols.includes("@media (min-width: 768px) and (max-width: 1024px)"),
  "4-column layout on tablet must adapt nicely to 2 columns"
);
console.log("  [PASS] Columns block compiles mobile (<768px) and tablet queries appropriately");

// 5. Verify full theme generation includes all responsive assets and clean CSS
const files = generateThemeFiles(INITIAL_THEME_DOCUMENT as unknown as ThemeDocument);
assert(files["assets/css/screen.css"], "Export must produce assets/css/screen.css");
assert(files["index.hbs"], "Export must produce index.hbs");
assert(files["default.hbs"], "Export must produce default.hbs");
assert(files["package.json"], "Export must produce package.json");

const exportedCss = files["assets/css/screen.css"] as string;
assert(
  exportedCss.includes(".sm:grid-cols-2") || exportedCss.includes(".sm\\:grid-cols-2"),
  "Exported screen.css must include responsive grid rules"
);
assert(
  exportedCss.includes(".md:grid-cols-2") || exportedCss.includes(".md\\:grid-cols-2"),
  "Exported screen.css must include tablet grid rules"
);

console.log("  [PASS] Exported theme generates valid screen.css with responsive styles and templates");
console.log("\nALL RESPONSIVE VERIFICATIONS PASSED SUCCESSFULLY!");
