import { ComponentDefinition } from "./types";
import * as heading from "./heading/schema";
import * as headingCanvas from "./heading/canvas";
import * as headingSidebar from "./heading/sidebar";
import * as headingCompiler from "./heading/compiler";

import * as text from "./text/schema";
import * as textCanvas from "./text/canvas";
import * as textSidebar from "./text/sidebar";
import * as textCompiler from "./text/compiler";

import * as button from "./button/schema";
import * as buttonCanvas from "./button/canvas";
import * as buttonSidebar from "./button/sidebar";
import * as buttonCompiler from "./button/compiler";

import * as section from "./section/schema";
import * as sectionCanvas from "./section/canvas";
import * as sectionSidebar from "./section/sidebar";
import * as sectionCompiler from "./section/compiler";

import * as container from "./container/schema";
import * as containerCanvas from "./container/canvas";
import * as containerSidebar from "./container/sidebar";
import * as containerCompiler from "./container/compiler";

import * as columns from "./columns/schema";
import * as columnsCanvas from "./columns/canvas";
import * as columnsSidebar from "./columns/sidebar";
import * as columnsCompiler from "./columns/compiler";

import * as divider from "./divider/schema";
import * as dividerCanvas from "./divider/canvas";
import * as dividerSidebar from "./divider/sidebar";
import * as dividerCompiler from "./divider/compiler";

import * as spacer from "./spacer/schema";
import * as spacerCanvas from "./spacer/canvas";
import * as spacerSidebar from "./spacer/sidebar";
import * as spacerCompiler from "./spacer/compiler";

import * as image from "./image/schema";
import * as imageCanvas from "./image/canvas";
import * as imageSidebar from "./image/sidebar";
import * as imageCompiler from "./image/compiler";

import * as hero from "./hero/schema";
import * as heroCanvas from "./hero/canvas";
import * as heroSidebar from "./hero/sidebar";
import * as heroCompiler from "./hero/compiler";

import * as newsletter from "./newsletter/schema";
import * as newsletterCanvas from "./newsletter/canvas";
import * as newsletterSidebar from "./newsletter/sidebar";
import * as newsletterCompiler from "./newsletter/compiler";

import * as featuredPosts from "./featured-posts/schema";
import * as featuredPostsCanvas from "./featured-posts/canvas";
import * as featuredPostsSidebar from "./featured-posts/sidebar";
import * as featuredPostsCompiler from "./featured-posts/compiler";

import * as authorProfile from "./author-profile/schema";
import * as authorProfileCanvas from "./author-profile/canvas";
import * as authorProfileSidebar from "./author-profile/sidebar";
import * as authorProfileCompiler from "./author-profile/compiler";

import * as tagArchive from "./tag-archive/schema";
import * as tagArchiveCanvas from "./tag-archive/canvas";
import * as tagArchiveSidebar from "./tag-archive/sidebar";
import * as tagArchiveCompiler from "./tag-archive/compiler";

import * as faq from "./faq/schema";
import * as faqCanvas from "./faq/canvas";
import * as faqSidebar from "./faq/sidebar";
import * as faqCompiler from "./faq/compiler";

import * as testimonials from "./testimonials/schema";
import * as testimonialsCanvas from "./testimonials/canvas";
import * as testimonialsSidebar from "./testimonials/sidebar";
import * as testimonialsCompiler from "./testimonials/compiler";

import * as gridGallery from "./grid-gallery/schema";
import * as gridGalleryCanvas from "./grid-gallery/canvas";
import * as gridGallerySidebar from "./grid-gallery/sidebar";
import * as gridGalleryCompiler from "./grid-gallery/compiler";

import * as videoPlayer from "./video-player/schema";
import * as videoPlayerCanvas from "./video-player/canvas";
import * as videoPlayerSidebar from "./video-player/sidebar";
import * as videoPlayerCompiler from "./video-player/compiler";

import * as postGrid from "./post-grid/schema";
import * as postGridCanvas from "./post-grid/canvas";
import * as postGridSidebar from "./post-grid/sidebar";
import * as postGridCompiler from "./post-grid/compiler";

import * as header from "./header/schema";
import * as headerCanvas from "./header/canvas";
import * as headerSidebar from "./header/sidebar";
import * as headerCompiler from "./header/compiler";

import * as footer from "./footer/schema";
import * as footerCanvas from "./footer/canvas";
import * as footerSidebar from "./footer/sidebar";
import * as footerCompiler from "./footer/compiler";

import * as postContent from "./post-content/schema";
import * as postContentCanvas from "./post-content/canvas";
import * as postContentSidebar from "./post-content/sidebar";
import * as postContentCompiler from "./post-content/compiler";

import * as pageDetail from "./page-detail/schema";
import * as pageDetailCanvas from "./page-detail/canvas";
import * as pageDetailSidebar from "./page-detail/sidebar";
import * as pageDetailCompiler from "./page-detail/compiler";

import * as errorView from "./error-view/schema";
import * as errorViewCanvas from "./error-view/canvas";
import * as errorViewSidebar from "./error-view/sidebar";
import * as errorViewCompiler from "./error-view/compiler";

import * as logoCloud from "./logo-cloud/schema";
import * as logoCloudCanvas from "./logo-cloud/canvas";
import * as logoCloudSidebar from "./logo-cloud/sidebar";
import * as logoCloudCompiler from "./logo-cloud/compiler";

import * as stats from "./stats/schema";
import * as statsCanvas from "./stats/canvas";
import * as statsSidebar from "./stats/sidebar";
import * as statsCompiler from "./stats/compiler";

import * as team from "./team/schema";
import * as teamCanvas from "./team/canvas";
import * as teamSidebar from "./team/sidebar";
import * as teamCompiler from "./team/compiler";

import * as share from "./share/schema";
import * as shareCanvas from "./share/canvas";
import * as shareSidebar from "./share/sidebar";
import * as shareCompiler from "./share/compiler";

import * as comments from "./comments/schema";
import * as commentsCanvas from "./comments/canvas";
import * as commentsSidebar from "./comments/sidebar";
import * as commentsCompiler from "./comments/compiler";

import * as relatedPosts from "./related-posts/schema";
import * as relatedPostsCanvas from "./related-posts/canvas";
import * as relatedPostsSidebar from "./related-posts/sidebar";
import * as relatedPostsCompiler from "./related-posts/compiler";

import * as postNavigation from "./post-navigation/schema";
import * as postNavigationCanvas from "./post-navigation/canvas";
import * as postNavigationSidebar from "./post-navigation/sidebar";
import * as postNavigationCompiler from "./post-navigation/compiler";

import * as tagHeader from "./tag-header/schema";
import * as tagHeaderCanvas from "./tag-header/canvas";
import * as tagHeaderSidebar from "./tag-header/sidebar";
import * as tagHeaderCompiler from "./tag-header/compiler";

import * as cards from "./cards/schema";
import * as cardsCanvas from "./cards/canvas";
import * as cardsSidebar from "./cards/sidebar";
import * as cardsCompiler from "./cards/compiler";

import * as imageHotspots from "./image-hotspots/schema";
import * as imageHotspotsCanvas from "./image-hotspots/canvas";
import * as imageHotspotsSidebar from "./image-hotspots/sidebar";
import * as imageHotspotsCompiler from "./image-hotspots/compiler";

export const componentRegistry: Record<string, ComponentDefinition> = {
  heading: { type: "heading", ...heading, ...headingCanvas, ...headingSidebar, ...headingCompiler },
  text: { type: "text", ...text, ...textCanvas, ...textSidebar, ...textCompiler },
  button: { type: "button", ...button, ...buttonCanvas, ...buttonSidebar, ...buttonCompiler },
  section: { type: "section", ...section, ...sectionCanvas, ...sectionSidebar, ...sectionCompiler },
  container: { type: "container", ...container, ...containerCanvas, ...containerSidebar, ...containerCompiler },
  columns: { type: "columns", ...columns, ...columnsCanvas, ...columnsSidebar, ...columnsCompiler },
  divider: { type: "divider", ...divider, ...dividerCanvas, ...dividerSidebar, ...dividerCompiler },
  spacer: { type: "spacer", ...spacer, ...spacerCanvas, ...spacerSidebar, ...spacerCompiler },
  image: { type: "image", ...image, ...imageCanvas, ...imageSidebar, ...imageCompiler },
  hero: { type: "hero", ...hero, ...heroCanvas, ...heroSidebar, ...heroCompiler },
  newsletter: { type: "newsletter", ...newsletter, ...newsletterCanvas, ...newsletterSidebar, ...newsletterCompiler },
  "featured-posts": { type: "featured-posts", ...featuredPosts, ...featuredPostsCanvas, ...featuredPostsSidebar, ...featuredPostsCompiler },
  "author-profile": { type: "author-profile", ...authorProfile, ...authorProfileCanvas, ...authorProfileSidebar, ...authorProfileCompiler },
  "tag-archive": { type: "tag-archive", ...tagArchive, ...tagArchiveCanvas, ...tagArchiveSidebar, ...tagArchiveCompiler },
  "tag-header": { type: "tag-header", ...tagHeader, ...tagHeaderCanvas, ...tagHeaderSidebar, ...tagHeaderCompiler },
  faq: { type: "faq", ...faq, ...faqCanvas, ...faqSidebar, ...faqCompiler },
  testimonials: { type: "testimonials", ...testimonials, ...testimonialsCanvas, ...testimonialsSidebar, ...testimonialsCompiler },
  "grid-gallery": { type: "grid-gallery", ...gridGallery, ...gridGalleryCanvas, ...gridGallerySidebar, ...gridGalleryCompiler },
  "video-player": { type: "video-player", ...videoPlayer, ...videoPlayerCanvas, ...videoPlayerSidebar, ...videoPlayerCompiler },
  "post-grid": { type: "post-grid", ...postGrid, ...postGridCanvas, ...postGridSidebar, ...postGridCompiler },
  header: { type: "header", ...header, ...headerCanvas, ...headerSidebar, ...headerCompiler },
  footer: { type: "footer", ...footer, ...footerCanvas, ...footerSidebar, ...footerCompiler },
  "post-content": { type: "post-content", ...postContent, ...postContentCanvas, ...postContentSidebar, ...postContentCompiler },
  "page-detail": { type: "page-detail", ...pageDetail, ...pageDetailCanvas, ...pageDetailSidebar, ...pageDetailCompiler },
  "error-view": { type: "error-view", ...errorView, ...errorViewCanvas, ...errorViewSidebar, ...errorViewCompiler },
  "logo-cloud": { type: "logo-cloud", ...logoCloud, ...logoCloudCanvas, ...logoCloudSidebar, ...logoCloudCompiler },
  stats: { type: "stats", ...stats, ...statsCanvas, ...statsSidebar, ...statsCompiler },
  team: { type: "team", ...team, ...teamCanvas, ...teamSidebar, ...teamCompiler },
  share: { type: "share", ...share, ...shareCanvas, ...shareSidebar, ...shareCompiler },
  comments: { type: "comments", ...comments, ...commentsCanvas, ...commentsSidebar, ...commentsCompiler },
  "related-posts": { type: "related-posts", ...relatedPosts, ...relatedPostsCanvas, ...relatedPostsSidebar, ...relatedPostsCompiler },
  "post-navigation": { type: "post-navigation", ...postNavigation, ...postNavigationCanvas, ...postNavigationSidebar, ...postNavigationCompiler },
  cards: { type: "cards", ...cards, ...cardsCanvas, ...cardsSidebar, ...cardsCompiler },
  "image-hotspots": { type: "image-hotspots", ...imageHotspots, ...imageHotspotsCanvas, ...imageHotspotsSidebar, ...imageHotspotsCompiler },
};
