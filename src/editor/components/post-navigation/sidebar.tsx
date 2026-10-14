import React from "react";
import { BuilderBlock } from "@/types/theme";
import { resolvePostNavigationProps } from "./schema";
import { Sparkles, AlertTriangle } from "lucide-react";

export const SidebarElement = ({
  block,
  onChangeProps,
}: {
  block: BuilderBlock;
  onChangeProps: (props: Record<string, unknown>) => void;
  onChangeStyles?: (styles: Record<string, unknown>) => void;
}) => {
  const p = resolvePostNavigationProps(block.props);

  const updateProp = <K extends keyof ReturnType<typeof resolvePostNavigationProps>>(
    key: K,
    value: ReturnType<typeof resolvePostNavigationProps>[K]
  ) => {
    const existingGeneral = (block.props?.general || {}) as Record<string, unknown>;
    const extra: Record<string, unknown> = {};
    if (key === "layoutStyle") {
      extra.layout = value;
    }
    onChangeProps({
      [key]: value,
      ...extra,
      general: {
        ...existingGeneral,
        [key]: value,
        ...extra,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-sans text-brand-ink">
      {/* Post Context Badge */}
      <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-md p-2.5 flex items-start gap-2">
        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-snug">
          <strong className="font-semibold block mb-0.5">Template Context</strong>
          Only works on Post or Page templates (requires ambient Ghost post context).
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200/80 rounded-md p-3">
        <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-xs">
          <Sparkles size={13} className="text-blue-600 shrink-0" />
          <span>Post Navigation</span>
        </div>
        <p className="text-[11px] text-blue-800/90 mt-1 leading-relaxed">
          Provides Previous and Next post links using Ghost&apos;s native navigation helpers.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-brand-ink">Layout Style</span>
          <select
            value={p.layoutStyle}
            onChange={(e) => updateProp("layoutStyle", e.target.value as ReturnType<typeof resolvePostNavigationProps>["layoutStyle"])}
            className="w-full text-xs bg-brand-canvas border border-brand-hairline rounded-md px-2 py-1.5 focus:border-brand-primary outline-none"
          >
            <option value="split">Split (Side by side)</option>
            <option value="stacked">Stacked (Vertical)</option>
            <option value="minimal">Minimal (Text links)</option>
            <option value="centered-arrows">Centered Arrows</option>
            <option value="image-background">Image Background (Editorial)</option>
            <option value="large-typography">Large Typography (Modern)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={p.showImage}
            onChange={(e) => updateProp("showImage", e.target.checked)}
            className="rounded border-brand-hairline"
          />
          <span className="text-[11px] font-medium text-brand-body">Show feature image thumbnail</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={p.showExcerpt}
            onChange={(e) => updateProp("showExcerpt", e.target.checked)}
            className="rounded border-brand-hairline"
          />
          <span className="text-[11px] font-medium text-brand-body">Show post excerpt</span>
        </label>
      </div>
    </div>
  );
};
