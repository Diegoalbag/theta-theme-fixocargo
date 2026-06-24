import * as React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { WhatsApp } from "@/components/icons/social/whatsapp";
import { TikTok } from "@/components/icons/social/tiktok";

// Shared global block (FND-07): a single social network link rendered as its
// icon on a real <a>. Uses Lucide icons for Facebook, Instagram, LinkedIn,
// X/Twitter, YouTube; custom SVGs for WhatsApp and TikTok (not in Lucide).
// Icon color is brand-yellow per design.
export interface SocialLinkProps {
  network?: string;
  url?: string;
  blockId?: string;
  blockType?: string;
}

const iconMap: Record<string, React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
  youtube: Youtube,
  whatsapp: WhatsApp,
  tiktok: TikTok,
};

export const SocialLink = ({
  network = "facebook",
  url = "#",
}: SocialLinkProps) => {
  const Icon = iconMap[network] ?? null;

  if (!Icon) {
    return (
      <span
        className="inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-xs text-white"
        aria-hidden="true"
      >
        ?
      </span>
    );
  }

  return (
    <a
      href={url}
      aria-label={network}
      className="text-brand-yellow hover:opacity-80 inline-flex items-center transition-opacity"
    >
      <Icon aria-hidden={true} className="size-5" />
    </a>
  );
};

export const socialLinkSettingsSchema = [
  {
    id: "network",
    label: "Red social",
    type: "select",
    default: "facebook",
    options: [
      { value: "facebook", label: "Facebook" },
      { value: "instagram", label: "Instagram" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "tiktok", label: "TikTok" },
      { value: "youtube", label: "YouTube" },
      { value: "x", label: "X (Twitter)" },
      { value: "linkedin", label: "LinkedIn" },
    ],
  },
  {
    id: "url",
    label: "Enlace",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
