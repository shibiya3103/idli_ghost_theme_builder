"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";

import { useEditorStore } from "@/store/editorStore";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo2, 
  Redo2, 
  Download,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Code,
  HelpCircle,
  Plus,
  Copy,
  Save, 
  Cloud, 
  Check, 
  Loader2, 
  AlertCircle, 
  LayoutTemplate, 
  X, 
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import TemplatePickerModal from "./TemplatePickerModal";
import CustomTemplateModal from "./CustomTemplateModal";

interface GscanFailure {
  ref?: string;
  message?: string;
}

interface GscanIssue {
  rule: string;
  details?: string;
  failures?: GscanFailure[];
  code?: string;
  level?: string;
}

interface ValidationReport {
  score?: { value: number; level: string };
  fatal?: Record<string, GscanIssue>;
  error?: Record<string, GscanIssue>;
  warning?: Record<string, GscanIssue>;
}

export default function Toolbar() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customTemplateModal, setCustomTemplateModal] = useState<{
    isOpen: boolean;
    mode: "create" | "duplicate";
    initialValue?: string;
  }>({
    isOpen: false,
    mode: "create",
  });
  
  // Gscan Validation State
  const [isExporting, setIsExporting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [themeBlob, setThemeBlob] = useState<Blob | null>(null);
  const [themeFilename, setThemeFilename] = useState<string>("");
  const [copiedError, setCopiedError] = useState(false);
  const [copiedSingleId, setCopiedSingleId] = useState<string | null>(null);
  const { 
    deviceMode, 
    setDeviceMode, 
    activePage, 
    setActivePage, 
    undo, 
    redo,
    past,
    future,
    document: themeDoc,
    isPreviewMode,
    togglePreviewMode,
    appThemeMode,
    toggleAppThemeMode,
    isCodeMode,
    toggleCodeMode,
    toggleShortcutsHelp,
    createCustomPage,
    duplicateCustomPage,
    saveTheme,
    saveStatus,
    isSaving
  } = useEditorStore();

  const [liveScore, setLiveScore] = useState<{ value: number, level: string } | null>(null);
  const [isValidatingLive, setIsValidatingLive] = useState(false);

  const getValidationReportText = (): string => {
    if (!validationReport) return "No validation report available.";
    const lines: string[] = [];
    lines.push("Ghost Theme Validation Report");
    if (validationReport.score) {
      lines.push(`Score: ${validationReport.score.value}/100 (${validationReport.score.level})`);
    }
    lines.push("");

    const formatItems = (
      sectionTitle: string,
      itemsObj: Record<string, { rule?: string; details?: string; failures?: Array<{ ref?: string }>; code?: string; level?: string }> | undefined
    ) => {
      if (!itemsObj || Object.keys(itemsObj).length === 0) return;
      const items = Object.values(itemsObj);
      lines.push(`=== ${sectionTitle} (${items.length}) ===`);
      items.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.rule || "Issue"}`);
        if (item.details) {
          const cleanDetails = item.details.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          lines.push(`   Details: ${cleanDetails}`);
        }
        if (item.failures && item.failures.length > 0) {
          lines.push(`   Affected: ${item.failures.map(f => f.ref).filter(Boolean).join(", ")}`);
        }
        if (item.code) {
          lines.push(`   Code: ${item.code}`);
        }
        lines.push("");
      });
    };

    formatItems("Fatal Errors", validationReport.fatal);
    formatItems("Errors", validationReport.error);
    formatItems("Warnings", validationReport.warning);

    return lines.join("\n").trim();
  };

  const handleCopyErrors = async () => {
    const text = getValidationReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch (err) {
      console.error("Failed to copy validation report:", err);
    }
  };

  const handleCopySingleIssue = async (
    issue: { rule?: string; details?: string; failures?: Array<{ ref?: string }>; code?: string; level?: string },
    id: string
  ) => {
    const cleanDetails = (issue.details || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const affected = issue.failures && issue.failures.length > 0 ? `\nAffected: ${issue.failures.map(f => f.ref).filter(Boolean).join(", ")}` : "";
    const text = `[${issue.level || "Issue"}] ${issue.rule || ""}\n${cleanDetails}${affected}${issue.code ? `\nCode: ${issue.code}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSingleId(id);
      setTimeout(() => setCopiedSingleId(null), 2000);
    } catch (error) {
      console.error("Failed to copy single issue:", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        setIsValidatingLive(true);
        const zip = new JSZip();
        
        // Fetch minimal required ghost assets for accurate score
        const manifestRes = await fetch("/casper-template/manifest.json");
        if (manifestRes.ok) {
          const manifest: string[] = await manifestRes.json();
          await Promise.all(
            manifest.map(async (filePath) => {
              if (!filePath.startsWith("locales/") && !filePath.startsWith("partials/icons/")) return;
              const res = await fetch(`/casper-template/${filePath}`);
              if (res.ok) {
                zip.file(filePath, await res.arrayBuffer());
              }
            })
          );
        }

        const { generateThemeFiles } = await import("./compiler");
        const latestDoc = useEditorStore.getState().document;
        const files = generateThemeFiles(latestDoc);
        Object.entries(files).forEach(([name, content]) => {
          if (name.startsWith("assets/images/") && !name.endsWith(".svg")) {
            zip.file(name, content, { base64: true });
          } else {
            zip.file(name, content);
          }
        });

        const blob = await zip.generateAsync({ type: "blob" });
        const formData = new FormData();
        formData.append("theme", blob, "live-theme.zip");

        const validateRes = await fetch("/api/theme/validate", {
          method: "POST",
          body: formData
        });
        
        if (validateRes.ok) {
          const validateData = await validateRes.json();
          if (validateData.success && validateData.report?.score) {
            setLiveScore(validateData.report.score);
            setValidationReport(validateData.report);
          }
        }
      } catch {
        // Silently ignore background validation errors
      } finally {
        setIsValidatingLive(false);
      }
    }, 4000); // 4s debounce

    return () => clearTimeout(handler);
  }, [themeDoc]);

  const allPageKeys = Object.keys(themeDoc.pages);

  // Group default vs custom templates
  const defaultPageSlugs = ["home", "post", "page", "author", "tag", "error"];
  const customPageSlugs = allPageKeys.filter(slug => !defaultPageSlugs.includes(slug));

  const handleCreatePage = () => {
    setCustomTemplateModal({
      isOpen: true,
      mode: "create",
      initialValue: "",
    });
  };

  const handleDuplicatePage = () => {
    const defaultCopySlug = activePage.startsWith("custom-")
      ? `${activePage.replace(/^custom-/, "")}-copy`
      : `${activePage}-copy`;
    setCustomTemplateModal({
      isOpen: true,
      mode: "duplicate",
      initialValue: defaultCopySlug,
    });
  };

  return (
    <>
      <header className="builder-toolbar min-h-[64px] border-b border-brand-hairline bg-brand-canvas text-brand-ink px-3 sm:px-4 flex items-center justify-between shrink-0 select-none shadow-level-1 z-10 gap-2 w-full">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 px-2 py-1 -ml-1 text-xs text-brand-body hover:text-brand-ink rounded hover:bg-brand-canvas-soft transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft size={14} />
          <span className="font-medium hidden md:inline">Dashboard</span>
        </Link>
        <div className="h-4 w-px bg-brand-hairline hidden md:block" />
        <Link href="/" className="flex items-center gap-2 group shrink min-w-0" title="Ghost Theme Builder Home">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-sm transition-transform group-hover:scale-105 shrink-0">
            <span className="text-brand-on-primary font-mono font-semibold text-sm">G</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-sans font-semibold text-sm tracking-tight text-brand-ink truncate max-w-[90px] sm:max-w-[130px] md:max-w-[160px]">
                {themeDoc.metadata?.name || "Ghost Theme"}
              </span>
              <span className="font-mono text-[10px] bg-brand-canvas-soft border border-brand-hairline px-1.5 py-0.5 rounded-sm text-brand-body uppercase hidden 2xl:inline">
                v{themeDoc.metadata?.version || "1.0.0"}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Dynamic Pages Selector & Add Page CTA */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-[11px] font-mono uppercase text-brand-mute hidden lg:inline">Page:</span>
        <select
          value={activePage}
          onChange={(e) => setActivePage(e.target.value)}
          className="px-2 py-1 border border-brand-hairline rounded-sm text-xs font-medium focus:outline-none bg-brand-canvas-soft text-brand-ink max-w-[110px] sm:max-w-[140px] md:max-w-[170px]"
        >
          <optgroup label="Default Layouts">
            <option value="home">Home (index.hbs)</option>
            <option value="post">Post (post.hbs)</option>
            <option value="page">Page (page.hbs)</option>
            <option value="author">Author (author.hbs)</option>
            <option value="tag">Tag (tag.hbs)</option>
            <option value="error">404 (error.hbs)</option>
          </optgroup>
          {customPageSlugs.length > 0 && (
            <optgroup label="Custom Templates">
              {customPageSlugs.map(slug => (
                <option key={slug} value={slug}>{slug}.hbs</option>
              ))}
            </optgroup>
          )}
        </select>
        <button
          onClick={handleCreatePage}
          className="p-1 border border-brand-hairline rounded-sm hover:bg-brand-canvas-soft text-brand-ink transition-colors flex items-center justify-center"
          title="Create Custom Page Template"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={handleDuplicatePage}
          className="p-1 border border-brand-hairline rounded-sm hover:bg-brand-canvas-soft text-brand-ink transition-colors flex items-center justify-center"
          title="Duplicate Current Page Layout"
        >
          <Copy size={14} />
        </button>

        <div className="flex items-center gap-1.5 ml-1 sm:ml-2 border-l border-brand-hairline pl-1.5 sm:pl-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-2 py-1 bg-brand-canvas-soft border border-brand-hairline rounded-sm text-xs font-medium hover:bg-brand-canvas-soft-2 text-brand-ink transition-colors"
            title="Choose a layout template for the current page"
          >
            <LayoutTemplate size={13} />
            <span className="hidden 2xl:inline">Templates</span>
          </button>
        </div>


      </div>

      {/* View Mode & History Toggles */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="flex items-center border-r border-brand-hairline pr-1.5 sm:pr-3 gap-0.5 sm:gap-1">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`p-1.5 rounded-xs transition-colors ${deviceMode === "desktop" ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title="Desktop view"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setDeviceMode("tablet")}
            className={`p-1.5 rounded-xs transition-colors ${deviceMode === "tablet" ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title="Tablet view"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`p-1.5 rounded-xs transition-colors ${deviceMode === "mobile" ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title="Mobile view"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className={`p-1.5 rounded-xs transition-colors ${past.length > 0 ? "text-brand-ink hover:bg-brand-canvas-soft-2" : "text-brand-hairline-strong cursor-not-allowed"}`}
            title="Undo (⌘Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className={`p-1.5 rounded-xs transition-colors ${future.length > 0 ? "text-brand-ink hover:bg-brand-canvas-soft-2" : "text-brand-hairline-strong cursor-not-allowed"}`}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* View Toggles & Help */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 border-l border-brand-hairline pl-1.5 sm:pl-3">
          <button
            onClick={togglePreviewMode}
            className={`p-1.5 rounded-xs transition-colors ${isPreviewMode ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={toggleAppThemeMode}
            className={`p-1.5 rounded-xs transition-colors ${appThemeMode === "dark" ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title={appThemeMode === "dark" ? "App Theme: Dark (Click for Light)" : "App Theme: Light (Click for Dark)"}
          >
            {appThemeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleCodeMode}
            className={`p-1.5 rounded-xs transition-colors ${isCodeMode ? "bg-brand-canvas-soft-2 text-brand-ink font-semibold" : "text-brand-mute hover:text-brand-ink"}`}
            title="Code view"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => toggleShortcutsHelp()}
            className="p-1.5 rounded-xs text-brand-mute hover:text-brand-ink transition-colors hidden xl:block"
            title="Help / Keyboard Shortcuts"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Export / Action Buttons - ALWAYS visible and right-aligned */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* Live Score Badge */}
          {liveScore && (
            <button 
              onClick={() => setShowValidationModal(true)}
              className={`hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-sm border transition-colors shrink-0 ${liveScore.level === 'error' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : liveScore.level === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
              title="Click to view GScan validation report"
            >
              <span className="text-[10px] font-bold font-mono tracking-tight">GSCAN: {liveScore.value}/100</span>
              {isValidatingLive && <Loader2 size={10} className="animate-spin opacity-50" />}
            </button>
          )}

          {/* Autosave / DB Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-brand-body pr-1 shrink-0">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={13} className="animate-spin text-brand-link" />
                <span className="text-[10px] font-mono text-brand-mute">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Cloud size={13} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-600">Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle size={13} className="text-red-500" />
                <span className="text-[10px] font-mono text-red-500">Save Error</span>
              </>
            )}
          </div>

          <button 
            disabled={isSaving}
            onClick={() => saveTheme()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-semibold hover:bg-brand-canvas-soft text-brand-ink transition-all shadow-level-2 bg-brand-canvas cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Manual Save to Database"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            <span>Save Theme</span>
          </button>

          <button 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-brand-primary text-brand-on-primary rounded-sm text-xs font-semibold hover:opacity-90 transition-all shadow-level-3 cursor-pointer shrink-0"
            onClick={async () => {
              const zip = new JSZip();

              try {
                const manifestRes = await fetch("/casper-template/manifest.json");
                if (!manifestRes.ok) throw new Error("Failed to load template manifest");
                const manifest: string[] = await manifestRes.json();

                await Promise.all(
                  manifest.map(async (filePath) => {
                    // Only cherry-pick locales and icons
                    if (!filePath.startsWith("locales/") && !filePath.startsWith("partials/icons/")) return;

                    const res = await fetch(`/casper-template/${filePath}`);
                    if (!res.ok) throw new Error(`Failed to load ${filePath}`);
                    
                    const buffer = await res.arrayBuffer();
                    zip.file(filePath, buffer);
                  })
                );

                const { generateThemeFiles } = await import("./compiler");
                const latestDoc = useEditorStore.getState().document;
                const files = generateThemeFiles(latestDoc);

                for (const [name, content] of Object.entries(files)) {
                  if (name === "assets/css/screen.css") {
                    zip.file("assets/built/screen.css", content as string);
                    zip.file("assets/css/screen.css", content as string);
                  } else if (name === "package.json") {
                    const compiledPackage = JSON.parse(content as string);
                    zip.file("package.json", JSON.stringify(compiledPackage, null, 2));
                  } else if (name.startsWith("assets/images/") && !name.endsWith(".svg")) {
                    zip.file(name, content as string, { base64: true });
                  } else {
                    zip.file(name, content as string);
                  }
                }

                const blob = await zip.generateAsync({ type: "blob" });
                const filename = `${latestDoc.metadata.name.toLowerCase().replace(/\s+/g, "-")}-theme.zip`;
                
                setIsExporting(true);
                
                const formData = new FormData();
                formData.append("theme", blob, filename);
                
                const validateRes = await fetch("/api/theme/validate", {
                  method: "POST",
                  body: formData
                });
                
                const validateData = await validateRes.json();
                setIsExporting(false);
                
                if (!validateRes.ok || validateData.error) {
                  console.warn("Theme validation API failed:", validateData.error);
                  alert(`Warning: The theme validation service encountered an error (${validateData.error || 'Server Error'}). We will download the theme anyway, but it has not been fully verified.`);
                } else if (validateData.success && validateData.report) {
                  const hasFatals = Object.keys(validateData.report.fatal || {}).length > 0;
                  const hasErrors = Object.keys(validateData.report.error || {}).length > 0;
                  const hasWarnings = Object.keys(validateData.report.warning || {}).length > 0;
                  
                  if (hasFatals || hasErrors || hasWarnings) {
                    setValidationReport(validateData.report);
                    setThemeBlob(blob);
                    setThemeFilename(filename);
                    setShowValidationModal(true);
                    return;
                  }
                }
                
                // If clean (or API failed but we still have blob), download directly
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error) {
                setIsExporting(false);
                console.error("Export theme error:", error);
                alert("Error exporting theme. Please check console logs.");
              }
            }}
          >
            {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            <span>{isExporting ? "Validating..." : "Export Theme"}</span>
          </button>
        </div>
    </header>

      <TemplatePickerModal 
        isOpen={showTemplateModal} 
        onClose={() => setShowTemplateModal(false)} 
      />

      {customTemplateModal.isOpen && (
        <CustomTemplateModal
          isOpen={customTemplateModal.isOpen}
          mode={customTemplateModal.mode}
          initialValue={customTemplateModal.initialValue}
          sourcePage={activePage}
          existingSlugs={allPageKeys}
          onClose={() => setCustomTemplateModal((prev) => ({ ...prev, isOpen: false }))}
          onSubmit={(name) => {
            if (customTemplateModal.mode === "duplicate") {
              duplicateCustomPage(activePage, name);
            } else {
              createCustomPage(name);
            }
          }}
        />
      )}

      {showValidationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 9999 }}>
          <div role="dialog" aria-modal="true" className="bg-white rounded-xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ width: '600px', maxWidth: '90vw' }}>
            <div className={`flex justify-between items-center px-6 py-4 border-b border-gray-100 ${validationReport?.score?.level === 'error' ? 'bg-red-50/50' : validationReport?.score?.level === 'warning' ? 'bg-yellow-50/50' : 'bg-green-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${validationReport?.score?.level === 'error' ? 'bg-red-100 text-red-600' : validationReport?.score?.level === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                  {validationReport?.score?.level === 'passing' ? <Check size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {validationReport?.score?.level === 'passing' ? 'Theme Validation Passed' : 'Theme Validation Issues'}
                    </h3>
                    {validationReport?.score && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${validationReport.score.level === 'error' ? 'bg-red-100 text-red-700' : validationReport.score.level === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        Score: {validationReport.score.value}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Ghost validator (gscan) detected issues that may prevent upload.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Boolean(
                  (validationReport?.fatal && Object.keys(validationReport.fatal).length > 0) ||
                  (validationReport?.error && Object.keys(validationReport.error).length > 0) ||
                  (validationReport?.warning && Object.keys(validationReport.warning).length > 0)
                ) && (
                  <button
                    type="button"
                    onClick={handleCopyErrors}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-xs transition-colors cursor-pointer"
                    title="Copy all validation issues to clipboard"
                  >
                    {copiedError ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    <span>{copiedError ? "Copied!" : "Copy Errors"}</span>
                  </button>
                )}
                <button onClick={() => setShowValidationModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {(!validationReport?.fatal || Object.keys(validationReport.fatal).length === 0) &&
               (!validationReport?.error || Object.keys(validationReport.error).length === 0) &&
               (!validationReport?.warning || Object.keys(validationReport.warning).length === 0) && (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check size={32} />
                   </div>
                   <h4 className="font-bold text-gray-900 text-lg mb-2">Theme is fully compatible!</h4>
                   <p className="text-gray-500">No issues were found. Your theme is ready to be exported and uploaded to Ghost.</p>
                 </div>
               )}

              {validationReport?.fatal && Object.keys(validationReport.fatal).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                    Fatal Errors ({Object.keys(validationReport.fatal).length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {Object.values(validationReport.fatal).map((err: GscanIssue, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm relative group">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{err.rule}</p>
                          <button
                            type="button"
                            onClick={() => handleCopySingleIssue(err, `fatal-${i}`)}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                            title="Copy this error"
                          >
                            {copiedSingleId === `fatal-${i}` ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{err.details}</p>
                        {err.failures && err.failures.length > 0 && (
                          <div className="bg-red-50 p-2 rounded text-[11px] font-mono text-red-800 break-all">
                            Affected: {err.failures.map((f: GscanFailure) => f.ref).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {validationReport?.error && Object.keys(validationReport.error).length > 0 && (
                <div>
                  <h4 className="font-bold text-orange-600 text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                    Errors ({Object.keys(validationReport.error).length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {Object.values(validationReport.error).map((err: GscanIssue, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm relative group">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{err.rule}</p>
                          <button
                            type="button"
                            onClick={() => handleCopySingleIssue(err, `error-${i}`)}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                            title="Copy this error"
                          >
                            {copiedSingleId === `error-${i}` ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{err.details}</p>
                        {err.failures && err.failures.length > 0 && (
                          <div className="bg-orange-50 p-2 rounded text-[11px] font-mono text-orange-800 break-all">
                            Affected: {err.failures.map((f: GscanFailure) => f.ref).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {validationReport?.warning && Object.keys(validationReport.warning).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-yellow-600 text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                    Warnings ({Object.keys(validationReport.warning).length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {Object.values(validationReport.warning).map((err: GscanIssue, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm relative group">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{err.rule}</p>
                          <button
                            type="button"
                            onClick={() => handleCopySingleIssue(err, `warn-${i}`)}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                            title="Copy this warning"
                          >
                            {copiedSingleId === `warn-${i}` ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{err.details}</p>
                        {err.failures && err.failures.length > 0 && (
                          <div className="bg-yellow-50 p-2 rounded text-[11px] font-mono text-yellow-800 break-all">
                            Affected: {err.failures.map((f: GscanFailure) => f.ref).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                onClick={() => setShowValidationModal(false)}
              >
                {themeBlob ? "Cancel & Fix" : "Close"}
              </button>

              <div className="flex items-center gap-2.5">
                {Boolean(
                  (validationReport?.fatal && Object.keys(validationReport.fatal).length > 0) ||
                  (validationReport?.error && Object.keys(validationReport.error).length > 0) ||
                  (validationReport?.warning && Object.keys(validationReport.warning).length > 0)
                ) && (
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                    onClick={handleCopyErrors}
                  >
                    {copiedError ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    <span>{copiedError ? "Copied to Clipboard!" : "Copy Errors"}</span>
                  </button>
                )}
                {themeBlob && (
                  <button 
                    className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      if (themeBlob && themeFilename) {
                        const url = URL.createObjectURL(themeBlob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = themeFilename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                      setShowValidationModal(false);
                    }}
                  >
                    Download Anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
