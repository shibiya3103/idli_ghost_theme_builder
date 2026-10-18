"use client";

import React, { useRef, useState } from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import {
  ImageHotspotsProps,
  HotspotItem,
  resolveImageHotspotsProps,
  HotspotContentWidth,
  HotspotAspectRatio,
  HotspotBorderRadius,
  HotspotMarkerIcon,
  HotspotTooltipTheme,
} from "./schema";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const EMPTY_ASSETS: Record<string, string> = {};

function generateHotspotId(): string {
  return `hotspot-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

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
    className={`w-8 h-4.5 flex items-center shrink-0 rounded-full p-0.5 transition-colors cursor-pointer ${
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
        className={`flex-1 flex justify-center items-center py-1.5 text-[11px] font-medium rounded-sm transition-all cursor-pointer ${
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

const PRESET_COLORS = [
  "#0070f3", // Blue
  "#171717", // Ink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ffffff", // White
];

export function SidebarElement({
  block,
  onChangeProps,
  onChangeStyles,
}: {
  block: BuilderBlock;
  onChangeProps: (props: Record<string, unknown>) => void;
  onChangeStyles?: (styles: Record<string, unknown>) => void;
}) {
  const p = resolveImageHotspotsProps(block.props);
  const addAsset = useEditorStore((state) => state.addAsset);
  const assets = useEditorStore((state) => state.document.assets) || EMPTY_ASSETS;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    p.hotspots[0]?.id || null
  );

  const updateCategory = <K extends keyof ImageHotspotsProps>(
    category: K,
    patch: Partial<ImageHotspotsProps[K]>
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

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string;
      if (!dataUri) return;

      const ext = file.name.split(".").pop() || "png";
      const id = Math.random().toString(36).substring(7);
      const assetPath = `assets/images/blocks/${id}.${ext}`;

      addAsset(assetPath, dataUri);
      const assetUrl = `asset://${assetPath.replace("assets/", "")}`;
      updateCategory("content", { image: assetUrl });
    };
    reader.readAsDataURL(file);
  };

  const addHotspot = () => {
    const newId = generateHotspotId();
    const newHotspot: HotspotItem = {
      id: newId,
      x: 50,
      y: 50,
      title: `Feature Point ${p.hotspots.length + 1}`,
      description: "Describe this feature or highlight key specifications.",
    };
    onChangeProps({
      ...p,
      hotspots: [...p.hotspots, newHotspot],
    });
    setSelectedHotspotId(newId);
  };

  const updateHotspot = (id: string, patch: Partial<HotspotItem>) => {
    const updated = p.hotspots.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    onChangeProps({
      ...p,
      hotspots: updated,
    });
  };

  const deleteHotspot = (id: string) => {
    const updated = p.hotspots.filter((item) => item.id !== id);
    onChangeProps({
      ...p,
      hotspots: updated,
    });
    if (selectedHotspotId === id) {
      setSelectedHotspotId(updated[0]?.id || null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-xs font-sans text-brand-ink">
      {/* 1. Header & Text Content */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">
          Section Content
        </span>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Heading</label>
          <input
            type="text"
            value={p.content.heading || ""}
            onChange={(e) => updateCategory("content", { heading: e.target.value })}
            placeholder="e.g. Interactive Showcase"
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Description</label>
          <textarea
            value={p.content.description || ""}
            onChange={(e) => updateCategory("content", { description: e.target.value })}
            placeholder="Brief introduction explaining the hotspots..."
            rows={2}
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft resize-none focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 2. Image Selection */}
      <div className="flex flex-col gap-3 pt-3 border-t border-brand-hairline">
        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">
          Base Image
        </span>

        {/* Thumbnail Preview */}
        {p.content.image ? (
          <div className="relative aspect-video w-full rounded-md overflow-hidden border border-brand-hairline bg-neutral-100 group">
            <img
              src={resolveUrl(p.content.image)}
              alt={p.content.alt || "Preview"}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => updateCategory("content", { image: "" })}
              className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-red-600 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove image"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed border-brand-hairline rounded-md text-center bg-brand-canvas-soft">
            <ImageIcon size={24} className="mx-auto mb-1 text-brand-mute" />
            <p className="text-[11px] text-brand-body">No image configured</p>
          </div>
        )}

        {/* Image File Upload & URL */}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-1.5 px-3 bg-brand-primary text-white rounded-sm text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload size={12} />
            <span>Upload Image</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Or Image URL</label>
          <input
            type="text"
            value={p.content.image.startsWith("asset://") ? "" : p.content.image}
            onChange={(e) => updateCategory("content", { image: e.target.value })}
            placeholder="https://..."
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Alt Text</label>
          <input
            type="text"
            value={p.content.alt || ""}
            onChange={(e) => updateCategory("content", { alt: e.target.value })}
            placeholder="Image description for accessibility"
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 3. Hotspots Management */}
      <div className="flex flex-col gap-3 pt-3 border-t border-brand-hairline">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">
            Hotspots ({p.hotspots.length})
          </span>
          <button
            type="button"
            onClick={addHotspot}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-sm font-semibold text-[11px] hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Plus size={11} strokeWidth={2.5} />
            <span>Add Hotspot</span>
          </button>
        </div>

        {/* Hotspots Accordion / List */}
        <div className="flex flex-col gap-2">
          {p.hotspots.map((spot, idx) => {
            const isSelected = selectedHotspotId === spot.id;

            return (
              <div
                key={spot.id}
                className={`border rounded-md transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 shadow-xs"
                    : "border-brand-hairline bg-brand-canvas-soft"
                }`}
              >
                {/* Accordion Item Header */}
                <div
                  onClick={() => {
                    const nextId = isSelected ? null : spot.id;
                    setSelectedHotspotId(nextId);
                    onChangeProps({
                      ...p,
                      activeHotspotId: nextId || "",
                    });
                  }}
                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: p.marker.color || "#0070f3" }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium text-xs truncate">
                      {spot.title || `Hotspot #${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHotspot(spot.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors rounded-sm"
                      title="Delete Hotspot"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Hotspot Detailed Controls */}
                {isSelected && (
                  <div className="p-3 pt-0 border-t border-brand-hairline/60 flex flex-col gap-3">
                    <div className="flex flex-col gap-1 mt-2">
                      <label className="text-[10px] font-semibold text-brand-body">Title</label>
                      <input
                        type="text"
                        value={spot.title}
                        onChange={(e) => updateHotspot(spot.id, { title: e.target.value })}
                        className="w-full px-2 py-1 border border-brand-hairline rounded-sm text-xs bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-brand-body">Description</label>
                      <textarea
                        value={spot.description}
                        onChange={(e) => updateHotspot(spot.id, { description: e.target.value })}
                        placeholder="Detailed content for this hotspot..."
                        rows={2}
                        className="w-full px-2 py-1 border border-brand-hairline rounded-sm text-xs bg-white dark:bg-neutral-800 resize-none focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Action Link Controls */}
                    <div className="flex flex-col gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-brand-hairline">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-brand-body">Navigation Link</span>
                        {spot.linkUrl ? (
                          <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400">Attached</span>
                        ) : (
                          <span className="text-[9px] text-brand-mute">Optional</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-brand-mute">Link URL</label>
                        <input
                          type="text"
                          value={spot.linkUrl || ""}
                          onChange={(e) => updateHotspot(spot.id, { linkUrl: e.target.value })}
                          placeholder="e.g. /learn-more or https://..."
                          className="w-full px-2 py-1 border border-brand-hairline rounded-sm text-xs bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[10px] text-brand-mute">Link Button Text</label>
                        <input
                          type="text"
                          value={spot.linkLabel || ""}
                          onChange={(e) => updateHotspot(spot.id, { linkLabel: e.target.value })}
                          placeholder="e.g. Learn more"
                          className="w-full px-2 py-1 border border-brand-hairline rounded-sm text-xs bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-brand-hairline/50">
                        <label className="text-[10px] text-brand-body">Open in new tab</label>
                        <Switch
                          checked={Boolean(spot.openInNewTab)}
                          onChange={(v) => updateHotspot(spot.id, { openInNewTab: v })}
                        />
                      </div>
                    </div>

                    {/* Coordinates Slider & Number Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-brand-body">X Position</span>
                          <span className="font-mono text-neutral-500">{spot.x}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={spot.x}
                          onChange={(e) => updateHotspot(spot.id, { x: parseFloat(e.target.value) || 0 })}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-brand-body">Y Position</span>
                          <span className="font-mono text-neutral-500">{spot.y}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={spot.y}
                          onChange={(e) => updateHotspot(spot.id, { y: parseFloat(e.target.value) || 0 })}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Marker Appearance */}
      <div className="flex flex-col gap-3 pt-3 border-t border-brand-hairline">
        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">
          Marker & Tooltip Appearance
        </span>

        {/* Marker Icon Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Marker Style</label>
          <SegmentedControl<HotspotMarkerIcon>
            value={p.marker.icon}
            onChange={(v) => updateCategory("marker", { icon: v })}
            options={[
              { label: "Plus (+)", value: "plus" },
              { label: "Number (1)", value: "number" },
              { label: "Dot (•)", value: "dot" },
            ]}
          />
        </div>

        {/* Pulse Animation */}
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-brand-body">Pulsing Radar Effect</label>
          <Switch
            checked={p.marker.pulse}
            onChange={(v) => updateCategory("marker", { pulse: v })}
          />
        </div>

        {/* Marker Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Marker Color</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateCategory("marker", { color: c })}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                    p.marker.color.toLowerCase() === c.toLowerCase()
                      ? "scale-110 ring-2 ring-blue-500 ring-offset-1 border-transparent"
                      : "border-black/10 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <input
              type="color"
              value={p.marker.color}
              onChange={(e) => updateCategory("marker", { color: e.target.value })}
              className="w-7 h-7 border border-brand-hairline rounded-sm cursor-pointer p-0 bg-transparent shrink-0"
              title="Custom Color"
            />
          </div>
        </div>

        {/* Tooltip Theme */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Popup Card Theme</label>
          <SegmentedControl<HotspotTooltipTheme>
            value={p.tooltip.theme}
            onChange={(v) => {
              onChangeProps({
                ...p,
                tooltip: { ...p.tooltip, theme: v },
                activeHotspotId: selectedHotspotId || p.hotspots[0]?.id || "",
              });
            }}
            options={[
              { label: "Dark Glass", value: "dark" },
              { label: "Light Glass", value: "light" },
            ]}
          />
          <p className="text-[10px] text-brand-mute">
            {p.tooltip.theme === "light"
              ? "Crisp white card with high-contrast text and sleek light border."
              : "Obsidian dark glass card with glowing border and vibrant accents."}
          </p>
        </div>
      </div>

      {/* 5. Layout & Dimensions */}
      <div className="flex flex-col gap-3 pt-3 border-t border-brand-hairline">
        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-mute">
          Layout & Sizing
        </span>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Max Width</label>
          <SegmentedControl<HotspotContentWidth>
            value={p.layout.contentWidth}
            onChange={(v) => updateCategory("layout", { contentWidth: v })}
            options={[
              { label: "Narrow", value: "narrow" },
              { label: "Std", value: "standard" },
              { label: "Wide", value: "wide" },
              { label: "Full", value: "full" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Aspect Ratio</label>
          <select
            value={p.layout.aspectRatio}
            onChange={(e) => updateCategory("layout", { aspectRatio: e.target.value as HotspotAspectRatio })}
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none"
          >
            <option value="16/9">16:9 (Landscape)</option>
            <option value="4/3">4:3 (Classic)</option>
            <option value="3/2">3:2 (Photo)</option>
            <option value="1/1">1:1 (Square)</option>
            <option value="21/9">21:9 (Cinematic)</option>
            <option value="auto">Auto / Custom Height</option>
          </select>
        </div>

        {p.layout.aspectRatio === "auto" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-brand-body">Custom Height</label>
            <input
              type="text"
              value={p.layout.customHeight || "480px"}
              onChange={(e) => updateCategory("layout", { customHeight: e.target.value })}
              placeholder="e.g. 480px, 60vh"
              className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-brand-body">Corner Radius</label>
          <select
            value={p.layout.borderRadius}
            onChange={(e) => updateCategory("layout", { borderRadius: e.target.value as HotspotBorderRadius })}
            className="w-full px-2.5 py-1.5 border border-brand-hairline rounded-sm text-xs bg-brand-canvas-soft focus:outline-none"
          >
            <option value="rounded-none">Square (0px)</option>
            <option value="rounded-sm">Subtle (4px)</option>
            <option value="rounded-md">Medium (6px)</option>
            <option value="rounded-lg">Large (8px)</option>
            <option value="rounded-xl">Extra Large (12px)</option>
            <option value="rounded-2xl">Pill Curve (16px)</option>
          </select>
        </div>

        {/* Horizontal Side Padding */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-brand-hairline/60">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-brand-body">Side Padding (X)</label>
            <span className="font-mono text-[10px] text-brand-mute">
              {(block.styles?.paddingLeft as string) || p.layout.paddingX || "24px"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="80"
              step="4"
              value={parseInt(String((block.styles?.paddingLeft as string) || p.layout.paddingX || "24"), 10) || 0}
              onChange={(e) => {
                const val = `${e.target.value}px`;
                updateCategory("layout", { paddingX: val });
                onChangeStyles?.({ paddingLeft: val, paddingRight: val });
              }}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { label: "None", val: "0px" },
              { label: "16px", val: "16px" },
              { label: "24px", val: "24px" },
              { label: "48px", val: "48px" },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => {
                  updateCategory("layout", { paddingX: preset.val });
                  onChangeStyles?.({ paddingLeft: preset.val, paddingRight: preset.val });
                }}
                className={`flex-1 py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                  ((block.styles?.paddingLeft as string) || p.layout.paddingX || "24px") === preset.val
                    ? "bg-blue-50 border-blue-500 text-blue-600 font-semibold"
                    : "border-brand-hairline text-brand-body hover:bg-neutral-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
