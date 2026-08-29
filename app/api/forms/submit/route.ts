import { NextRequest, NextResponse } from "next/server";
import { gql } from "graphql-request";
import { strapiClient, STRAPI_BASE_URL } from "@/lib/strapi-client";
import {
  validateSubmission,
  validateFile,
  dataFields,
  LIMITS,
  type FormField,
} from "@/lib/form-schema";

/**
 * POST /api/forms/submit — public form submission ingest.
 *
 * This is the ONLY unauthenticated write path on a tenant site, so the shape of it
 * matters more than its size:
 *
 *   • It runs SERVER-SIDE, on the tenant's own origin. The browser never holds a
 *     write credential; STRAPI_FORM_TOKEN is a server-only env var (no
 *     NEXT_PUBLIC_ prefix, which is exactly what would inline it into the bundle).
 *   • The token it writes with is create-only — scoped to form-submission.create
 *     and upload, nothing else. Even if it leaked it could not read, update, or
 *     delete anything.
 *   • Every value is validated against the form's OWN stored definition before it
 *     reaches Strapi. The definition is fetched with the read-only token this site
 *     already has, so the ingest token needs no read grant.
 *
 * Rate limiting is deliberately NOT implemented here. The obvious approach — an
 * in-memory counter — is per function instance on serverless and barely binds
 * under concurrency. Abuse control belongs at the platform edge (Vercel BotID +
 * WAF rate rules), which runs before this function is invoked at all. The honeypot
 * below is a cheap spam filter, not a security control.
 */

// Never prerender or cache — this is a write path.
export const dynamic = "force-dynamic";

const FORM_INGEST_TOKEN = process.env.STRAPI_FORM_TOKEN || "";

/** Root queries are camelCase; fields on types are snake_case (Strapi v5 + GraphQL plugin). */
const getFormByKeyQuery = gql`
  query GetFormByKey($key: String!) {
    forms(filters: { key: { eq: $key } }) {
      documentId
      name
      key
      fields
      settings
    }
  }
`;

interface StrapiForm {
  documentId: string;
  name: string;
  key: string;
  fields: FormField[] | null;
  settings: Record<string, unknown> | null;
}

/** Generic failure body — never leaks whether a form exists, or why parsing failed. */
function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ ok: false, error: message, errors }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (!FORM_INGEST_TOKEN) {
    // A tenant whose Strapi hasn't yet minted its ingest token. Degrade with a
    // clear server-side signal rather than writing with some other credential.
    console.error("[forms] STRAPI_FORM_TOKEN is not configured — refusing submission");
    return NextResponse.json(
      { ok: false, error: "Form submissions are not configured for this site." },
      { status: 503 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let formKey = "";
  let values: Record<string, unknown> = {};
  let honeypot = "";
  const uploads: Array<{ fieldId: string; file: File }> = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const body = await request.formData();
      formKey = String(body.get("formKey") ?? "");
      honeypot = String(body.get("_hp") ?? "");

      const rawValues = body.get("values");
      if (typeof rawValues === "string") {
        if (rawValues.length > LIMITS.MAX_PAYLOAD_BYTES) {
          return badRequest("Submission is too large.");
        }
        values = JSON.parse(rawValues);
      }

      for (const [key, value] of body.entries()) {
        if (value instanceof File && key.startsWith("file:")) {
          uploads.push({ fieldId: key.slice("file:".length), file: value });
        }
      }
    } else {
      const raw = await request.text();
      if (raw.length > LIMITS.MAX_PAYLOAD_BYTES) {
        return badRequest("Submission is too large.");
      }
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      formKey = String(parsed.formKey ?? "");
      honeypot = String(parsed._hp ?? "");
      values = (parsed.values as Record<string, unknown>) ?? {};
    }
  } catch {
    return badRequest("Malformed submission.");
  }

  // Honeypot: a field hidden from humans. Answer 200 so a bot can't distinguish a
  // rejection from a success and start probing.
  if (honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!formKey) return badRequest("Missing form key.");

  // ── Load the definition (read-only token) ─────────────────────────────────
  let form: StrapiForm | undefined;
  try {
    const res = await strapiClient.request<{ forms: StrapiForm[] }>(getFormByKeyQuery, {
      key: formKey,
    });
    form = res.forms?.[0];
  } catch (err) {
    console.error("[forms] failed to load form definition:", err);
    return NextResponse.json(
      { ok: false, error: "Could not process this submission." },
      { status: 502 }
    );
  }

  if (!form) return badRequest("Unknown form.");

  const fields = Array.isArray(form.fields) ? form.fields : [];
  const byId = new Map(dataFields(fields).map((f) => [f.id, f]));

  // ── Validate files before anything is uploaded ────────────────────────────
  const fileErrors: Array<{ field: string; message: string }> = [];
  const acceptedUploads: Array<{ fieldId: string; file: File }> = [];
  for (const { fieldId, file } of uploads) {
    const field = byId.get(fieldId);
    // An upload for a field the form doesn't declare (or isn't a file field) is
    // dropped outright — same allow-list rule as scalar values.
    if (!field || field.type !== "file") continue;
    const err = validateFile(field, { name: file.name, size: file.size, type: file.type });
    if (err) fileErrors.push(err);
    else acceptedUploads.push({ fieldId, file });
  }

  // ── Validate values against the definition ────────────────────────────────
  const result = validateSubmission(fields, values, {
    providedFileFields: acceptedUploads.map((u) => u.fieldId),
  });

  const allErrors = [...result.errors, ...fileErrors];
  if (allErrors.length > 0) {
    return NextResponse.json({ ok: false, errors: allErrors }, { status: 422 });
  }

  // ── Upload accepted files (create-only token) ─────────────────────────────
  const attachmentIds: number[] = [];
  for (const { fieldId, file } of acceptedUploads) {
    try {
      const fd = new FormData();
      fd.append("files", file, file.name);
      const uploadRes = await fetch(`${STRAPI_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${FORM_INGEST_TOKEN}` },
        body: fd,
      });
      if (!uploadRes.ok) {
        console.error("[forms] upload failed:", uploadRes.status, await uploadRes.text());
        return NextResponse.json(
          { ok: false, error: "Could not store the attached file." },
          { status: 502 }
        );
      }
      const uploaded = (await uploadRes.json()) as Array<{ id: number; url: string; name: string }>;
      for (const u of uploaded) {
        attachmentIds.push(u.id);
        // Record the reference under the field id so the dashboard can render it.
        const existing = result.data[fieldId];
        result.data[fieldId] = Array.isArray(existing)
          ? [...existing, { id: u.id, name: u.name, url: u.url }]
          : [{ id: u.id, name: u.name, url: u.url }];
      }
    } catch (err) {
      console.error("[forms] upload error:", err);
      return NextResponse.json(
        { ok: false, error: "Could not store the attached file." },
        { status: 502 }
      );
    }
  }

  // ── Write the submission (create-only token) ──────────────────────────────
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/form-submissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FORM_INGEST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          form: form.documentId,
          data: result.data,
          submittedAt: new Date().toISOString(),
          isRead: false,
          ...(attachmentIds.length > 0 ? { attachments: attachmentIds } : {}),
          meta: {
            // Coarse provenance only — no IP address, which would make every
            // submission a personal-data record with no clear retention story.
            userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
            referrer: request.headers.get("referer")?.slice(0, 512) ?? null,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error("[forms] submission write failed:", res.status, await res.text());
      return NextResponse.json(
        { ok: false, error: "Could not process this submission." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[forms] submission write error:", err);
    return NextResponse.json(
      { ok: false, error: "Could not process this submission." },
      { status: 502 }
    );
  }

  const settings = form.settings ?? {};
  return NextResponse.json({
    ok: true,
    success: typeof settings.success === "string" ? settings.success : null,
    redirect: typeof settings.redirect === "string" && settings.redirect ? settings.redirect : null,
  });
}
