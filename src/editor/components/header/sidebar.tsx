import React from "react";
import { BuilderBlock } from "@/types/theme";
import { useEditorStore } from "@/store/editorStore";
import { BackgroundControls } from "../shared/BackgroundControls";

const DEFAULT_NAV_ITEMS = [
  { label: "Home", url: "/" },
  { label: "About", url: "/about" },
  { label: "Team", url: "/team" }
];

interface NavItemWithChildren {
  label: string;
  url: string;
  children?: Array<{ label: string; url: string }>;
}

const Switch = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
  <button 
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-8 h-4.5 flex items-center shrink-0 rounded-full p-0.5 transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
  >
    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
  </button>
);

const SegmentedControl = ({ options, value, onChange }: { 
  options: { label: React.ReactNode; value: string; disabled?: boolean }[]; 
  value: string; 
  onChange: (v: string) => void 
}) => (
  <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200/50">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        disabled={opt.disabled}
        onClick={() => onChange(opt.value)}
        title={opt.disabled ? "Wider than the current Section Width — increase Section Width first" : undefined}
        className={`flex-1 flex justify-center items-center py-1.5 text-[11px] font-medium rounded-sm transition-all ${
          opt.disabled
            ? 'text-gray-300 cursor-not-allowed'
            : value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ColorPicker = ({ label, value, onChange, defaultTokenLabel = "Theme Default" }: { label: string, value: string, onChange: (v: string) => void, defaultTokenLabel?: string }) => {
  const isCustom = !!value;
  return (
    <div className="flex items-center justify-between gap-3 bg-white p-2 border-b border-gray-100 last:border-b-0">
      <div className="flex flex-col">
        <span className="text-[12px] font-medium text-gray-800">{label}</span>
        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isCustom} 
            onChange={(e) => {
              if (e.target.checked) onChange("#000000");
              else onChange("");
            }}
            className="rounded-xs border-gray-300 w-3 h-3 accent-brand-primary"
          />
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Custom</span>
        </label>
      </div>
      {isCustom ? (
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-1.5 py-1">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-none p-0 bg-transparent"
          />
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-14 text-[10px] font-mono text-gray-600 bg-transparent outline-none uppercase"
          />
        </div>
      ) : (
        <div className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-1 rounded font-semibold tracking-tight">
          {defaultTokenLabel}
        </div>
      )}
    </div>
  );
};

export const SidebarElement = ({ block, onChangeProps, onChangeStyles }: {
  block: BuilderBlock;
  onChangeProps: (props: Record<string, unknown>) => void;
  onChangeStyles?: (styles: Record<string, unknown>) => void;
}) => {
  const { document: doc, addAsset } = useEditorStore();
  const p = block.props || {};
  const g = p.general || {};
  const a = p.appearance || {};

  const updateCategory = (category: string, key: string, value: unknown) => {
    onChangeProps({
      ...p,
      [category]: {
        ...(p[category] || {}),
        [key]: value
      }
    });
  };


  const WIDTH_ORDER = ["narrow", "standard", "wide", "full"];
  const sectionRank = WIDTH_ORDER.indexOf(a.sectionWidth || "full");

  return (
    <div className="flex flex-col gap-6">
      
      {/* Brand & Toggles */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-brand-body">Layout Style</label>
          <select
            value={g.layoutStyle || "Logo on Left"}
            onChange={(e) => updateCategory("general", "layoutStyle", e.target.value)}
            className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
          >
            <option value="Logo on Left">Logo on Left</option>
            <option value="Logo in Center">Logo in Center</option>
            <option value="Stacked">Stacked</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-brand-body">Site / Publication Title</label>
          <input
            type="text"
            value={g.siteTitle === "My Ghost Theme" ? "" : (g.siteTitle ?? "")}
            onChange={(e) => updateCategory("general", "siteTitle", e.target.value)}
            className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
            placeholder={doc?.metadata?.name || "e.g. My Publication"}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-brand-body">Logo Image URL (Optional)</label>
          <input
            type="text"
            value={g.logoUrl ?? ""}
            onChange={(e) => updateCategory("general", "logoUrl", e.target.value)}
            className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
            placeholder="https://..."
          />
          <input
            type="file"
            accept="image/*"
            className="text-[10px] w-full file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUri = ev.target?.result as string;
                if (!dataUri) return;
                const ext = file.name.split(".").pop() || "png";
                const id = Math.random().toString(36).substring(7);
                const assetPath = `assets/images/header/${id}.${ext}`;
                addAsset(assetPath, dataUri);
                updateCategory("general", "logoUrl", `asset://${assetPath.replace("assets/", "")}`);
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-brand-body">Dark Mode Logo URL (Optional)</label>
          <input
            type="text"
            value={g.darkLogoUrl ?? ""}
            onChange={(e) => updateCategory("general", "darkLogoUrl", e.target.value)}
            className="w-full px-3 py-1.5 border border-brand-hairline rounded-sm text-xs font-sans focus:outline-none bg-brand-canvas-soft"
            placeholder="https://... (Used in dark mode)"
          />
          <input
            type="file"
            accept="image/*"
            className="text-[10px] w-full file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUri = ev.target?.result as string;
                if (!dataUri) return;
                const ext = file.name.split(".").pop() || "png";
                const id = Math.random().toString(36).substring(7);
                const assetPath = `assets/images/header/${id}.${ext}`;
                addAsset(assetPath, dataUri);
                updateCategory("general", "darkLogoUrl", `asset://${assetPath.replace("assets/", "")}`);
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-brand-body">Member State Preview</label>
          <SegmentedControl
            options={[
              { label: "Visitor", value: "visitor" },
              { label: "Member", value: "member" }
            ]}
            value={g.memberPreviewState || "visitor"}
            onChange={(v) => updateCategory("general", "memberPreviewState", v)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-sans font-semibold text-brand-body">Logo Size</label>
            <span className="text-[9px] font-mono text-brand-mute">{g.logoSize || 40}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={g.logoSize || 40}
            onChange={(e) => updateCategory("general", "logoSize", parseInt(e.target.value, 10))}
            className="w-full accent-brand-primary cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-0 border border-gray-100 rounded-lg overflow-hidden mt-1 shadow-sm">
          
          <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100">
            <span className="text-[12px] font-medium text-gray-800">Show Logo / Title</span>
            <Switch checked={g.showLogo ?? true} onChange={(c) => updateCategory("general", "showLogo", c)} />
          </div>

          <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100">
            <span className="text-[12px] font-medium text-gray-800">Show Search Icon</span>
            <Switch checked={g.showSearch ?? true} onChange={(c) => updateCategory("general", "showSearch", c)} />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100">
            <span className="text-[12px] font-medium text-gray-800">Show Theme Switcher</span>
            <Switch checked={g.showThemeSwitcher ?? true} onChange={(c) => updateCategory("general", "showThemeSwitcher", c)} />
          </div>

          <div className="flex flex-col bg-white border-b border-gray-100">
            <div className="flex justify-between items-center p-3">
              <span className="text-[12px] font-medium text-gray-800">Sign In Button</span>
              <Switch checked={g.showSignIn ?? true} onChange={(c) => updateCategory("general", "showSignIn", c)} />
            </div>
            {(g.showSignIn ?? true) && (
              <div className="px-3 pb-3 pt-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Sign In Text</label>
                <input 
                  type="text" 
                  value={g.signInText || "Sign in"}
                  onChange={(e) => updateCategory("general", "signInText", e.target.value)}
                  className="w-full px-2 py-1.5 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                  placeholder="Button Text"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col bg-white">
            <div className="flex justify-between items-center p-3">
              <span className="text-[12px] font-medium text-gray-800">Subscribe Button</span>
              <Switch checked={g.showSubscribe ?? true} onChange={(c) => updateCategory("general", "showSubscribe", c)} />
            </div>
            {(g.showSubscribe ?? true) && (
              <div className="px-3 pb-3 pt-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Subscribe Text</label>
                <input 
                  type="text" 
                  value={g.subscribeText ?? "Subscribe"}
                  onChange={(e) => updateCategory("general", "subscribeText", e.target.value)}
                  className="w-full px-2 py-1.5 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                  placeholder="Subscribe"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-5">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-bold text-gray-900 tracking-tight">Navigation Items</span>
          <button
            type="button"
            onClick={() => {
              const currentItems = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
              onChangeProps({
                ...p,
                navItems: [...currentItems, { label: "New Link", url: "#" }]
              });
            }}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            + Add Link
          </button>
        </div>

        {/* Dropdown Prefix */}
        <div className="flex flex-col gap-1 mt-1 p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] font-semibold text-gray-700">Dropdown Prefix</label>
            <input
              type="text"
              value={g.dropdownPrefix ?? "-"}
              onChange={(e) => updateCategory("general", "dropdownPrefix", e.target.value)}
              className="w-16 px-2 py-1 text-[11px] font-mono text-center border border-indigo-200 rounded bg-white focus:outline-none focus:border-indigo-400"
              placeholder="-"
            />
          </div>
          <p className="text-[9px] text-gray-500 leading-[1.4]">
            In Ghost Admin → Navigation, prefix sub-items with this character (e.g. <code className="font-mono bg-white px-1 py-0.5 rounded text-indigo-600">{g.dropdownPrefix || "-"} Sublink</code>) to group them as dropdowns.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {(Array.isArray(p.navItems) && p.navItems.length > 0 ? p.navItems : DEFAULT_NAV_ITEMS).map((item: NavItemWithChildren, idx: number) => (
            <div key={idx} className="flex flex-col gap-0">
              {/* Parent nav item row */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-t p-1.5" style={{ borderRadius: item.children && item.children.length > 0 ? '6px 6px 0 0' : '6px' }}>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                    currentItems[idx] = { ...currentItems[idx], label: e.target.value };
                    onChangeProps({ ...p, navItems: currentItems });
                  }}
                  className="w-[38%] px-2 py-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => {
                    const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                    currentItems[idx] = { ...currentItems[idx], url: e.target.value };
                    onChangeProps({ ...p, navItems: currentItems });
                  }}
                  className="w-[38%] px-2 py-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none font-mono"
                  placeholder="URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                    const children = currentItems[idx].children || [];
                    currentItems[idx] = { ...currentItems[idx], children: [...children, { label: "Sub Link", url: "#" }] };
                    onChangeProps({ ...p, navItems: currentItems });
                  }}
                  className="text-indigo-500 hover:text-indigo-700 text-[9px] font-semibold cursor-pointer whitespace-nowrap px-1"
                  title="Add Sub-link"
                >
                  + Sub
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                    currentItems.splice(idx, 1);
                    onChangeProps({ ...p, navItems: currentItems });
                  }}
                  className="text-gray-400 hover:text-red-500 px-1 text-sm font-bold cursor-pointer"
                  title="Remove Link"
                >
                  ×
                </button>
              </div>

              {/* Child sub-link rows */}
              {item.children && item.children.length > 0 && (
                <div className="flex flex-col border-l-2 border-indigo-200 ml-3 bg-indigo-50/30 rounded-b border border-t-0 border-gray-200/60">
                  {item.children.map((child: { label: string; url: string }, cidx: number) => (
                    <div key={cidx} className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 last:border-b-0">
                      <span className="text-[10px] text-indigo-400 font-mono select-none">↳</span>
                      <input
                        type="text"
                        value={child.label}
                        onChange={(e) => {
                          const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                          const children = [...(currentItems[idx].children || [])];
                          children[cidx] = { ...children[cidx], label: e.target.value };
                          currentItems[idx] = { ...currentItems[idx], children };
                          onChangeProps({ ...p, navItems: currentItems });
                        }}
                        className="w-[38%] px-2 py-0.5 text-[10px] border border-gray-200 rounded bg-white focus:outline-none"
                        placeholder="Sub Label"
                      />
                      <input
                        type="text"
                        value={child.url}
                        onChange={(e) => {
                          const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                          const children = [...(currentItems[idx].children || [])];
                          children[cidx] = { ...children[cidx], url: e.target.value };
                          currentItems[idx] = { ...currentItems[idx], children };
                          onChangeProps({ ...p, navItems: currentItems });
                        }}
                        className="w-[38%] px-2 py-0.5 text-[10px] font-mono border border-gray-200 rounded bg-white focus:outline-none"
                        placeholder="/url"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentItems: NavItemWithChildren[] = Array.isArray(p.navItems) && p.navItems.length > 0 ? [...p.navItems] : [...DEFAULT_NAV_ITEMS];
                          const children = [...(currentItems[idx].children || [])];
                          children.splice(cidx, 1);
                          currentItems[idx] = { ...currentItems[idx], children };
                          onChangeProps({ ...p, navItems: currentItems });
                        }}
                        className="text-gray-400 hover:text-red-500 px-0.5 text-xs font-bold cursor-pointer"
                        title="Remove Sub-link"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BACKGROUND */}
      <BackgroundControls
        styles={block.styles}
        appearance={a}
        onChangeStyles={(s) => onChangeStyles && onChangeStyles(s)}
        updateAppearance={(k, v) => updateCategory("appearance", k, v)}
        showBackdropBlur
      />

      {/* COLORS */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
        <span className="text-[12px] font-bold text-gray-900 tracking-tight">Colors</span>
        
        <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden shadow-sm">
          <ColorPicker 
            label="Text Color" 
            value={a.textColor || ""} 
            onChange={(v) => updateCategory("appearance", "textColor", v)} 
          />
          <ColorPicker 
            label="Button Background" 
            value={a.buttonBgColor || ""} 
            onChange={(v) => updateCategory("appearance", "buttonBgColor", v)} 
          />
          <ColorPicker 
            label="Button Text" 
            value={a.buttonTextColor || ""} 
            onChange={(v) => updateCategory("appearance", "buttonTextColor", v)} 
          />
        </div>
      </div>

      {/* LAYOUT */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
        <span className="text-[12px] font-bold text-gray-900 tracking-tight">Layout</span>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-gray-600">Section Width</label>
          <SegmentedControl 
            value={a.sectionWidth || "full"}
            onChange={(v) => updateCategory("appearance", "sectionWidth", v)}
            options={[
              { label: "Full", value: "full" },
              { label: "Wide", value: "wide" },
              { label: "Standard", value: "standard" },
              { label: "Narrow", value: "narrow" }
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-semibold text-gray-600">Content Width</label>
          <SegmentedControl 
            value={a.contentWidth || "wide"}
            onChange={(v) => updateCategory("appearance", "contentWidth", v)}
            options={[
              { label: "Full", value: "full", disabled: WIDTH_ORDER.indexOf("full") > sectionRank },
              { label: "Wide", value: "wide", disabled: WIDTH_ORDER.indexOf("wide") > sectionRank },
              { label: "Standard", value: "standard", disabled: WIDTH_ORDER.indexOf("standard") > sectionRank },
              { label: "Narrow", value: "narrow", disabled: WIDTH_ORDER.indexOf("narrow") > sectionRank }
            ]}
          />
        </div>

      </div>

      {/* SPACING */}
      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
        <span className="text-[12px] font-bold text-gray-900 tracking-tight">Spacing</span>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-sans font-semibold text-brand-body">Top Padding</label>
            <span className="text-[9px] font-mono text-brand-mute">
              {p.spacing?.paddingTop ?? 20}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="2"
            value={p.spacing?.paddingTop ?? 20}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateCategory("spacing", "paddingTop", val);
              if (onChangeStyles) {
                onChangeStyles({ paddingTop: `${val}px` });
              }
            }}
            className="w-full accent-brand-primary cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-sans font-semibold text-brand-body">Bottom Padding</label>
            <span className="text-[9px] font-mono text-brand-mute">
              {p.spacing?.paddingBottom ?? 20}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="2"
            value={p.spacing?.paddingBottom ?? 20}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateCategory("spacing", "paddingBottom", val);
              if (onChangeStyles) {
                onChangeStyles({ paddingBottom: `${val}px` });
              }
            }}
            className="w-full accent-brand-primary cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};