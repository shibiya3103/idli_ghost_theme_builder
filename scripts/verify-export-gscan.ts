import { INITIAL_THEME_DOCUMENT } from "../src/store/editorStore";
import { generateThemeFiles } from "../src/components/builder/compiler";
import JSZip from "jszip";
// @ts-expect-error gscan does not have bundled type definitions
import gscan from "gscan";
import fs from "fs";
import path from "path";
import os from "os";

async function buildThemeZip(name: string): Promise<Buffer> {
  const doc = {
    ...INITIAL_THEME_DOCUMENT,
    metadata: {
      ...INITIAL_THEME_DOCUMENT.metadata,
      name
    }
  };

  const files = generateThemeFiles(doc);
  const zip = new JSZip();

  // Add Casper template locales and icons from public folder if present
  const casperDir = path.join(process.cwd(), "public", "casper-template");
  const manifestPath = path.join(casperDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest: string[] = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    for (const filePath of manifest) {
      if (filePath.startsWith("locales/") || filePath.startsWith("partials/icons/")) {
        const fullPath = path.join(casperDir, filePath);
        if (fs.existsSync(fullPath)) {
          zip.file(filePath, fs.readFileSync(fullPath));
        }
      }
    }
  }

  for (const [filePath, content] of Object.entries(files)) {
    if (filePath === "assets/css/screen.css") {
      zip.file("assets/built/screen.css", content);
      zip.file("assets/css/screen.css", content);
    } else if (filePath === "package.json") {
      const compiledPackage = JSON.parse(content);
      zip.file("package.json", JSON.stringify(compiledPackage, null, 2));
    } else {
      zip.file(filePath, content);
    }
  }

  return await zip.generateAsync({ type: "nodebuffer" });
}

async function runGscanOnTheme(themeName: string, expectedPkgName: string) {
  console.log(`\nValidating theme with name "${themeName}"...`);
  const zipBuffer = await buildThemeZip(themeName);

  // Verify ZIP contains package.json with expected sanitized name
  const unzipped = await JSZip.loadAsync(zipBuffer);
  const pkgFile = unzipped.file("package.json");
  if (!pkgFile) {
    throw new Error("Exported ZIP does not contain package.json!");
  }
  const pkgContent = JSON.parse(await pkgFile.async("string"));
  console.log(`  package.json name in ZIP: "${pkgContent.name}"`);
  if (pkgContent.name !== expectedPkgName) {
    throw new Error(`Expected package.json name "${expectedPkgName}", got "${pkgContent.name}"`);
  }

  // Verify essential templates and assets are in the ZIP
  const requiredFiles = [
    "index.hbs",
    "post.hbs",
    "page.hbs",
    "author.hbs",
    "tag.hbs",
    "error.hbs",
    "error-404.hbs",
    "partials/navigation.hbs",
    "partials/header.hbs",
    "partials/footer.hbs",
    "assets/built/screen.css",
    "assets/css/screen.css"
  ];
  for (const req of requiredFiles) {
    if (!unzipped.file(req)) {
      throw new Error(`Missing expected file in ZIP: ${req}`);
    }
  }
  console.log(`  All ${requiredFiles.length} required templates and assets present in ZIP.`);

  // Write temporary zip to run gscan.checkZip (matching /api/theme/validate workflow)
  const tempZipPath = path.join(os.tmpdir(), `test-theme-${Date.now()}-${Math.random().toString(36).substring(7)}.zip`);
  fs.writeFileSync(tempZipPath, zipBuffer);

  try {
    const rawReport = await gscan.checkZip(tempZipPath, {
      keepExtractedDir: false,
      checkVersion: "v5"
    });
    const formatted = gscan.format(rawReport, { checkVersion: "v5" });

    const errors = formatted.results.error || [];
    const fatals = formatted.results.fatal || [];
    const score = formatted.results.score;

    console.log(`  GScan Score: ${score.value}/100 (${score.level})`);
    console.log(`  Errors count: ${errors.length}, Fatals count: ${fatals.length}`);

    // Check specifically for GS010-PJ-NAME-HY
    const nameHyphenError = errors.find((e: { rule: string }) => e.rule === "GS010-PJ-NAME-HY");
    if (nameHyphenError) {
      throw new Error(`GS010-PJ-NAME-HY error still present: ${JSON.stringify(nameHyphenError)}`);
    }
    console.log("  [PASS] GS010-PJ-NAME-HY is NOT present in validation errors.");

    if (errors.length > 0) {
      console.warn("  Validation errors detected:", JSON.stringify(errors, null, 2));
    }

    return { score, errors, fatals };
  } finally {
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
  }
}

async function main() {
  console.log("=== Running GScan Validation Workflow on Exported Themes ===");

  // 1. Theme that previously triggered GS010-PJ-NAME-HY
  const r1 = await runGscanOnTheme("Awesome & Special Theme (2026)!", "awesome-special-theme-2026");
  if (r1.errors.length > 0) {
    throw new Error(`Validation errors found on Awesome & Special Theme: ${JSON.stringify(r1.errors)}`);
  }

  // 2. Theme with exclamation and space
  const r2 = await runGscanOnTheme("My Theme 2026!", "my-theme-2026");
  if (r2.errors.length > 0) {
    throw new Error(`Validation errors found on My Theme 2026!: ${JSON.stringify(r2.errors)}`);
  }

  // 3. Theme with empty name fallback
  const r3 = await runGscanOnTheme("", "my-ghost-theme");
  if (r3.errors.length > 0) {
    throw new Error(`Validation errors found on empty theme name: ${JSON.stringify(r3.errors)}`);
  }

  console.log("\nALL GSCAN VALIDATIONS PASSED WITH ZERO ERRORS!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
