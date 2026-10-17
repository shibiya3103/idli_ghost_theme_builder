import React from "react";
import {
  Heading,
  Type,
  Square,
  Columns as ColumnsIcon,
  Sparkles,
  Mail,
  Grid,
  Image as ImageIcon,
  Minus,
  Move,
  User,
  Tag,
  HelpCircle,
  MessageSquare,
  Image as GalleryIcon,
  Share2,
  Play,
  Cloud,
  BarChart,
  Users,
  MessageCircle,
  FileText,
  ArrowLeftRight,
  SplitSquareVertical,
  Layers,
} from "lucide-react";

export interface BlockTemplate {
  type: string;
  label: string;
  category: "Layout" | "Content" | "Ghost Core";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  { type: "section", label: "Section", category: "Layout", icon: Square, description: "Full-width section container with custom spacing" },
  { type: "container", label: "Container", category: "Layout", icon: Square, description: "Box container for grouping content" },
  { type: "columns", label: "Columns Row", category: "Layout", icon: ColumnsIcon, description: "Multi-column responsive flex grid" },
  { type: "divider", label: "Divider Line", category: "Layout", icon: Minus, description: "1px hairline separator" },
  { type: "spacer", label: "Spacer Block", category: "Layout", icon: Move, description: "Adjustable vertical empty spacing" },

  { type: "heading", label: "Heading", category: "Content", icon: Heading, description: "Display heading (H1 - H6)" },
  { type: "text", label: "Text Block", category: "Content", icon: Type, description: "Rich paragraph text" },
  { type: "button", label: "Button", category: "Content", icon: Square, description: "Clickable action button or link" },
  { type: "image", label: "Image Block", category: "Content", icon: ImageIcon, description: "Responsive image with aspect ratio" },
  { type: "hero", label: "Hero Component", category: "Content", icon: Sparkles, description: "Hero showcase with heading and CTA" },
  { type: "newsletter", label: "Newsletter", category: "Content", icon: Mail, description: "Ghost member subscription signup box" },
  { type: "team", label: "Team", category: "Content", icon: Users, description: "Team member cards grid" },
  { type: "faq", label: "FAQ", category: "Content", icon: HelpCircle, description: "Collapsible accordion questions and answers" },
  { type: "logo-cloud", label: "Logo Cloud", category: "Content", icon: Cloud, description: "Sponsors or partner brand logos" },
  { type: "stats", label: "Stats", category: "Content", icon: BarChart, description: "Key metrics and statistics counters" },
  { type: "testimonials", label: "Testimonials", category: "Content", icon: MessageSquare, description: "Customer quotes and reviews" },
  { type: "grid-gallery", label: "Grid Gallery", category: "Content", icon: GalleryIcon, description: "Multi-image photo grid gallery" },
  { type: "video-player", label: "Video Player", category: "Content", icon: Play, description: "Embedded responsive video player" },
  { type: "cards", label: "Cards Grid", category: "Content", icon: Layers, description: "Multi-column feature and showcase cards" },
  { type: "before-after-slider", label: "Before & After", category: "Content", icon: SplitSquareVertical, description: "Interactive image comparison slider" },

  { type: "page-detail", label: "Page Detail", category: "Ghost Core", icon: FileText, description: "Dynamic page title and content wrapper" },
  { type: "post-content", label: "Post Content", category: "Ghost Core", icon: FileText, description: "Full Ghost blog post body markup" },
  { type: "post-grid", label: "Post Grid", category: "Ghost Core", icon: ColumnsIcon, description: "Fluid grid of Ghost article cards" },
  { type: "featured-posts", label: "Featured Posts", category: "Ghost Core", icon: Grid, description: "Highlight reel of featured articles" },
  { type: "related-posts", label: "Related Posts", category: "Ghost Core", icon: Grid, description: "Recommended posts based on primary tag" },
  { type: "comments", label: "Comments", category: "Ghost Core", icon: MessageCircle, description: "Native Ghost member comments section" },
  { type: "post-navigation", label: "Post Navigation", category: "Ghost Core", icon: ArrowLeftRight, description: "Previous and Next post links" },
  { type: "author-profile", label: "Author Profile", category: "Ghost Core", icon: User, description: "Author bio, avatar, and social links" },
  { type: "tag-header", label: "Tag Header", category: "Ghost Core", icon: Tag, description: "Tag page archive hero header" },
  { type: "tag-archive", label: "Tag Archive", category: "Ghost Core", icon: Tag, description: "Browse all publication tags" },
  { type: "share", label: "Post / Page Share", category: "Ghost Core", icon: Share2, description: "Social share buttons for articles" },
];

export const BLOCK_TEMPLATES_BY_TYPE: Record<string, BlockTemplate> = BLOCK_TEMPLATES.reduce(
  (acc, item) => {
    acc[item.type] = item;
    return acc;
  },
  {} as Record<string, BlockTemplate>
);

export function getBlockTemplate(type: string): BlockTemplate | undefined {
  return BLOCK_TEMPLATES_BY_TYPE[type];
}
