import assert from "assert";
import {
  generateThemeFiles,
  getSkeletonCss,
  compileBlockToHbs,
  getResponsiveBlockCss,
  isValidResponsiveValue
} from "../src/components/builder/compiler";
import { INITIAL_THEME_DOCUMENT } from "../src/store/editorStore";
import { ThemeDocument, BuilderBlock } from "../src/types/theme";

console.log("=== Testing Responsive Layout & Ghost Export ===");

// 1. Verify CSS reset for responsive media (img, video) and (svg, iframe)
const skeletonCss = getSkeletonCss();
assert(
  skeletonCss.includes("img, video") && skeletonCss.includes("height: auto"),
  "CSS must include img, video { max-width: 100%; height: auto; }"
);
assert(
  skeletonCss.includes("svg, iframe") && skeletonCss.includes("max-width: 100%"),
  "CSS must include svg, iframe { max-width: 100%; }"
);
assert(
  !skeletonCss.includes("img, svg, video, iframe"),
  "CSS should no longer group svg and iframe with height: auto"
);
console.log("  [PASS] Responsive media max-width constraints present in skeleton CSS");

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
  compiledBlockHbs.includes("@media (min-width: 768px) and (max-width: 1024px)"),
  "Block responsive styles must generate tablet media query (min-width: 768px) and (max-width: 1024px)"
);
assert(
  compiledBlockHbs.includes("@media (max-width: 767px)"),
  "Block responsive styles must generate mobile media query (max-width: 767px)"
);
assert(
  !compiledBlockHbs.includes("@media (max-width: 768px)"),
  "Block responsive styles must NOT use max-width: 768px which conflicts at 768px"
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

// 6. Regression tests for getResponsiveBlockCss value validation and hardening
console.log("\n=== Testing getResponsiveBlockCss hardening & value validation ===");

// 6a. Allowed dimensional values
assert(isValidResponsiveValue("paddingTop", "24px"), "24px should be valid");
assert(isValidResponsiveValue("paddingBottom", "1.5rem"), "1.5rem should be valid");
assert(isValidResponsiveValue("marginTop", "0"), "0 should be valid");
assert(isValidResponsiveValue("marginBottom", "0px"), "0px should be valid");
assert(isValidResponsiveValue("width", "100%"), "100% should be valid");
assert(isValidResponsiveValue("width", "auto"), "auto should be valid");
assert(isValidResponsiveValue("gap", "2em"), "2em should be valid");
assert(isValidResponsiveValue("marginTop", "-16px"), "-16px should be valid");
console.log("  [PASS] Allowed safe size values (24px, 1.5rem, etc.) accepted");

// 6b. Allowed textAlign values
assert(isValidResponsiveValue("textAlign", "left"), "textAlign: left should be valid");
assert(isValidResponsiveValue("textAlign", "center"), "textAlign: center should be valid");
assert(isValidResponsiveValue("textAlign", "right"), "textAlign: right should be valid");
assert(!isValidResponsiveValue("textAlign", "justify"), "textAlign: justify should be rejected");
assert(!isValidResponsiveValue("textAlign", "start"), "textAlign: start should be rejected");
console.log("  [PASS] Only left, center, and right allowed for textAlign");

// 6c. CSS injection and unsafe characters rejection
const unsafeValues = [
  "24px; color: red;",
  "24px } body { color: red }",
  "url(https://example.com/exploit.css)",
  "javascript:alert(1)",
  "<script>alert(1)</script>",
  "`expression(alert(1))`",
  "24px' OR '1'='1",
  "24px\" onerror=\"alert(1)"
];
for (const val of unsafeValues) {
  assert(!isValidResponsiveValue("paddingTop", val), `Unsafe value should be rejected: ${val}`);
}
console.log("  [PASS] CSS injection and unsafe characters strictly rejected");

// 6d. Block with unsupported properties or invalid values should not emit CSS
const blockWithHackingAndUnsupported: BuilderBlock = {
  id: "test-hardened-block",
  type: "section",
  props: {},
  styles: {
    // Valid property with valid values
    paddingTop: {
      desktop: "64px",
      tablet: "32px",
      mobile: "16px",
    },
    // Valid property with CSS injection attempt
    paddingBottom: {
      desktop: "64px",
      tablet: "32px; injection: bad;",
      mobile: "16px } evil { color: red }",
    },
    // Unsupported properties (must be ignored)
    backdropBlur: {
      desktop: "blur(10px)",
      tablet: "blur(5px)",
      mobile: "none",
    },
    bgImageUrl: {
      desktop: "url(/bg.png)",
      tablet: "url(/bg-tab.png)",
      mobile: "none",
    },
    arbitraryProp: {
      desktop: "foo",
      tablet: "bar",
      mobile: "baz",
    },
  },
  childrenIds: [],
};

const hardenedCss = getResponsiveBlockCss(blockWithHackingAndUnsupported);
assert(hardenedCss.includes("padding-top: 32px !important;"), "Valid tablet paddingTop must be present");
assert(hardenedCss.includes("padding-top: 16px !important;"), "Valid mobile paddingTop must be present");
assert(!hardenedCss.includes("injection"), "CSS injection attempt in paddingBottom must NOT be emitted");
assert(!hardenedCss.includes("evil"), "CSS injection attempt in paddingBottom must NOT be emitted");
assert(!hardenedCss.includes("backdrop-blur"), "Unsupported property backdropBlur must NOT be emitted");
assert(!hardenedCss.includes("bg-image-url"), "Unsupported property bgImageUrl must NOT be emitted");
assert(!hardenedCss.includes("arbitrary-prop"), "Unsupported property arbitraryProp must NOT be emitted");
console.log("  [PASS] getResponsiveBlockCss processes only cssPropMap keys and ignores invalid/unsupported properties");

console.log("\nALL RESPONSIVE AND HARDENING VERIFICATIONS PASSED SUCCESSFULLY!");
