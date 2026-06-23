import type React from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight } from "lucide-react";

// All settings declared in `heroSettingsSchema` arrive as props (keyed by the
// setting `id`). The platform also injects `sectionId`, `sectionName`, and —
// because this section accepts blocks — `renderBlocks`.
export interface HeroProps {
  title?: string;
  description?: string;
  renderBlocks?: () => React.ReactNode;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  heroImage?: {
    url?: string | null;
    id?: number | string | null;
  };
  textAlignment?: "left" | "center" | "right";
}

const alignmentClasses: Record<NonNullable<HeroProps["textAlignment"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Hero = ({
  title,
  description,
  renderBlocks,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  heroImage,
  textAlignment = "left",
}: HeroProps) => {
  return (
    <section className="bg-secondary section-padding-y" aria-labelledby="hero-heading">
      <div className="container-padding-x container mx-auto flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Left column — copy + CTAs */}
        <div className={`flex flex-1 flex-col gap-6 lg:gap-8 ${alignmentClasses[textAlignment]}`}>
          <div className="section-title-gap-xl flex flex-col">
            <h1 id="hero-heading" className="heading-xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg">{description}</p>
          </div>

          {/* Child blocks (e.g. Feature) render here when present */}
          {renderBlocks && (
            <div className="flex flex-col gap-2 md:gap-3">{renderBlocks()}</div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            {primaryCtaLabel && (
              <Button asChild>
                <a href={primaryCtaUrl || "#"}>{primaryCtaLabel}</a>
              </Button>
            )}
            {secondaryCtaLabel && (
              <Button variant="ghost" asChild>
                <a href={secondaryCtaUrl || "#"}>
                  {secondaryCtaLabel}
                  <ArrowRight />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Right column — image, or a neutral placeholder when none is set */}
        <div className="w-full flex-1">
          <AspectRatio ratio={1 / 1}>
            {heroImage?.url ? (
              <img
                src={heroImage.url}
                alt="Hero visual"
                className="absolute inset-0 h-full w-full rounded-xl object-cover"
              />
            ) : (
              <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center rounded-xl text-sm">
                Add a hero image
              </div>
            )}
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export const heroSettingsSchema = [
  {
    id: "title",
    label: "Heading",
    type: "text",
    default: "Your headline goes here",
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    default: "A short, compelling subheading that explains what this theme is about.",
  },
  {
    id: "primaryCtaLabel",
    label: "Primary button label",
    type: "text",
    default: "Get started",
  },
  {
    id: "primaryCtaUrl",
    label: "Primary button URL",
    type: "url",
    default: "#",
    placeholder: "https://example.com",
  },
  {
    id: "secondaryCtaLabel",
    label: "Secondary button label",
    type: "text",
    default: "Learn more",
  },
  {
    id: "secondaryCtaUrl",
    label: "Secondary button URL",
    type: "url",
    default: "#",
    placeholder: "https://example.com",
  },
  {
    id: "heroImage",
    label: "Hero image",
    type: "image_picker",
    default: { id: null, url: null },
    info: "Upload or select an image for the hero section",
  },
  {
    id: "textAlignment",
    label: "Text alignment",
    type: "text_alignment",
    default: "left",
  },
];
