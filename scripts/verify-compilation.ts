import { INITIAL_THEME_DOCUMENT } from "../src/store/editorStore";
import { generateThemeFiles, sanitizeThemePackageName } from "../src/components/builder/compiler";
import { compileToHbs as compileHeaderToHbs } from "../src/editor/components/header/compiler";

async function verify() {
  console.log("Compiling INITIAL_THEME_DOCUMENT...");
  const files = generateThemeFiles(INITIAL_THEME_DOCUMENT);

  const filenames = Object.keys(files);
  console.log("Generated files:", filenames);

  const expectedTemplates = [
    "index.hbs",
    "post.hbs",
    "page.hbs",
    "author.hbs",
    "tag.hbs",
    "error.hbs",
    "error-404.hbs",
    "assets/css/screen.css",
    "assets/built/screen.css",
    "package.json"
  ];

  for (const exp of expectedTemplates) {
    if (!files[exp]) {
      throw new Error(`Missing expected file: ${exp}`);
    }
  }

  // Verify post.hbs contents
  const postHbs = files["post.hbs"];
  console.log("\n--- Checking post.hbs ---");
  const postChecks = [
    "article-header",
    "primary_tag",
    "featured",
    "article-title",
    "custom_excerpt",
    "author-avatar",
    "article-byline",
    "date format=",
    "reading_time",
    "feature_image",
    "{{content}}",
    "author-card",
    "gh-post-nav",
    "gh-related-posts",
    "gh-comments-section"
  ];
  for (const check of postChecks) {
    const passed = postHbs.includes(check);
    console.log(`  [${passed ? "PASS" : "FAIL"}] post.hbs contains '${check}'`);
    if (!passed) throw new Error(`post.hbs failed check: ${check}`);
  }

  // -----------------------------------------------------------------------
  // Header compiler tests — Issue #6 (header uploaded logo fix)
  // -----------------------------------------------------------------------
  console.log("\n--- Checking header compiler ---");

  // Inline helper to compile a header block with custom general props
  // compileHeaderToHbs is imported statically at the top of this file
  const baseHeaderBlock = INITIAL_THEME_DOCUMENT.blocks["header-sec-1"];

  // --- Test A: asset:// logo compiles to {{asset "..."}} helper (not raw asset://) ---
  const headerWithAssetLogo = compileHeaderToHbs({
    ...baseHeaderBlock,
    props: {
      ...baseHeaderBlock.props,
      general: {
        ...baseHeaderBlock.props.general,
        logoUrl: "asset://images/header/logo.png",
        darkLogoUrl: undefined,
      },
    },
  });
  const assetHelperPresent = headerWithAssetLogo.includes('{{asset "images/header/logo.png"}}');
  const rawAssetUrlAbsent = !headerWithAssetLogo.includes("asset://images/header/logo.png");
  console.log(`  [${assetHelperPresent ? "PASS" : "FAIL"}] asset:// logo compiles to {{asset "..."}} helper`);
  if (!assetHelperPresent) throw new Error("Header compiler must emit {{asset \"images/header/logo.png\"}} for asset:// logoUrl");
  console.log(`  [${rawAssetUrlAbsent ? "PASS" : "FAIL"}] raw asset:// URL is NOT present in compiled output`);
  if (!rawAssetUrlAbsent) throw new Error("Header compiler must not emit raw asset:// URLs in compiled Handlebars");

  // --- Test B: logo is rendered WITHOUT the site title alongside it ---
  const titleNotAlongsideLogo = !headerWithAssetLogo.includes('<span class="gh-site-title">{{@site.title}}</span>');
  console.log(`  [${titleNotAlongsideLogo ? "PASS" : "FAIL"}] site title NOT rendered alongside the logo`);
  if (!titleNotAlongsideLogo) throw new Error("Header compiler must NOT render site title alongside the logo");

  // --- Test C: logo retains accessible alt text ---
  const logoHasAlt = headerWithAssetLogo.includes('alt="{{@site.title}}"');
  console.log(`  [${logoHasAlt ? "PASS" : "FAIL"}] logo img has accessible alt="{{@site.title}}"`);
  if (!logoHasAlt) throw new Error("Header compiler logo must have alt=\"{{@site.title}}\"");

  // --- Test D: no logo → site title is rendered ---
  const headerNoLogo = compileHeaderToHbs({
    ...baseHeaderBlock,
    props: {
      ...baseHeaderBlock.props,
      general: {
        ...baseHeaderBlock.props.general,
        logoUrl: undefined,
        darkLogoUrl: undefined,
      },
    },
  });
  const titleRenderedWithoutLogo = headerNoLogo.includes('<span class="gh-site-title">{{@site.title}}</span>');
  console.log(`  [${titleRenderedWithoutLogo ? "PASS" : "FAIL"}] site title rendered when no logo is configured`);
  if (!titleRenderedWithoutLogo) throw new Error("Header compiler must render site title when no logo is configured");

  // --- Test E: dark asset:// logo also compiles correctly ---
  const headerWithDarkLogo = compileHeaderToHbs({
    ...baseHeaderBlock,
    props: {
      ...baseHeaderBlock.props,
      general: {
        ...baseHeaderBlock.props.general,
        logoUrl: "asset://images/header/logo.png",
        darkLogoUrl: "asset://images/header/dark-logo.png",
      },
    },
  });
  const darkAssetHelperPresent = headerWithDarkLogo.includes('{{asset "images/header/dark-logo.png"}}');
  const rawDarkAssetAbsent = !headerWithDarkLogo.includes("asset://images/header/dark-logo.png");
  console.log(`  [${darkAssetHelperPresent ? "PASS" : "FAIL"}] dark asset:// logo compiles to {{asset "..."}} helper`);
  if (!darkAssetHelperPresent) throw new Error("Header compiler must emit {{asset}} helper for dark logo");
  console.log(`  [${rawDarkAssetAbsent ? "PASS" : "FAIL"}] raw dark asset:// URL is NOT present in compiled output`);
  if (!rawDarkAssetAbsent) throw new Error("Header compiler must not emit raw dark asset:// URL");

  // --- Test F: normal external URL is not converted to an asset helper ---
  const headerWithExternalLogo = compileHeaderToHbs({
    ...baseHeaderBlock,
    props: {
      ...baseHeaderBlock.props,
      general: {
        ...baseHeaderBlock.props.general,
        logoUrl: "https://example.com/logo.png",
        darkLogoUrl: undefined,
      },
    },
  });
  const externalUrlPreserved = headerWithExternalLogo.includes('src="https://example.com/logo.png"');
  const externalNotConvertedToAsset = !headerWithExternalLogo.includes("{{asset");
  console.log(`  [${externalUrlPreserved ? "PASS" : "FAIL"}] external logo URL is preserved correctly`);
  if (!externalUrlPreserved) throw new Error("Header compiler must preserve normal external logo URLs");
  console.log(`  [${externalNotConvertedToAsset ? "PASS" : "FAIL"}] external logo URL is NOT converted to {{asset}} helper`);
  if (!externalNotConvertedToAsset) throw new Error("Header compiler must not convert external URLs to {{asset}} helper");

  // Verify author.hbs scoping
  const authorHbs = files["author.hbs"];
  console.log("\n--- Checking author.hbs ---");
  const hasAuthorBanner = authorHbs.includes("{{#author}}");
  const hasAuthorClose = authorHbs.includes("{{/author}}");
  const hasPostLoop = authorHbs.includes("{{#foreach posts}}");
  console.log(`  [${hasAuthorBanner && hasAuthorClose ? "PASS" : "FAIL"}] author banner properly scoped`);
  console.log(`  [${hasPostLoop ? "PASS" : "FAIL"}] post-grid loop present`);
  
  // Make sure post loop is NOT inside {{#author}}...{{/author}}
  const authorEndIndex = authorHbs.indexOf("{{/author}}");
  const postLoopIndex = authorHbs.indexOf("{{#foreach posts}}");
  if (postLoopIndex <= authorEndIndex) {
    throw new Error("{{#foreach posts}} is incorrectly inside {{#author}} block in author.hbs!");
  }
  console.log("  [PASS] {{#foreach posts}} is correctly placed outside {{#author}} block");

  // Verify tag.hbs scoping
  const tagHbs = files["tag.hbs"];
  console.log("\n--- Checking tag.hbs ---");
  const hasTagBanner = tagHbs.includes("{{#tag}}");
  const hasTagClose = tagHbs.includes("{{/tag}}");
  const hasTagPostLoop = tagHbs.includes("{{#foreach posts}}");
  console.log(`  [${hasTagBanner && hasTagClose ? "PASS" : "FAIL"}] tag banner properly scoped`);
  console.log(`  [${hasTagPostLoop ? "PASS" : "FAIL"}] post-grid loop present`);
  
  const tagEndIndex = tagHbs.indexOf("{{/tag}}");
  const tagPostLoopIndex = tagHbs.indexOf("{{#foreach posts}}");
  if (tagPostLoopIndex <= tagEndIndex) {
    throw new Error("{{#foreach posts}} is incorrectly inside {{#tag}} block in tag.hbs!");
  }
  console.log("  [PASS] {{#foreach posts}} is correctly placed outside {{#tag}} block");

  // Verify error.hbs and error-404.hbs
  console.log("\n--- Checking error templates ---");
  console.log(`  [${files["error.hbs"].includes("statusCode") ? "PASS" : "FAIL"}] error.hbs contains statusCode`);
  console.log(`  [${files["error-404.hbs"].includes("404") || files["error-404.hbs"].includes("statusCode") ? "PASS" : "FAIL"}] error-404.hbs contains error details`);

  // -----------------------------------------------------------------------
  // Package.json name sanitization tests (GS010-PJ-NAME-HY)
  // -----------------------------------------------------------------------
  console.log("\n--- Checking package.json name sanitization (GS010-PJ-NAME-HY) ---");
  const ghostNamePattern = /^([a-z0-9]+-)*[a-z0-9]+$/;

  const testCases: [string | null | undefined, string][] = [
    // Standard names
    ["My Theme", "my-theme"],
    ["Organic Cafe Theme", "organic-cafe-theme"],
    ["Minimal Blog", "minimal-blog"],
    // Numbers and symbols
    ["My Theme 2026!", "my-theme-2026"],
    ["Awesome & Special Theme (2026)!", "awesome-special-theme-2026"],
    ["Version 2.0.1 - Final", "version-2-0-1-final"],
    // Empty, missing, whitespace, invalid
    ["", "my-ghost-theme"],
    ["   ", "my-ghost-theme"],
    [null, "my-ghost-theme"],
    [undefined, "my-ghost-theme"],
    ["!@#$%^&*()_+", "my-ghost-theme"],
    // Hyphen handling (no leading, trailing, or consecutive hyphens)
    ["---leading-and-trailing---", "leading-and-trailing"],
    ["multiple   spaces   and---hyphens", "multiple-spaces-and-hyphens"],
    ["-start", "start"],
    ["end-", "end"],
    ["--middle--dash--", "middle-dash"]
  ];

  for (const [input, expected] of testCases) {
    const result = sanitizeThemePackageName(input);
    const conformsToGhostRule = ghostNamePattern.test(result);
    console.log(`  [${result === expected && conformsToGhostRule ? "PASS" : "FAIL"}] ${JSON.stringify(input)} -> "${result}" (expected: "${expected}")`);
    if (result !== expected) {
      throw new Error(`sanitizeThemePackageName(${JSON.stringify(input)}) returned "${result}", expected "${expected}"`);
    }
    if (!conformsToGhostRule) {
      throw new Error(`Sanitized name "${result}" does not conform to Ghost package name pattern ${ghostNamePattern}`);
    }
  }

  // Integration test with generateThemeFiles
  console.log("\n--- Checking generateThemeFiles package.json output ---");
  const testDocWithSpecialName = {
    ...INITIAL_THEME_DOCUMENT,
    metadata: {
      ...INITIAL_THEME_DOCUMENT.metadata,
      name: "Awesome & Special Theme (2026)!"
    }
  };
  const filesWithSpecialName = generateThemeFiles(testDocWithSpecialName);
  const pkgJsonSpecial = JSON.parse(filesWithSpecialName["package.json"]);
  console.log(`  [${pkgJsonSpecial.name === "awesome-special-theme-2026" ? "PASS" : "FAIL"}] package.json name is sanitized: "${pkgJsonSpecial.name}"`);
  if (pkgJsonSpecial.name !== "awesome-special-theme-2026") {
    throw new Error(`Expected "awesome-special-theme-2026", got "${pkgJsonSpecial.name}"`);
  }

  const testDocWithEmptyName = {
    ...INITIAL_THEME_DOCUMENT,
    metadata: {
      ...INITIAL_THEME_DOCUMENT.metadata,
      name: ""
    }
  };
  const filesWithEmptyName = generateThemeFiles(testDocWithEmptyName);
  const pkgJsonEmpty = JSON.parse(filesWithEmptyName["package.json"]);
  console.log(`  [${pkgJsonEmpty.name === "my-ghost-theme" ? "PASS" : "FAIL"}] empty name falls back to: "${pkgJsonEmpty.name}"`);
  if (pkgJsonEmpty.name !== "my-ghost-theme") {
    throw new Error(`Expected fallback "my-ghost-theme", got "${pkgJsonEmpty.name}"`);
  }

  console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
