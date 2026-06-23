import { socialIcons } from "@/components/icons";

// Shared global block (FND-07): a single social network link rendered as its
// curated inline-SVG brand mark on a real <a>. The platform injects `blockId`
// and `blockType` alongside the schema settings.
export interface SocialLinkProps {
  network?: string;
  url?: string;
  blockId?: string;
  blockType?: string;
}

export const SocialLink = ({
  network = "facebook",
  url = "#",
}: SocialLinkProps) => {
  // Resolve the brand mark by the curated enum value. Unknown enums resolve to
  // undefined -> render a neutral placeholder, never crash (defensive contract).
  const Icon = socialIcons[network] ?? null;

  if (!Icon) {
    return (
      <span
        className="bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-full text-xs"
        aria-hidden="true"
      >
        ?
      </span>
    );
  }

  // The <a> carries the accessible name; the icon is decorative (FND-06).
  return (
    <a
      href={url}
      aria-label={network}
      className="text-brand-navy hover:text-brand-yellow inline-flex items-center transition-colors"
    >
      <Icon aria-hidden="true" className="size-6" />
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
