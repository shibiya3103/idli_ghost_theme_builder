"use client";

import { useEditorStore } from "@/store/editorStore";
import { BuilderBlock } from "@/types/theme";
import { componentRegistry } from "@/editor/components/registry";
import React from "react";
import { useSortable, SortableContext, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus, Sparkles, Ungroup, BoxSelect, Columns } from "lucide-react";
import { getBlockTemplate } from "@/editor/components/blockTemplates";
import { getBackgroundStyle } from "@/editor/components/shared/background";

const SELF_RENDERING_BG_COMPONENTS = new Set([
  "header", "footer", "hero", "newsletter", "post-grid", "testimonials",
  "faq", "grid-gallery", "logo-cloud", "related-posts", "stats", "team",
  "cards", "container", "columns"
]);

// Sortable Wrapper Component with hover/selection Drag Handle
function SortableElement({
  block,
  isSelected,
  onClick,
  onDelete,
  children,
  style = {},
  className = "",
  isGlobal = false
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  isGlobal?: boolean;
}) {
  const {
    isPreviewMode,
    updateBlockStyles,
    updateBlockProps,
    document: themeDoc,
    activePage,
    reorderBlocks,
    deviceMode,
    unwrapBlock,
    wrapBlock,
    makeAdjacent,
  } = useEditorStore();

  const getBlockContext = () => {
    const sections = themeDoc.pages[activePage]?.sections || [];
    const rootIndex = sections.indexOf(block.id);
    if (rootIndex !== -1) {
      return { parentId: undefined, index: rootIndex, siblings: sections };
    }
    for (const pid of Object.keys(themeDoc.blocks)) {
      const parent = themeDoc.blocks[pid];
      if (parent.childrenIds) {
        const idx = parent.childrenIds.indexOf(block.id);
        if (idx !== -1) {
          return { parentId: pid, index: idx, siblings: parent.childrenIds };
        }
      }
    }
    return { parentId: undefined, index: -1, siblings: [] };
  };

  const { parentId, index, siblings } = getBlockContext();
  const isFirst = index === 0;
  const isLast = index === siblings.length - 1;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFirst) return;
    reorderBlocks(index, index - 1, parentId);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLast) return;
    reorderBlocks(index, index + 1, parentId);
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: block.id, disabled: isPreviewMode || isGlobal });
  const { active } = useDndContext();
  const isSidebarDragOver = active?.id.toString().startsWith("sidebar-") && isOver;

  const resolveStyleLocal = (val: unknown): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null) {
      const rec = val as Record<string, string | undefined>;
      return rec[deviceMode] || rec.desktop || undefined;
    }
    return undefined;
  };

  const {
    boxShadow,
    borderWidth,
    borderColor,
    backdropBlur,
    opacity,
    hoverEffect
  } = block.styles;

  const isLogoCloud = block.type === "logo-cloud";
  const resolvedShadow = isLogoCloud ? undefined : (resolveStyleLocal(boxShadow) || style.boxShadow || undefined);
  const resolvedBlur = isLogoCloud ? undefined : resolveStyleLocal(backdropBlur);
  const isGlassActive = !isLogoCloud && !!resolvedBlur && resolvedBlur !== "none" && resolvedBlur !== "0px";

  const resolvedWidth = block.styles.width ? resolveStyleLocal(block.styles.width) : undefined;
  const blockAlign = (block.props?.alignment as string) || (block.styles?.textAlign as string) || "center";
  const resolveMarginLeft = () => {
    if (blockAlign === "left") return "0";
    if (blockAlign === "right") return "auto";
    return resolvedWidth ? "auto" : undefined;
  };
  const resolveMarginRight = () => {
    if (blockAlign === "left") return "auto";
    if (blockAlign === "right") return "0";
    return resolvedWidth ? "auto" : undefined;
  };

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    position: "relative",
    zIndex: resolvedShadow ? 20 : (isGlobal ? 50 : undefined),
    boxShadow: resolvedShadow,
    border: borderWidth && borderWidth !== "0px" ? `${resolveStyleLocal(borderWidth)} solid ${resolveStyleLocal(borderColor) || "#e2e8f0"}` : undefined,
    backdropFilter: isGlassActive ? `blur(${resolvedBlur})` : undefined,
    WebkitBackdropFilter: isGlassActive ? `blur(${resolvedBlur})` : undefined,
    opacity: isDragging ? 0.3 : (opacity ? parseFloat(resolveStyleLocal(opacity) || "1") : undefined),
    width: resolvedWidth,
    maxWidth: "100%",
    marginLeft: resolveMarginLeft(),
    marginRight: resolveMarginRight(),
    marginBottom: block.styles.marginBottom ? resolveStyleLocal(block.styles.marginBottom) : undefined,
    boxSizing: "border-box",
  };

  const getHoverClass = () => {
    if (block.type === "heading" || block.type === "text" || block.type === "share") return "";
    const effect = resolveStyleLocal(hoverEffect);
    if (effect === "scale") return "hover-effect-scale";
    if (effect === "float") return "hover-effect-float";
    if (effect === "glow") return "hover-effect-glow";
    return "";
  };

  const borderClass = isPreviewMode
    ? ""
    : isDragging
      ? "border-2 border-dashed border-brand-primary/50 bg-brand-primary/5 rounded-md min-h-[50px] pointer-events-none"
      : isOver
        ? "border-2 border-dashed border-brand-primary rounded-md ring-2 ring-brand-primary/10"
        : isSelected
          ? "outline-2 outline-brand-primary outline-offset-1 ring-2 ring-white/50"
          : "hover:outline-1 hover:outline-brand-hairline-strong hover:outline-offset-1";

  const handleResizeStart = (e: React.MouseEvent, direction: 'width' | 'innerWidth' | 'height') => {
    e.stopPropagation();
    e.preventDefault();
    const parentEl = e.currentTarget.parentElement;
    if (!parentEl) return;

    const rect = parentEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;

    // For inner width resizing of section content container
    const innerContainerEl = parentEl.querySelector('.container-width');
    const startInnerWidth = innerContainerEl ? innerContainerEl.getBoundingClientRect().width : 1200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'width') {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = startWidth + deltaX * 2; // dual-side expand representation
        const snappedWidth = Math.round(newWidth / 16) * 16;
        updateBlockStyles(block.id, { width: `${Math.max(200, snappedWidth)}px` });
      } else if (direction === 'innerWidth') {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = startInnerWidth + deltaX * 2;
        const snappedWidth = Math.round(newWidth / 16) * 16;
        updateBlockStyles(block.id, { contentWidth: `${Math.max(200, snappedWidth)}px` });
      } else {
        const deltaY = moveEvent.clientY - startY;
        const newHeight = startHeight + deltaY;
        const snappedHeight = Math.round(newHeight / 8) * 8;

        if (block.type === 'spacer') {
          updateBlockProps(block.id, { height: `${Math.max(8, snappedHeight)}px` });
        } else if (block.type === 'section' || block.type === 'hero') {
          // Account for estimated inner content height (~100px offset) so padding isn't excessively huge
          const newPadding = Math.max(0, (snappedHeight - 100) / 2);
          updateBlockStyles(block.id, { 
            paddingTop: `${newPadding}px`, 
            paddingBottom: `${newPadding}px` 
          });
        } else {
          updateBlockStyles(block.id, { height: `${Math.max(16, snappedHeight)}px` });
        }
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      id={`block-${block.id}`}
      ref={setNodeRef}
      style={combinedStyle}
      onClick={isPreviewMode ? undefined : onClick}
      className={`group/sortable relative ${className} ${borderClass} ${getHoverClass()} transition-all duration-200`}
    >
      {isSidebarDragOver && (
        <div className="absolute -bottom-1 left-0 w-full z-40 flex items-center justify-center pointer-events-none">
          <div className="w-full h-1 bg-brand-primary rounded-full shadow-md ring-4 ring-brand-primary/20" />
          <div className="absolute px-3 py-0.5 bg-neutral-900 text-white text-[10px] font-semibold rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
            <Plus size={10} strokeWidth={3} />
            <span>Put after this section</span>
          </div>
        </div>
      )}
      {isDragging ? (
        <div className="w-full py-4 px-6 flex items-center justify-center text-brand-primary/60 font-mono text-[10px] uppercase font-bold tracking-wider animate-pulse">
          Drop {block.type} Here
        </div>
      ) : (
        <>
          {/* Floating Grip handle shown on hover OR selection */}
          {!isPreviewMode && !isGlobal && (
            <div className={`absolute -top-6 left-0 bg-neutral-900 text-white text-[9px] font-mono px-2 py-0.5 rounded-t-sm flex items-center gap-1.5 z-20 transition-all select-none pointer-events-auto ${
              isSelected ? "opacity-100 visible" : "opacity-0 invisible group-hover/sortable:opacity-100 group-hover/sortable:visible"
            }`}>
              <span 
                {...listeners} 
                {...attributes} 
                className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-white/20 rounded-xs"
                title="Drag to reorder"
              >
                <GripVertical size={10} />
              </span>
              <button
                onClick={handleMoveUp}
                disabled={isFirst}
                className={`p-0.5 rounded-xs hover:bg-white/20 transition-colors ${
                  isFirst ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                title="Move component up"
              >
                <ChevronUp size={10} />
              </button>
              <button
                onClick={handleMoveDown}
                disabled={isLast}
                className={`p-0.5 rounded-xs hover:bg-white/20 transition-colors ${
                  isLast ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                title="Move component down"
              >
                <ChevronDown size={10} />
              </button>
              <span className="font-semibold uppercase tracking-wider text-[8px]">{block.type}</span>

              {/* Unwrap button for containers, sections, or blocks with children */}
              {(block.type === "container" || block.type === "section" || (block.childrenIds && block.childrenIds.length > 0)) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    unwrapBlock(block.id);
                  }}
                  className="px-1.5 py-0.5 rounded-xs bg-white/10 hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer text-white"
                  title="Unwrap (extract all inner items)"
                >
                  <Ungroup size={10} />
                  <span className="text-[9px] font-sans font-medium">Unwrap</span>
                </button>
              )}

              {/* Duplicate Beside (Adjacent) for containers */}
              {block.type === "container" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    makeAdjacent(block.id);
                  }}
                  className="px-1.5 py-0.5 rounded-xs bg-white/10 hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer text-white"
                  title="Duplicate beside as adjacent column"
                >
                  <Columns size={10} />
                  <span className="text-[9px] font-sans font-medium">Adjacent</span>
                </button>
              )}

              {/* Wrap button */}
              {block.type !== "container" && block.type !== "section" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    wrapBlock(block.id, "container");
                  }}
                  className="px-1.5 py-0.5 rounded-xs bg-white/10 hover:bg-white/30 transition-colors flex items-center gap-1 cursor-pointer text-white"
                  title="Wrap this block inside a Container"
                >
                  <BoxSelect size={10} />
                  <span className="text-[9px] font-sans font-medium">Wrap</span>
                </button>
              )}

              <button 
                onClick={onDelete}
                className="hover:bg-brand-error-deep p-0.5 rounded-xs transition-colors ml-1"
                title="Delete block"
              >
                <Trash2 size={10} />
              </button>
            </div>
          )}

          {/* Resizing Edge Handles */}
          {!isPreviewMode && !isGlobal && (
            <>
              {/* Outer Section / General Block Width Handle */}
              <div 
                onMouseDown={(e) => handleResizeStart(e, 'width')}
                className="absolute top-0 -right-1 w-2.5 h-full cursor-col-resize group-hover/sortable:bg-brand-primary/20 hover:bg-brand-primary active:bg-brand-primary z-30 transition-all"
                title={block.type === 'section' ? "Drag to resize Outer Background Width" : "Drag to resize Width"}
              />
              
              {/* Inner Section Content Width Handle (rendered only on Section types) */}
              {block.type === 'section' && (
                <div 
                  onMouseDown={(e) => handleResizeStart(e, 'innerWidth')}
                  className="absolute top-0 right-1/2 translate-x-[600px] w-2 h-2/3 my-auto bottom-0 cursor-col-resize border-r border-dashed border-brand-primary/50 hover:border-solid hover:border-brand-primary hover:border-r-2 z-30 transition-all"
                  style={{
                    transform: `translateX(clamp(100px, calc(${resolveStyleLocal(block.styles.contentWidth) || '1200px'} / 2), 50vw))`
                  }}
                  title="Drag to resize Inner Content Width"
                />
              )}

              {/* Bottom Edge (Height / Padding) Resize handle */}
              <div 
                onMouseDown={(e) => handleResizeStart(e, 'height')}
                className="absolute -bottom-1 left-0 w-full h-2 cursor-row-resize group-hover/sortable:border-b-2 group-hover/sortable:border-brand-primary/30 hover:border-brand-primary active:border-brand-primary z-30 transition-all"
                title={block.type === 'section' ? "Drag to resize Section Vertical Padding" : "Drag to resize Height"}
              />
            </>
          )}

          {children}
        </>
      )}
    </div>
  );
}

function InsertionDropSlot({
  index,
  parentId,
  activeDragId,
  onQuickAdd,
}: {
  index: number;
  parentId?: string;
  activeDragId: string | null;
  onQuickAdd: (index: number) => void;
}) {
  const slotId = parentId ? `drop-slot-${parentId}-${index}` : `drop-slot-${index}`;
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
  });

  const isDraggingSidebar = typeof activeDragId === "string" && activeDragId.startsWith("sidebar-");
  const activeTemplate = isDraggingSidebar
    ? getBlockTemplate(activeDragId.replace("sidebar-", ""))
    : null;

  if (activeDragId) {
    return (
      <div
        ref={setNodeRef}
        className={`w-full transition-all duration-150 flex items-center justify-center relative select-none ${
          isOver ? "h-12 my-2" : "h-3 my-0.5 hover:h-6"
        }`}
      >
        {/* Drop line */}
        <div
          className={`w-full transition-all duration-150 rounded-full ${
            isOver
              ? "h-1 bg-brand-primary shadow-md ring-4 ring-brand-primary/20"
              : "h-[2px] bg-brand-primary/20"
          }`}
        />
        {isOver && (
          <div className="absolute left-1/2 -translate-x-1/2 px-3.5 py-1 bg-brand-primary text-white text-[11px] font-semibold rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
            <Plus size={12} strokeWidth={3} />
            <span>Put {activeTemplate?.label || "Component"} here</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group/slot relative w-full h-4 -my-2 flex items-center justify-center z-20 opacity-0 hover:opacity-100 transition-opacity">
      <div className="w-full h-[1px] bg-brand-hairline group-hover/slot:bg-brand-hairline-strong transition-colors" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onQuickAdd(index);
        }}
        className="absolute left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-full shadow-xs hover:border-brand-primary hover:text-brand-primary text-brand-mute text-[10px] font-medium flex items-center gap-1 transition-all group-hover/slot:scale-105 cursor-pointer"
        title={parentId ? "Add block here" : "Add section here"}
      >
        <Plus size={10} />
        <span>{parentId ? "Add block" : "Add section"}</span>
      </button>
    </div>
  );
}

function EmptyColumnSlot({
  blockId,
  colIndex,
  activeDragId,
  onAddBlock,
}: {
  blockId: string;
  colIndex: number;
  activeDragId: string | null;
  onAddBlock: (type: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-slot-${blockId}-${colIndex}`,
  });

  const isDraggingSidebar = typeof activeDragId === "string" && activeDragId.startsWith("sidebar-");
  const activeTemplate = isDraggingSidebar
    ? getBlockTemplate(activeDragId.replace("sidebar-", ""))
    : null;

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full min-h-[150px] rounded-md border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 text-center transition-all box-border ${
        isOver
          ? "border-brand-primary bg-brand-primary/5 ring-4 ring-brand-primary/10 scale-[1.01]"
          : "border-brand-hairline-strong bg-brand-canvas-soft/30 hover:border-brand-primary/40"
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-brand-hairline flex items-center justify-center shadow-xs text-brand-mute">
        <Plus size={13} />
      </div>
      <span className="text-[11px] font-semibold text-brand-body">
        {isOver && activeTemplate ? `Drop ${activeTemplate.label}` : `Column ${colIndex + 1}`}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("heading");
          }}
          className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[10px] font-medium text-brand-body hover:text-brand-ink transition-all shadow-xs cursor-pointer"
        >
          + Heading
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("text");
          }}
          className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[10px] font-medium text-brand-body hover:text-brand-ink transition-all shadow-xs cursor-pointer"
        >
          + Text
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("button");
          }}
          className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[10px] font-medium text-brand-body hover:text-brand-ink transition-all shadow-xs cursor-pointer"
        >
          + Button
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("image");
          }}
          className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[10px] font-medium text-brand-body hover:text-brand-ink transition-all shadow-xs cursor-pointer"
        >
          + Image
        </button>
      </div>
    </div>
  );
}

function EmptyContainerDropZone({
  block,
  activeDragId,
  onAddBlock,
}: {
  block: BuilderBlock;
  activeDragId: string | null;
  onAddBlock: (type: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-slot-${block.id}-0`,
  });

  const isDraggingSidebar = typeof activeDragId === "string" && activeDragId.startsWith("sidebar-");
  const activeTemplate = isDraggingSidebar
    ? getBlockTemplate(activeDragId.replace("sidebar-", ""))
    : null;

  const label = block.type === "section" ? "Section" : "Container";

  return (
    <div
      ref={setNodeRef}
      className={`w-full p-5 rounded-md border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 text-center ${
        isOver
          ? "border-brand-primary bg-brand-primary/5 ring-4 ring-brand-primary/10"
          : "border-brand-hairline-strong bg-brand-canvas-soft/40 hover:border-brand-primary/40"
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-brand-hairline flex items-center justify-center shadow-xs text-brand-mute">
        <Plus size={13} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-brand-ink">
          Empty {label}
        </span>
        <span className="text-[11px] text-brand-mute">
          {isOver && activeTemplate ? (
            <span className="font-semibold text-brand-primary">Drop to put {activeTemplate.label} inside</span>
          ) : (
            "Drop components from left sidebar"
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("heading");
          }}
          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[11px] font-medium text-brand-body hover:text-brand-ink hover:border-brand-hairline-strong transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Heading</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("text");
          }}
          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[11px] font-medium text-brand-body hover:text-brand-ink hover:border-brand-hairline-strong transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Text</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("columns");
          }}
          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[11px] font-medium text-brand-body hover:text-brand-ink hover:border-brand-hairline-strong transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Columns</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("container");
          }}
          className="px-2.5 py-1 bg-brand-primary text-white border border-brand-primary rounded-sm text-[11px] font-medium hover:bg-brand-primary/90 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Container</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("image");
          }}
          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[11px] font-medium text-brand-body hover:text-brand-ink hover:border-brand-hairline-strong transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Image</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBlock("button");
          }}
          className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-brand-hairline rounded-sm text-[11px] font-medium text-brand-body hover:text-brand-ink hover:border-brand-hairline-strong transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Button</span>
        </button>
      </div>
    </div>
  );
}

export default function Canvas() {
  const { 
    document: themeDoc, 
    activePage, 
    deviceMode, 
    selectedBlockId, 
    selectBlock, 
    deleteBlock, 
    previewColorMode,
    canvasFitMode,
    insertBlockAt,
  } = useEditorStore();
  const { active } = useDndContext();
  const activeDragId = active ? active.id.toString() : null;

  React.useEffect(() => {
    if (selectedBlockId) {
      const el = document.getElementById(`block-${selectedBlockId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedBlockId]);

  const pageSections = React.useMemo(() => themeDoc.pages[activePage]?.sections || [], [themeDoc.pages, activePage]);
  const isDark = previewColorMode === "dark";

  // Register canvas container as a droppable target zone
  const { setNodeRef: setCanvasDropRef, isOver: isCanvasOver } = useDroppable({
    id: "canvas-root",
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(1280);
  const [frameHeight, setFrameHeight] = React.useState<number>(850);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const measureFrameHeight = React.useCallback(() => {
    if (!frameRef.current) return;
    const node = frameRef.current;
    const h = Math.max(
      node.scrollHeight,
      node.offsetHeight,
      850
    );
    if (h > 0) {
      setFrameHeight(Math.round(h));
    }
  }, []);

  const setCanvasFrameRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      frameRef.current = node;
      setCanvasDropRef(node);

      if (node) {
        const updateHeight = () => {
          const h = Math.max(node.scrollHeight, node.offsetHeight, 850);
          if (h > 0) {
            setFrameHeight(Math.round(h));
          }
        };

        updateHeight();

        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const entryH = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
            const computedH = Math.max(entryH, node.scrollHeight, node.offsetHeight, 850);
            if (computedH > 0) {
              setFrameHeight(Math.round(computedH));
            }
          }
        });
        ro.observe(node);
        resizeObserverRef.current = ro;
      }
    },
    [setCanvasDropRef]
  );

  React.useEffect(() => {
    measureFrameHeight();
    const timer = setTimeout(measureFrameHeight, 150);
    return () => clearTimeout(timer);
  }, [activePage, deviceMode, pageSections, themeDoc.blocks, measureFrameHeight]);

  const isMobileDevice = deviceMode === "mobile";
  const targetWidth = isMobileDevice ? 375 : deviceMode === "tablet" ? 768 : 1280;
  const availableWidth = Math.max(320, containerWidth - 48);

  let scale = 1;
  // On mobile device mode (375px), render 1:1 without scaling to avoid scale-transform clipping edges and blur
  if (!isMobileDevice && canvasFitMode === "auto" && availableWidth < targetWidth) {
    scale = Math.min(1, Math.max(0.4, availableWidth / targetWidth));
  }
  const isScaled = scale < 0.999;

  const resolveStyle = (val: unknown): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null) {
      const rec = val as Record<string, string | undefined>;
      return rec[deviceMode] || rec.desktop || undefined;
    }
    return undefined;
  };

  const renderBlock = (blockId: string, isGlobal = false): React.ReactNode => {
    const block = themeDoc.blocks[blockId];
    if (!block) return null;

    const isSelected = selectedBlockId === blockId;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      selectBlock(blockId);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteBlock(blockId);
    };

    const def = componentRegistry[block.type];
    if (def) {
      const CanvasElement = def.CanvasElement;
      
      const { 
        backgroundColor, 
        paddingTop, 
        paddingBottom,
        backgroundVideoUrl,
        enableParallax = false,
        width,
        contentWidth,
        display,
        gap,
        justifyContent,
        textAlign,
        borderRadius,
        fontSize,
        fontWeight,
        letterSpacing,
        marginBottom,
        textColor
      } = block.styles;

      const rawBg = resolveStyle(backgroundColor);
      const resolvedBg = (rawBg === "#ffffff" || rawBg === "#fff" || rawBg === "#fafafa") ? "var(--color-canvas)" : rawBg;

      const rawText = resolveStyle(textColor);
      const resolvedText = (rawText === "#171717" || rawText === "#000000")
        ? "var(--color-ink)"
        : (rawText === "#4d4d4d" || rawText === "#666666")
          ? "var(--color-body)"
          : rawText;

      const isLogoCloud = block.type === "logo-cloud";
      const rawShadow = isLogoCloud ? undefined : resolveStyle(block.styles?.boxShadow);
      const hasShadow = !isLogoCloud && !!(rawShadow && rawShadow !== "none");
      const hasHover = block.type !== "heading" && !!(block.styles?.hoverEffect && block.styles.hoverEffect !== "none");
      const hasBackdrop = !isLogoCloud && !!(block.styles?.backdropBlur && block.styles.backdropBlur !== "none" && block.styles.backdropBlur !== "0px");

      let effectiveBg = resolvedBg || undefined;
      if (hasBackdrop) {
        if (!effectiveBg || effectiveBg === "var(--color-canvas)" || effectiveBg === "var(--color-bg)" || effectiveBg === "#fafafa" || effectiveBg === "#ffffff" || effectiveBg === "#fff") {
          effectiveBg = "rgba(255, 255, 255, 0.75)";
        } else if (effectiveBg === "#171717" || effectiveBg === "#000000" || effectiveBg === "#111111") {
          effectiveBg = "rgba(23, 23, 23, 0.75)";
        } else if (effectiveBg.startsWith("#") && effectiveBg.length === 7) {
          const r = parseInt(effectiveBg.slice(1, 3), 16);
          const g = parseInt(effectiveBg.slice(3, 5), 16);
          const b = parseInt(effectiveBg.slice(5, 7), 16);
          effectiveBg = `rgba(${r}, ${g}, ${b}, 0.75)`;
        }
      }
      const blockBgStyle = SELF_RENDERING_BG_COMPONENTS.has(block.type)
        ? {}
        : getBackgroundStyle(block.styles, { backgroundColor: resolvedBg });

      return (
        <SortableElement
          key={block.id}
          block={block}
          isSelected={isSelected}
          onClick={handleClick}
          onDelete={handleDelete}
          isGlobal={isGlobal}
          style={{
            ...blockBgStyle,
            paddingTop: (block.type === 'hero' || block.type === 'columns' || block.type === 'container') ? undefined : (resolveStyle(paddingTop) || undefined),
            paddingBottom: (block.type === 'hero' || block.type === 'columns' || block.type === 'container') ? undefined : (resolveStyle(paddingBottom) || undefined),
            paddingLeft: (block.type === 'columns' || block.type === 'container') ? undefined : (resolveStyle(block.styles?.paddingLeft) || undefined),
            paddingRight: (block.type === 'columns' || block.type === 'container') ? undefined : (resolveStyle(block.styles?.paddingRight) || undefined),
            clipPath: (backgroundVideoUrl && enableParallax) ? "inset(0px)" : undefined,
            width: resolveStyle(width) || undefined,
            maxWidth: "100%",
            marginLeft: block.props?.alignment === "left" ? "0" : (block.props?.alignment === "right" ? "auto" : (resolveStyle(width) ? "auto" : undefined)),
            marginRight: block.props?.alignment === "left" ? "auto" : (block.props?.alignment === "right" ? "0" : (resolveStyle(width) ? "auto" : undefined)),
            display: resolveStyle(display) || undefined,
            gap: resolveStyle(gap) || undefined,
            justifyContent: resolveStyle(justifyContent) || undefined,
            textAlign: (resolveStyle(textAlign) as React.CSSProperties["textAlign"]) || undefined,
            borderRadius: resolveStyle(borderRadius) || undefined,
            fontSize: resolveStyle(fontSize) || undefined,
            fontWeight: resolveStyle(fontWeight) || undefined,
            letterSpacing: resolveStyle(letterSpacing) || undefined,
            marginBottom: resolveStyle(marginBottom) || undefined,
            color: resolvedText || undefined,
          }}
          className={`builder-block builder-block-${block.type} relative w-full ${
            block.styles?.backgroundType === "mesh" ? "mesh-glow" : ""
          } ${
            block.type === "header" || block.type === "footer" || hasShadow || hasHover
              ? "overflow-visible"
              : "overflow-hidden"
          } ${block.type === "header" || block.type === "footer" ? "z-50" : hasShadow ? "z-20" : "z-10"}`}
        >
          {backgroundVideoUrl && (
            <video
              src={resolveStyle(backgroundVideoUrl)}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: enableParallax ? "fixed" : "absolute",
                top: 0,
                left: 0,
                width: enableParallax ? "100vw" : "100%",
                height: enableParallax ? "100vh" : "100%",
                objectFit: "cover",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          )}
          <div 
            style={{ maxWidth: resolveStyle(contentWidth) || undefined }}
            className={block.type === "section" ? "container-width w-full px-4 sm:px-6 mx-auto min-h-[40px] border border-dashed border-transparent hover:border-brand-hairline transition-all relative z-10 box-border" : "w-full relative z-10"}
          >
            <CanvasElement
              block={block}
              isSelected={isSelected}
              onClick={handleClick}
              onDelete={handleDelete}
              renderChildren={() => {
                if (block.type === "columns") {
                  const cols = Number(block.props?.columnsCount) || 2;
                  const validChildren = (block.childrenIds || []).filter((cid) => {
                    const cb = themeDoc.blocks[cid];
                    return cb && cb.type !== "header" && cb.type !== "footer";
                  });
                  const currentCount = validChildren.length;
                  const emptyCount = Math.max(0, cols - currentCount);

                  return (
                    <SortableContext
                      items={validChildren}
                      strategy={rectSortingStrategy}
                    >
                      {validChildren.map((cid) => renderBlock(cid))}
                      {Array.from({ length: emptyCount }).map((_, extraIdx) => {
                        const slotIdx = currentCount + extraIdx;
                        return (
                          <EmptyColumnSlot
                            key={`empty-col-${block.id}-${slotIdx}`}
                            blockId={block.id}
                            colIndex={slotIdx}
                            activeDragId={activeDragId}
                            onAddBlock={(type) => insertBlockAt(type, slotIdx, block.id)}
                          />
                        );
                      })}
                    </SortableContext>
                  );
                }

                return block.childrenIds && block.childrenIds.length > 0 ? (
                  <SortableContext items={block.childrenIds} strategy={verticalListSortingStrategy}>
                    <InsertionDropSlot
                      index={0}
                      parentId={block.id}
                      activeDragId={activeDragId}
                      onQuickAdd={(idx) => insertBlockAt("heading", idx, block.id)}
                    />
                    {block.childrenIds
                      .filter((cid) => {
                        const cb = themeDoc.blocks[cid];
                        return cb && cb.type !== "header" && cb.type !== "footer";
                      })
                      .map((cid, cidx) => (
                        <React.Fragment key={cid}>
                          {renderBlock(cid)}
                          <InsertionDropSlot
                            index={cidx + 1}
                            parentId={block.id}
                            activeDragId={activeDragId}
                            onQuickAdd={(idx) => insertBlockAt("heading", idx, block.id)}
                          />
                        </React.Fragment>
                      ))}
                  </SortableContext>
                ) : (
                  <EmptyContainerDropZone
                    block={block}
                    activeDragId={activeDragId}
                    onAddBlock={(type) => insertBlockAt(type, 0, block.id)}
                  />
                );
              }}
            />
          </div>
        </SortableElement>
      );
    }

    return (
      <div key={block.id} className="p-4 border border-dashed border-brand-hairline-strong text-center text-xs text-brand-mute">
        Unknown block type: {block.type}
      </div>
    );
  };

  const headerBlockId =
    themeDoc.layouts?.header ||
    Object.values(themeDoc.blocks).find((block) => block.type === "header")?.id;

  const footerBlockId =
    themeDoc.layouts?.footer ||
    Object.values(themeDoc.blocks).find((block) => block.type === "footer")?.id;

  const isHeaderOrFooterBlock = (blockId: string, blocks: Record<string, BuilderBlock>): boolean => {
    if (blockId === headerBlockId || blockId === footerBlockId) return true;
    const block = blocks[blockId];
    if (!block) return false;
    if (block.type === "header" || block.type === "footer") return true;
    if (block.childrenIds && block.childrenIds.length > 0) {
      return block.childrenIds.some((cid) => isHeaderOrFooterBlock(cid, blocks));
    }
    return false;
  };

  const fontHeading =
    themeDoc.settings?.designTokens?.typography?.headingFont ||
    themeDoc.settings?.fontFamily ||
    "'Geist', 'Inter', sans-serif";
  const fontBody =
    themeDoc.settings?.designTokens?.typography?.bodyFont ||
    themeDoc.settings?.fontFamily ||
    "'Geist', 'Inter', sans-serif";
  const accentColor =
    themeDoc.settings?.accentColor ||
    themeDoc.settings?.designTokens?.colors?.accent ||
    "#0070f3";

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-brand-canvas-soft overflow-auto p-4 sm:p-8 mesh-glow select-none relative flex flex-col items-center"
    >
      <div 
        className="relative flex justify-center items-start transition-all duration-200"
        style={{
          width: isScaled ? `${Math.round(targetWidth * scale)}px` : `${targetWidth}px`,
          height: isScaled ? `${Math.round(frameHeight * scale)}px` : "auto",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        <div 
          id="canvas-preview-frame"
          ref={setCanvasFrameRef}
          onClick={() => selectBlock(null)}
          style={{
            width: `${targetWidth}px`,
            minWidth: `${targetWidth}px`,
            maxWidth: isMobileDevice ? "375px" : undefined,
            transform: isScaled ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
            ["--gh-font-heading" as string]: fontHeading,
            ["--gh-font-body" as string]: fontBody,
            ["--font-heading" as string]: "var(--gh-font-heading)",
            ["--font-body" as string]: "var(--gh-font-body)",
            ["--ghost-accent-color" as string]: accentColor,
            ["--color-accent" as string]: accentColor,
            ["--color-link" as string]: accentColor,
            fontFamily: "var(--gh-font-body, var(--font-body))",
          }}
          className={`relative shadow-level-5 rounded-md min-h-[850px] h-fit self-start border overflow-x-clip overflow-y-visible transition-shadow duration-300 flex flex-col box-border ${isDark ? "dark bg-[var(--color-canvas)] text-[var(--color-ink)]" : "bg-white"} ${
            isCanvasOver ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-brand-hairline"
          }`}
        >
          {headerBlockId && renderBlock(headerBlockId, true)}

          <div className="w-full flex flex-col grow min-h-0">
            {pageSections.length > 0 ? (
              <SortableContext items={pageSections} strategy={verticalListSortingStrategy}>
                <InsertionDropSlot
                  index={0}
                  activeDragId={activeDragId}
                  onQuickAdd={(idx) => insertBlockAt("section", idx)}
                />
                {pageSections
                  .filter((sid) => !isHeaderOrFooterBlock(sid, themeDoc.blocks))
                  .map((sid, idx) => (
                    <React.Fragment key={sid}>
                      {renderBlock(sid)}
                      <InsertionDropSlot
                        index={idx + 1}
                        activeDragId={activeDragId}
                        onQuickAdd={(nextIdx) => insertBlockAt("section", nextIdx)}
                      />
                    </React.Fragment>
                  ))}
              </SortableContext>
            ) : (
              <div
                id="canvas-empty-slot"
                ref={setCanvasDropRef}
                className={`m-8 p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 text-center transition-all ${
                  isCanvasOver
                    ? "border-brand-primary bg-brand-primary/5 ring-4 ring-brand-primary/10 scale-[1.01]"
                    : "border-brand-hairline-strong bg-brand-canvas-soft/50 hover:border-brand-primary/40"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-brand-hairline flex items-center justify-center shadow-xs text-brand-primary">
                  <Sparkles size={22} />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h4 className="font-sans font-bold text-sm text-brand-ink">Start building your page</h4>
                  <p className="text-xs text-brand-mute leading-relaxed">
                    Click any component on the left sidebar to put it here, or drag and drop directly onto the canvas.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => insertBlockAt("hero", 0)}
                    className="px-3 py-1.5 bg-brand-primary text-white rounded-sm text-xs font-semibold hover:bg-black transition-all shadow-level-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Hero</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertBlockAt("featured-posts", 0)}
                    className="px-3 py-1.5 bg-white border border-brand-hairline text-brand-body hover:text-brand-ink rounded-sm text-xs font-medium hover:bg-brand-canvas-soft transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Featured Posts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertBlockAt("post-grid", 0)}
                    className="px-3 py-1.5 bg-white border border-brand-hairline text-brand-body hover:text-brand-ink rounded-sm text-xs font-medium hover:bg-brand-canvas-soft transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Post Grid</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {footerBlockId && renderBlock(footerBlockId, true)}
        </div>
      </div>
    </div>
  );
}
