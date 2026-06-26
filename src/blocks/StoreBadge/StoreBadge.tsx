import { storeIcons } from "@/components/icons";

// Shared global block (FND-07): an app-store download badge rendered as its
// official inline-SVG mark on a real <a>. The platform injects `blockId` and
// `blockType` alongside the schema settings.
export interface StoreBadgeProps {
  store?: string;
  url?: string;
  blockId?: string;
  blockType?: string;
}

export const StoreBadge = ({
  store = "app-store",
  url = "#",
}: StoreBadgeProps) => {
  // Resolve the badge by the curated enum value. Unknown enums resolve to
  // undefined -> render a neutral placeholder, never crash (defensive contract).
  const Badge = storeIcons[store] ?? null;

  if (!Badge) {
    return (
      <span
        className="bg-muted text-muted-foreground inline-flex h-12 w-auto items-center justify-center rounded-md text-xs"
        aria-hidden="true"
      >
        ?
      </span>
    );
  }

  // The badge IS the link target; the accessible name lives on the <a> (FND-06).
  return (
    <a
      href={url}
      aria-label={store}
      className="text-brand-navy inline-flex items-center"
    >
      <Badge className="h-12 w-auto" />
    </a>
  );
};

export const storeBadgeSettingsSchema = [
  {
    id: "store",
    label: "Tienda",
    type: "select",
    default: "app-store",
    options: [
      { value: "app-store", label: "App Store" },
      { value: "google-play", label: "Google Play" },
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
