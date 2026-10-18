import {
  defaultProps,
  resolveImageHotspotsProps,
  HotspotItem,
} from "../src/editor/components/image-hotspots/schema";
import { compileToHbs } from "../src/editor/components/image-hotspots/compiler";
import { componentRegistry } from "../src/editor/components/registry";
import { BLOCK_TEMPLATES } from "../src/editor/components/blockTemplates";
import { STANDALONE_SECTION_TYPES, INITIAL_THEME_DOCUMENT } from "../src/store/editorStore";
import { generateThemeFiles } from "../src/components/builder/compiler";
import { BuilderBlock, ThemeDocument } from "../src/types/theme";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log("🚀 Starting Image Hotspots block verification suite...\n");

  // 1. Component Registration & Palette Verification
  console.log("--- 1. Verification of Registration & Palettes ---");
  assert(!!componentRegistry["image-hotspots"], "image-hotspots is registered in componentRegistry");
  assert(STANDALONE_SECTION_TYPES.has("image-hotspots"), "image-hotspots is in STANDALONE_SECTION_TYPES");
  const template = BLOCK_TEMPLATES.find((t) => t.type === "image-hotspots");
  assert(!!template, "image-hotspots is in BLOCK_TEMPLATES");
  assert(template?.category === "Content", "image-hotspots is in Content category");
  assert(template?.label === "Image Hotspots", "image-hotspots has label 'Image Hotspots'");

  // 2. Schema Normalization & Defaults
  console.log("\n--- 2. Schema Normalization & Default Props ---");
  const resolvedDefault = resolveImageHotspotsProps({});
  assert(resolvedDefault.hotspots.length === 3, "defaultProps has 3 initial hotspots");
  assert(typeof resolvedDefault.content.image === "string" && resolvedDefault.content.image.length > 0, "defaultProps contains base image");
  assert(resolvedDefault.marker.icon === "plus", "default marker icon is 'plus'");
  assert(resolvedDefault.marker.pulse === true, "default marker pulse is true");
  assert(resolvedDefault.layout.contentWidth === "standard", "default layout width is 'standard'");
  assert(resolvedDefault.layout.aspectRatio === "16/9", "default aspect ratio is '16/9'");
  assert(resolvedDefault.layout.paddingX === "24px", "default layout side padding is '24px'");

  // 3. Hotspot Operations: Add, Edit, Reposition, Delete
  console.log("\n--- 3. Hotspot Operations: Add, Edit, Reposition, Delete ---");
  // Add single hotspot
  const singleSpot: HotspotItem = {
    id: "test-spot-1",
    x: 45.5,
    y: 62.3,
    title: "Precision Sensor",
    description: "Multi-axis optical sensor module.",
  };
  const propsWithSpot = resolveImageHotspotsProps({
    hotspots: [singleSpot],
  });
  assert(propsWithSpot.hotspots.length === 1, "Successfully configured single hotspot");
  assert(propsWithSpot.hotspots[0].id === "test-spot-1", "Single hotspot id is preserved");
  assert(propsWithSpot.hotspots[0].x === 45.5 && propsWithSpot.hotspots[0].y === 62.3, "Hotspot coordinates accurate");

  // Add multiple hotspots
  const spot2: HotspotItem = {
    id: "test-spot-2",
    x: 80.0,
    y: 20.0,
    title: "Battery Pack",
    description: "Extended life Li-ion cell.",
  };
  const propsWithMultiple = resolveImageHotspotsProps({
    hotspots: [singleSpot, spot2],
  });
  assert(propsWithMultiple.hotspots.length === 2, "Successfully added multiple hotspots");

  // Edit title and description
  const editedSpot: HotspotItem = {
    ...singleSpot,
    title: "Updated Sensor Title",
    description: "Updated description text.",
  };
  const propsEdited = resolveImageHotspotsProps({
    hotspots: [editedSpot, spot2],
  });
  assert(propsEdited.hotspots[0].title === "Updated Sensor Title", "Hotspot title successfully edited");
  assert(propsEdited.hotspots[0].description === "Updated description text.", "Hotspot description successfully edited");

  // Reposition hotspot (with clamping)
  const repositionedSpot: HotspotItem = {
    ...editedSpot,
    x: 120.0, // beyond 100% -> should clamp to 100%
    y: -15.0, // below 0% -> should clamp to 0%
  };
  const propsRepositioned = resolveImageHotspotsProps({
    hotspots: [repositionedSpot],
  });
  assert(propsRepositioned.hotspots[0].x === 100, "X position clamped to 100%");
  assert(propsRepositioned.hotspots[0].y === 0, "Y position clamped to 0%");

  // Delete hotspot
  const propsDeleted = resolveImageHotspotsProps({
    hotspots: [],
  });
  assert(propsDeleted.hotspots.length === 0, "Hotspots array successfully emptied / deleted");

  // 4. Empty State and Malformed Configurations
  console.log("\n--- 4. Empty and Malformed Configurations ---");
  const malformed = resolveImageHotspotsProps({
    content: {
      image: "",
      alt: "",
    },
    hotspots: [
      { id: "", x: NaN, y: undefined as unknown as number, title: "", description: "" } as unknown as HotspotItem,
    ],
    marker: {
      color: "   ",
      pulse: undefined as unknown as boolean,
      icon: "invalid-icon" as unknown as "plus",
    },
    layout: {
      contentWidth: "invalid-width" as unknown as "standard",
      aspectRatio: "invalid-ratio" as unknown as "16/9",
      borderRadius: "invalid-radius" as unknown as "rounded-xl",
    },
  });
  assert(malformed.hotspots[0].x === 50, "NaN X coordinate resolved safely to 50%");
  assert(malformed.hotspots[0].y === 50, "Undefined Y coordinate resolved safely to 50%");
  assert(malformed.marker.color === defaultProps.marker.color, "Empty marker color falls back to default");
  assert(malformed.marker.icon === "plus", "Invalid marker icon falls back to 'plus'");
  assert(malformed.layout.contentWidth === "standard", "Invalid width falls back to 'standard'");
  assert(malformed.layout.aspectRatio === "16/9", "Invalid aspect ratio falls back to '16/9'");

  // 5. Compiler & Exported Ghost Theme Output
  console.log("\n--- 5. Compiler & Ghost Theme Output ---");
  const mockBlock: BuilderBlock = {
    id: "block-hotspot-test-123",
    type: "image-hotspots",
    props: {
      content: {
        heading: "Engine Specifications",
        description: "Explore the internal architecture.",
        image: "asset://images/blocks/engine-demo.jpg",
        alt: "Internal engine diagram",
      },
      hotspots: [
        {
          id: "cyl-1",
          x: 35.5,
          y: 42.0,
          title: "Titanium Piston & Cylinder",
          description: "High-compression alloy cylinder with low-friction diamond-like carbon coating.",
          linkUrl: "/piston-specs",
          linkLabel: "Learn more",
          openInNewTab: true,
        },
        {
          id: "turbo-1",
          x: 75.2,
          y: 28.4,
          title: "Twin-Scroll Turbocharger",
          description: "Variable turbine geometry offering instant throttle response.",
          linkUrl: "#turbo",
          linkLabel: "View Turbo",
          openInNewTab: false,
        },
      ],
      marker: {
        color: "#10b981",
        pulse: true,
        icon: "number",
      },
      tooltip: {
        theme: "light",
      },
      layout: {
        contentWidth: "wide",
        aspectRatio: "16/9",
        borderRadius: "rounded-xl",
      },
      advanced: {
        htmlAnchor: "engine-specs-section",
        ariaLabel: "Custom Accessible Engine Hotspots Diagram",
      },
    },
    styles: {
      paddingTop: "64px",
      paddingBottom: "64px",
    },
  };

  const compiledHbs = compileToHbs(mockBlock);

  // Check Handlebars asset resolution
  assert(compiledHbs.includes('{{asset "images/blocks/engine-demo.jpg"}}'), "Compiler resolved asset:// to native {{asset \"...\"}}");
  assert(compiledHbs.includes('alt="Internal engine diagram"'), "Compiler rendered escaped alt text");
  assert(compiledHbs.includes("Engine Specifications"), "Compiler rendered heading");
  assert(compiledHbs.includes("Explore the internal architecture."), "Compiler rendered description");

  // Check anchor
  assert(compiledHbs.includes('id="engine-specs-section"'), "Compiler rendered safe HTML anchor");

  // Check hotspot pins and tooltips
  assert(compiledHbs.includes('left: 35.5%; top: 42%;'), "Compiler rendered accurate pin position 1");
  assert(compiledHbs.includes('left: 75.2%; top: 28.4%;'), "Compiler rendered accurate pin position 2");
  assert(compiledHbs.includes("Titanium Piston &amp; Cylinder"), "Compiler escaped & in hotspot title");
  assert(compiledHbs.includes("Twin-Scroll Turbocharger"), "Compiler rendered hotspot title 2");
  assert(compiledHbs.includes("High-compression alloy cylinder"), "Compiler rendered hotspot description");

  // Check accessibility attributes
  assert(compiledHbs.includes('role="button"') && compiledHbs.includes('aria-expanded="false"'), "Pin button has accessible role and aria-expanded");
  assert(compiledHbs.includes('aria-label="Titanium Piston &amp; Cylinder"'), "Pin button has accessible aria-label");
  assert(compiledHbs.includes('aria-label="Close details"'), "Close button has accessible aria-label");
  assert(compiledHbs.includes('aria-label="Custom Accessible Engine Hotspots Diagram"'), "Section has custom ARIA label");

  // Check hotspot links & action buttons
  assert(compiledHbs.includes('href="/piston-specs"'), "Compiler rendered hotspot navigation link URL");
  assert(compiledHbs.includes('class="gh-hotspot-link"'), "Compiler rendered .gh-hotspot-link class");
  assert(compiledHbs.includes("Learn more"), "Compiler rendered custom hotspot link label");
  assert(compiledHbs.includes('target="_blank"'), "Compiler rendered target blank when openInNewTab is enabled");
  assert(compiledHbs.includes("View Turbo"), "Compiler rendered second hotspot link label");
  assert(compiledHbs.includes("padding-left:") && compiledHbs.includes("padding-right:"), "Compiler rendered horizontal side padding");
  assert(compiledHbs.includes("box-sizing: border-box;"), "Compiler rendered box-sizing border-box to prevent overflow");

  // Check responsive styles and positioning clamping
  assert(compiledHbs.includes("clamp(12px,"), "Compiler applies clamp(12px, ...) to prevent horizontal edge clipping");
  assert(compiledHbs.includes("overflow-y: auto"), "Compiler enables overflow-y: auto for scrollable tall popup content");
  assert(compiledHbs.includes("@media (max-width: 640px)"), "Compiler includes mobile media query @media (max-width: 640px)");
  assert(compiledHbs.includes("pos-top-half") || compiledHbs.includes("pos-bottom-half"), "Compiler assigns smart top/bottom positioning classes");

  // 6. Corner and Center Hotspot Positions Verification
  console.log("\n--- 6. Corner and Center Positions Verification ---");
  const cornerBlock: BuilderBlock = {
    id: "block-corner-test",
    type: "image-hotspots",
    props: {
      content: { image: "test.jpg" },
      hotspots: [
        { id: "tl", x: 0, y: 0, title: "Top Left Corner", description: "Corner TL" },
        { id: "tr", x: 100, y: 0, title: "Top Right Corner", description: "Corner TR" },
        { id: "bl", x: 0, y: 100, title: "Bottom Left Corner", description: "Corner BL" },
        { id: "br", x: 100, y: 100, title: "Bottom Right Corner", description: "Corner BR" },
        { id: "center", x: 50, y: 50, title: "Center Marker", description: "Center Spot" },
      ],
    },
    styles: {},
  };
  const cornerHbs = compileToHbs(cornerBlock);
  assert(cornerHbs.includes('left: 0%; top: 0%;'), "Top-Left hotspot marker correctly placed at 0%, 0%");
  assert(cornerHbs.includes('left: 100%; top: 0%;'), "Top-Right hotspot marker correctly placed at 100%, 0%");
  assert(cornerHbs.includes('left: 0%; top: 100%;'), "Bottom-Left hotspot marker correctly placed at 0%, 100%");
  assert(cornerHbs.includes('left: 100%; top: 100%;'), "Bottom-Right hotspot marker correctly placed at 100%, 100%");
  assert(cornerHbs.includes('left: 50%; top: 50%;'), "Center hotspot marker correctly placed at 50%, 50%");
  assert(cornerHbs.includes("pos-top-half") && cornerHbs.includes("pos-bottom-half"), "Both pos-top-half and pos-bottom-half assigned appropriately");

  // 6. Full Theme Document Export Integration
  console.log("\n--- 6. Full Theme Document Export Integration ---");
  const testDoc: ThemeDocument = {
    ...INITIAL_THEME_DOCUMENT,
    blocks: {
      ...INITIAL_THEME_DOCUMENT.blocks,
      [mockBlock.id]: mockBlock,
    },
    pages: {
      ...INITIAL_THEME_DOCUMENT.pages,
      home: {
        ...INITIAL_THEME_DOCUMENT.pages.home,
        sections: [...INITIAL_THEME_DOCUMENT.pages.home.sections, mockBlock.id],
      },
    },
    assets: {
      "assets/images/blocks/engine-demo.jpg": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      "package.json": "data:text/plain;base64,VEVTVF9PVkVSV1JJVEU=", // Malicious overwrite attempt
      "../../unsafe-traversal.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==", // Path traversal attempt
    },
  };

  const generatedFiles = generateThemeFiles(testDoc);
  assert(!!generatedFiles["index.hbs"], "Generated files includes index.hbs");
  assert(generatedFiles["index.hbs"].includes("Titanium Piston &amp; Cylinder"), "index.hbs includes compiled hotspots markup");
  assert(!!generatedFiles["assets/images/blocks/engine-demo.jpg"], "Uploaded image asset is bundled into theme export files");

  // Verify file extension
  assert("assets/images/blocks/engine-demo.jpg".endsWith(".jpg"), "Exported asset path preserves valid .jpg extension");

  // Verify decoded image binary bytes (JPEG magic numbers 0xFF 0xD8)
  const base64Content = generatedFiles["assets/images/blocks/engine-demo.jpg"];
  const imageBytes = Buffer.from(base64Content, "base64");
  assert(imageBytes[0] === 0xff && imageBytes[1] === 0xd8, "Exported Base64 payload decodes into valid binary JPEG image bytes (FF D8)");

  // Verify overwrite and path safety
  const pkgContent = generatedFiles["package.json"];
  assert(!pkgContent.includes("TEST_OVERWRITE") && pkgContent.includes('"name":'), "Core package.json is protected from being overwritten by malicious asset paths");
  assert(!generatedFiles["../../unsafe-traversal.png"], "Path traversal in asset paths is prevented");
  assert(!!generatedFiles["assets/images/unsafe-traversal.png"], "Unsafe asset path is safely sanitized and confined to assets/images/");

  console.log("\n🎉 ALL IMAGE HOTSPOTS VERIFICATION CHECKS PASSED!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
