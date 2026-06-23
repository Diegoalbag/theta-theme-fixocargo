// ---------------------------------------------------------------------------
// Example of a `metaobject_ref` block — a block whose data comes from a Strapi
// metaobject entry rather than from inline settings.
//
// IMPORTANT defensive contract: the referenced value arrives in TWO shapes:
//   - In the customizer: a raw documentId STRING (not yet resolved), or `{}`
//     / `{ __missing: true }` for a freshly quick-created or broken reference.
//   - On the published site: the fully RESOLVED data object.
// Always render a graceful placeholder for the string / missing / empty cases
// so the preview never crashes or shows a blank card.
//
// The `metaobjectType` in the schema below MUST match the metaobject definition
// key configured in Strapi for this tenant.
// ---------------------------------------------------------------------------

export interface ExampleRefData {
  title?: string;
  subtitle?: string;
  image?: { id?: number; url?: string };
  // Marker the platform stamps when a referenced entry can't be resolved.
  __missing?: boolean;
}

export interface ExampleRefBlockProps {
  // Resolved object on the published site; raw documentId string in the customizer.
  entry?: ExampleRefData | string;
  blockId?: string;
  blockType?: string;
}

// True when the resolved object carries no meaningful display fields, so the
// real-render branch would produce a blank card. `{}` and `{ __missing: true }`
// are truthy objects, so they slip past the falsy/string guard — treat them as
// placeholder data.
const hasNoDisplayFields = (d: ExampleRefData): boolean =>
  !d.title && !d.subtitle && !d.image;

export const ExampleRefBlock = ({ entry }: ExampleRefBlockProps) => {
  if (
    !entry ||
    typeof entry === "string" ||
    entry.__missing ||
    hasNoDisplayFields(entry)
  ) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="bg-muted h-20 w-20 rounded-full" />
        <p className="text-muted-foreground text-sm italic">Linked entry preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
      {entry.image?.url && (
        <img
          src={entry.image.url}
          alt={entry.title}
          className="h-20 w-20 rounded-full object-cover"
        />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-card-foreground font-semibold">{entry.title}</p>
        {entry.subtitle && (
          <p className="text-muted-foreground text-sm">{entry.subtitle}</p>
        )}
      </div>
    </div>
  );
};

export const exampleRefBlockSettingsSchema = [
  {
    id: "entry",
    label: "Linked entry",
    type: "metaobject_ref",
    // Must match the metaobject definition key in Strapi.
    metaobjectType: "example_entry",
  },
];
