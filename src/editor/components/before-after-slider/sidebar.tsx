"use client";

import React, { useRef } from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import {
  BeforeAfterSliderProps,
  resolveBeforeAfterProps,
  SliderContentWidth,
  SliderAspectRatio,
  SliderBorderRadius,
} from "./schema";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Sliders,
  Tag,
  Maximize2,
} from "lucide-react";

const EMPTY_ASSETS: Record<string, string> = {};

const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (c: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-8 h-4.5 flex items-center shrink-0 rounded-full p-0.5 transition-colors ${
      checked ? "bg-blue-500" : "bg-gray-200"
    }`}
  >
    <div
      className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${
        checked ? "translate-x-3.5" : "translate-x-0"
      }`}
    />
  </button>
);

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: React.ReactNode; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200/50">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`flex-1 flex justify-center items-center py-1.5 text-[11px] font-medium rounded-sm transition-all ${
          value === opt.value
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export function SidebarElement({
  block,
  onChangeProps,
}: {
  block: BuilderBlock;
  onChangeProps: (props: Record<string, unknown>) => void;
  onChangeStyles?: (styles: Record<string, unknown>) => void;
}) {
  const p: BeforeAfterSliderProps = resolveBeforeAfterProps(block.props);
  const addAsset = useEditorStore((state) => state.addAsset);
  const assets = useEditorStore((state) => state.document.assets) || EMPTY_ASSETS;

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const updateCategory = <K extends keyof BeforeAfterSliderProps>(
    category: K,
    patch: Partial<BeforeAfterSliderProps[K]>
  ) => {
    onChangeProps({
      ...p,
      [category]: {
        ...(p[category] as object),
        ...patch,
      },
    });
  };

  const resolveUrl = (rawUrl?: string): string => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("asset://")) {
      const path = rawUrl.replace("asset://", "");
      return assets[path] || assets[`assets/${path}`] || rawUrl;
    }
    return rawUrl;
  };

  const handleFileUpload = (file: File, target: "before" | "after") => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string;
      if (!dataUri) return;

      const ext = file.name.split(".").pop() || "png";
      const id = Math.random().toString(36).substring(7);
      const assetPath = `assets/images/blocks/${id}.${ext}`;

      addAsset(assetPath, dataUri);
      const assetUrl = `asset://${assetPath.replace("assets/", "")}`;

      if (target === "before") {
        updateCategory("content", { beforeImage: assetUrl });
      } else {
        updateCategory("content", { afterImage: assetUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const beforePreview = resolveUrl(p.content.beforeImage);
  const afterPreview = resolveUrl(p.content.afterImage);

  return (
    <div className="flex flex-col gap-6 text-xs font-sans text-brand-ink">
      {/* 1. CONTENT (Heading, Description, Before/After Images) */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-mute font-mono flex items-center gap-1.5">
          <ImageIcon size={12} />
          <span>Content & Images</span>
        </span>

        {/* Section Heading & Description */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-700">Heading</label>
          <input
            type="text"
            value={p.content.heading || ""}
            onChange={(e) => updateCategory("content", { heading: e.target.value })}
            placeholder="e.g. Before & After"
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-700">Description</label>
          <textarea
            rows={2}
            value={p.content.description || ""}
            onChange={(e) => updateCategory("content", { description: e.target.value })}
            placeholder="Short description or instructions..."
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* BEFORE IMAGE CARD */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
              Before Image
            </span>
            {beforePreview && (
              <button
                type="button"
                onClick={() => updateCategory("content", { beforeImage: "" })}
                className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1"
                title="Remove Before image"
              >
                <Trash2 size={11} />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Thumbnail preview */}
          {beforePreview ? (
            <div className="relative w-full h-24 rounded border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={beforePreview}
                alt="Before preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-16 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
              <span className="text-[11px]">No image selected</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={beforeFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "before");
              }}
            />
            <button
              type="button"
              onClick={() => beforeFileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload size={12} />
              <span>Upload Image</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-500">Image URL</label>
            <input
              type="text"
              value={p.content.beforeImage}
              onChange={(e) => updateCategory("content", { beforeImage: e.target.value })}
              placeholder="https://... or asset://"
              className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-500">Alt Text</label>
            <input
              type="text"
              value={p.content.beforeAlt}
              onChange={(e) => updateCategory("content", { beforeAlt: e.target.value })}
              placeholder="Descriptive alt text"
              className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* AFTER IMAGE CARD */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
              After Image
            </span>
            {afterPreview && (
              <button
                type="button"
                onClick={() => updateCategory("content", { afterImage: "" })}
                className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1"
                title="Remove After image"
              >
                <Trash2 size={11} />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Thumbnail preview */}
          {afterPreview ? (
            <div className="relative w-full h-24 rounded border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={afterPreview}
                alt="After preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-16 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
              <span className="text-[11px]">No image selected</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={afterFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "after");
              }}
            />
            <button
              type="button"
              onClick={() => afterFileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload size={12} />
              <span>Upload Image</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-500">Image URL</label>
            <input
              type="text"
              value={p.content.afterImage}
              onChange={(e) => updateCategory("content", { afterImage: e.target.value })}
              placeholder="https://... or asset://"
              className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-500">Alt Text</label>
            <input
              type="text"
              value={p.content.afterAlt}
              onChange={(e) => updateCategory("content", { afterAlt: e.target.value })}
              placeholder="Descriptive alt text"
              className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Toggle Show Alt Text on Image */}
        <div className="flex justify-between items-center p-2.5 bg-white border border-gray-200 rounded-lg">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-800">Show Alt Text on Image</span>
            <span className="text-[10px] text-gray-500">
              Display captions at the bottom of before & after images
            </span>
          </div>
          <Switch
            checked={Boolean(p.content.showAltText)}
            onChange={(checked) => updateCategory("content", { showAltText: checked })}
          />
        </div>
      </div>

      {/* 2. LABELS SETTINGS */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-mute font-mono flex items-center gap-1.5">
          <Tag size={12} />
          <span>Labels</span>
        </span>

        <div className="flex justify-between items-center p-2.5 bg-white border border-gray-200 rounded-lg">
          <span className="text-xs font-medium text-gray-800">Show Badges</span>
          <Switch
            checked={p.labels.showLabels}
            onChange={(checked) => updateCategory("labels", { showLabels: checked })}
          />
        </div>

        {p.labels.showLabels && (
          <div className="flex flex-col gap-2.5 pl-2 border-l-2 border-blue-200">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">Before Label</label>
              <input
                type="text"
                value={p.labels.beforeLabel}
                onChange={(e) => updateCategory("labels", { beforeLabel: e.target.value })}
                placeholder="Before"
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">After Label</label>
              <input
                type="text"
                value={p.labels.afterLabel}
                onChange={(e) => updateCategory("labels", { afterLabel: e.target.value })}
                placeholder="After"
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-700">Badge Position</label>
              <SegmentedControl<"top" | "bottom">
                options={[
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" },
                ]}
                value={p.labels.position}
                onChange={(val) => updateCategory("labels", { position: val })}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. SLIDER SETTINGS */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-mute font-mono flex items-center gap-1.5">
          <Sliders size={12} />
          <span>Slider Settings</span>
        </span>

        {/* Initial Position */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold text-gray-700">Initial Position</label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-medium text-blue-600">
                {Math.round(p.slider.initialPosition)}%
              </span>
              <div className="flex gap-1 ml-1">
                {[25, 50, 75].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateCategory("slider", { initialPosition: pos })}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-colors ${
                      Math.round(p.slider.initialPosition) === pos
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pos}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={p.slider.initialPosition}
            onChange={(e) =>
              updateCategory("slider", { initialPosition: Number(e.target.value) })
            }
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Handle Color & Divider Color */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-600">Handle Color</label>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded p-1 bg-white">
              <input
                type="color"
                value={p.slider.handleColor}
                onChange={(e) => updateCategory("slider", { handleColor: e.target.value })}
                className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
              />
              <span className="text-[11px] font-mono">{p.slider.handleColor}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-gray-600">Divider Color</label>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded p-1 bg-white">
              <input
                type="color"
                value={p.slider.dividerColor}
                onChange={(e) => updateCategory("slider", { dividerColor: e.target.value })}
                className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
              />
              <span className="text-[11px] font-mono">{p.slider.dividerColor}</span>
            </div>
          </div>
        </div>

        {/* Show Handle Arrows */}
        <div className="flex justify-between items-center p-2.5 bg-white border border-gray-200 rounded-lg">
          <span className="text-xs font-medium text-gray-800">Handle Arrows</span>
          <Switch
            checked={p.slider.showHandleArrows}
            onChange={(checked) => updateCategory("slider", { showHandleArrows: checked })}
          />
        </div>
      </div>

      {/* 4. LAYOUT & SIZING */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-mute font-mono flex items-center gap-1.5">
          <Maximize2 size={12} />
          <span>Layout & Sizing</span>
        </span>

        {/* Content Width */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-700">Content Width</label>
          <SegmentedControl<SliderContentWidth>
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Standard", value: "standard" },
              { label: "Wide", value: "wide" },
              { label: "Full", value: "full" },
            ]}
            value={p.layout.contentWidth}
            onChange={(val) => updateCategory("layout", { contentWidth: val })}
          />
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-700">Aspect Ratio</label>
          <select
            value={p.layout.aspectRatio}
            onChange={(e) =>
              updateCategory("layout", { aspectRatio: e.target.value as SliderAspectRatio })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:border-blue-400 focus:outline-none"
          >
            <option value="16/9">16:9 (Widescreen landscape)</option>
            <option value="4/3">4:3 (Classic landscape)</option>
            <option value="3/2">3:2 (Standard photo)</option>
            <option value="1/1">1:1 (Square)</option>
            <option value="21/9">21:9 (Cinematic ultrawide)</option>
            <option value="auto">Auto (Custom height)</option>
          </select>
        </div>

        {p.layout.aspectRatio === "auto" && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-700">Custom Height</label>
            <input
              type="text"
              value={p.layout.customHeight !== undefined ? p.layout.customHeight : "480px"}
              onChange={(e) => updateCategory("layout", { customHeight: e.target.value })}
              placeholder="e.g. 480px or 60vh"
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
            <span className="text-[10px] text-gray-500">
              Accepts px, vh, rem, or number (e.g. 500)
            </span>
          </div>
        )}

        {/* Border Radius */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-700">Corner Radius</label>
          <select
            value={p.layout.borderRadius}
            onChange={(e) =>
              updateCategory("layout", { borderRadius: e.target.value as SliderBorderRadius })
            }
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:border-blue-400 focus:outline-none"
          >
            <option value="rounded-none">Square (0px)</option>
            <option value="rounded-sm">Small (4px)</option>
            <option value="rounded-md">Medium (6px)</option>
            <option value="rounded-lg">Large (8px)</option>
            <option value="rounded-xl">Extra Large (12px)</option>
            <option value="rounded-2xl">2X Large (16px)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
