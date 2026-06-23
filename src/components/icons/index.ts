import type React from "react";
import { Facebook } from "./social/facebook";
import { Instagram } from "./social/instagram";
import { WhatsApp } from "./social/whatsapp";
import { TikTok } from "./social/tiktok";
import { YouTube } from "./social/youtube";
import { X } from "./social/x";
import { LinkedIn } from "./social/linkedin";
import { AppStore } from "./stores/app-store";
import { GooglePlay } from "./stores/google-play";

// Inline-SVG brand-mark resolver maps. Keys match the curated `select` enum
// values in the social-link / store-badge schemas EXACTLY, so a block resolves
// its mark by looking up its enum value. Unknown keys resolve to `undefined` —
// the consuming block renders a defensive placeholder (never a crash).

export const socialIcons: Record<string, React.FC<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: WhatsApp,
  tiktok: TikTok,
  youtube: YouTube,
  x: X,
  linkedin: LinkedIn,
};

export const storeIcons: Record<string, React.FC<{ className?: string }>> = {
  "app-store": AppStore,
  "google-play": GooglePlay,
};
