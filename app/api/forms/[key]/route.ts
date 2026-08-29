import { NextResponse } from "next/server";
import { gql } from "graphql-request";
import { strapiClient } from "@/lib/strapi-client";
import { type FormField } from "@/lib/form-schema";

/**
 * GET /api/forms/:key — public read of a form's definition.
 *
 * The theme's form section fetches this from its own origin, which is what keeps
 * the theme bundle free of any token or base-URL knowledge and avoids adding a new
 * global to the platform's theme externals list. The platform serves the same route
 * shape so the identical bundle works inside the customizer preview.
 *
 * Read-only and intentionally narrow: it returns the fields and the presentation
 * settings a visitor's browser needs to render the form, and nothing else. No
 * submissions, no internal ids, no Strapi metadata — a form definition is already
 * public in effect (its inputs are visible to anyone who loads the page), but that
 * is only true of the definition.
 */

export const dynamic = "force-dynamic";

const getFormByKeyQuery = gql`
  query GetFormByKey($key: String!) {
    forms(filters: { key: { eq: $key } }) {
      name
      key
      fields
      settings
    }
  }
`;

interface StrapiFormRow {
  name: string;
  key: string;
  fields: FormField[] | null;
  settings: { submit?: string; success?: string; redirect?: string } | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  if (!key) {
    return NextResponse.json({ error: "Missing form key" }, { status: 400 });
  }

  try {
    const res = await strapiClient.request<{ forms: StrapiFormRow[] }>(getFormByKeyQuery, {
      key,
    });
    const form = res.forms?.[0];

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        name: form.name,
        key: form.key,
        fields: Array.isArray(form.fields) ? form.fields : [],
        settings: form.settings ?? {},
      },
      {
        // Short cache: a form's shape changes rarely, but an editor who just
        // republished shouldn't have to wait minutes to see it on the site.
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" },
      }
    );
  } catch (err) {
    console.error("[forms] failed to load form definition:", err);
    return NextResponse.json({ error: "Could not load this form" }, { status: 502 });
  }
}
