/**
 * Form field schema + submission validation.
 *
 * This module is the security boundary for the only unauthenticated write path in
 * the platform. `/api/forms/submit` accepts a payload from any visitor on the
 * internet; everything that reaches Strapi passes through `validateSubmission`
 * first, using the form's own stored definition as the authoritative contract for
 * what a submission may contain.
 *
 * The rule that matters most: this is an ALLOW-LIST. Output is built by walking the
 * definition's fields, never by walking the caller's payload — so a key the form
 * doesn't define cannot survive, no matter how it's spelled or nested.
 *
 * Kept dependency-free and pure so it can be exhaustively unit-tested without a
 * server, a database, or a network.
 *
 * NOTE: this file lives in `templates/theme-site`, which is copied into each
 * tenant's own deployed site repo. It must not import from the platform's `@/lib`.
 */

// ── Field schema ─────────────────────────────────────────────────────────────

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "url"
  | "select"
  | "radio"
  | "checkbox"
  | "consent"
  | "date"
  | "file"
  | "heading"
  | "divider";

export interface FormField {
  /** Stable identifier; also the key under which the value is stored. */
  id: string;
  type: FormFieldType;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  /** select | radio | checkbox */
  options?: string[];
  /** number */
  min?: number;
  max?: number;
  /** file */
  accept?: string;
  maxSize?: number;
}

/**
 * Field types that render but carry no value. They must never appear in a stored
 * submission, a CSV column, or a required-field check — a heading cannot be
 * "filled in", and treating one as required would make the form unsubmittable.
 */
export const PRESENTATIONAL_FIELD_TYPES: readonly FormFieldType[] = ["heading", "divider"];

export function isPresentationalField(type: FormFieldType): boolean {
  return PRESENTATIONAL_FIELD_TYPES.includes(type);
}

/** The subset of a definition that actually collects data. */
export function dataFields(fields: FormField[]): FormField[] {
  return fields.filter((f) => !isPresentationalField(f.type));
}

// ── Limits ───────────────────────────────────────────────────────────────────

/**
 * Ceilings applied regardless of what the definition says. A form author can make
 * a form smaller than these, never larger — they bound what an anonymous caller
 * can force the tenant's database to store.
 */
export const LIMITS = {
  /** Fields considered from one definition. */
  MAX_FIELDS: 200,
  /** Single-line text-ish values. */
  MAX_TEXT_LENGTH: 5_000,
  /** Long text. */
  MAX_TEXTAREA_LENGTH: 20_000,
  /** Selections in one checkbox group. */
  MAX_SELECTIONS: 100,
  /** Raw JSON body size accepted by the route. */
  MAX_PAYLOAD_BYTES: 256 * 1024,
} as const;

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  /** Sanitized, allow-listed values, keyed by field id. Only meaningful when ok. */
  data: Record<string, unknown>;
  errors: FieldError[];
}

// ── Coercion helpers ─────────────────────────────────────────────────────────

/**
 * Loose but real email check. Deliberately not RFC 5322 — an over-strict pattern
 * rejects valid addresses, which is a worse failure than accepting an odd one,
 * since nothing here is executed or interpolated.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Digits with common separators. Kept permissive for international formats. */
const PHONE_RE = /^[+()\d][\d\s().-]{4,}$/;

function asTrimmedString(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate a raw submission payload against a form definition.
 *
 * @param fields the form's stored field definitions
 * @param raw    untrusted payload, expected to be a flat object keyed by field id
 * @param opts.providedFileFields ids of file fields that arrived as real uploads,
 *   so a required file can be satisfied. File bytes are validated separately by
 *   `validateFile` — this function never sees them.
 */
export function validateSubmission(
  fields: FormField[],
  raw: unknown,
  opts?: { providedFileFields?: string[] }
): ValidationResult {
  const errors: FieldError[] = [];
  const data: Record<string, unknown> = {};

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, data: {}, errors: [{ field: "_", message: "Payload must be an object." }] };
  }

  const payload = raw as Record<string, unknown>;
  const providedFiles = new Set(opts?.providedFileFields ?? []);

  // Walk the DEFINITION, never the payload — this is what drops unknown keys.
  for (const field of dataFields(fields).slice(0, LIMITS.MAX_FIELDS)) {
    const value = payload[field.id];
    const required = field.required === true;

    if (field.type === "file") {
      // Bytes are handled by the route; only presence is decided here.
      if (required && !providedFiles.has(field.id)) {
        errors.push({ field: field.id, message: `${field.label} is required.` });
      }
      continue;
    }

    if (field.type === "consent") {
      const accepted = value === true || value === "true" || value === "on";
      // A consent box that isn't ticked is absence, not a false value worth storing.
      if (required && !accepted) {
        errors.push({ field: field.id, message: `${field.label} must be accepted.` });
      } else {
        data[field.id] = accepted;
      }
      continue;
    }

    if (isEmpty(value)) {
      if (required) errors.push({ field: field.id, message: `${field.label} is required.` });
      continue; // optional-and-empty stores nothing
    }

    switch (field.type) {
      case "text":
      case "phone":
      case "url":
      case "email":
      case "date": {
        const s = asTrimmedString(value);
        if (s === null) {
          errors.push({ field: field.id, message: `${field.label} must be text.` });
          break;
        }
        if (s.length > LIMITS.MAX_TEXT_LENGTH) {
          errors.push({ field: field.id, message: `${field.label} is too long.` });
          break;
        }
        if (field.type === "email" && !EMAIL_RE.test(s)) {
          errors.push({ field: field.id, message: `${field.label} must be a valid email address.` });
          break;
        }
        if (field.type === "phone" && !PHONE_RE.test(s)) {
          errors.push({ field: field.id, message: `${field.label} must be a valid phone number.` });
          break;
        }
        if (field.type === "url") {
          try {
            // Rejects javascript: and other non-web schemes along with junk.
            const parsed = new URL(s);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
              throw new Error("bad protocol");
            }
          } catch {
            errors.push({ field: field.id, message: `${field.label} must be a valid URL.` });
            break;
          }
        }
        if (field.type === "date" && Number.isNaN(Date.parse(s))) {
          errors.push({ field: field.id, message: `${field.label} must be a valid date.` });
          break;
        }
        data[field.id] = s;
        break;
      }

      case "textarea": {
        const s = asTrimmedString(value);
        if (s === null) {
          errors.push({ field: field.id, message: `${field.label} must be text.` });
          break;
        }
        if (s.length > LIMITS.MAX_TEXTAREA_LENGTH) {
          errors.push({ field: field.id, message: `${field.label} is too long.` });
          break;
        }
        data[field.id] = s;
        break;
      }

      case "number": {
        const n = typeof value === "number" ? value : Number(asTrimmedString(value));
        if (!Number.isFinite(n)) {
          errors.push({ field: field.id, message: `${field.label} must be a number.` });
          break;
        }
        if (typeof field.min === "number" && n < field.min) {
          errors.push({ field: field.id, message: `${field.label} must be at least ${field.min}.` });
          break;
        }
        if (typeof field.max === "number" && n > field.max) {
          errors.push({ field: field.id, message: `${field.label} must be at most ${field.max}.` });
          break;
        }
        data[field.id] = n;
        break;
      }

      case "select":
      case "radio": {
        const s = asTrimmedString(value);
        const options = field.options ?? [];
        if (s === null || !options.includes(s)) {
          errors.push({ field: field.id, message: `${field.label} must be one of the offered options.` });
          break;
        }
        data[field.id] = s;
        break;
      }

      case "checkbox": {
        const options = field.options ?? [];
        const raw = Array.isArray(value) ? value : [value];
        if (raw.length > LIMITS.MAX_SELECTIONS) {
          errors.push({ field: field.id, message: `${field.label} has too many selections.` });
          break;
        }
        const picked: string[] = [];
        let invalid = false;
        for (const item of raw) {
          const s = asTrimmedString(item);
          if (s === null || !options.includes(s)) {
            invalid = true;
            break;
          }
          if (!picked.includes(s)) picked.push(s); // dedupe
        }
        if (invalid) {
          errors.push({ field: field.id, message: `${field.label} must be one of the offered options.` });
          break;
        }
        if (required && picked.length === 0) {
          errors.push({ field: field.id, message: `${field.label} is required.` });
          break;
        }
        data[field.id] = picked;
        break;
      }

      default: {
        // An unrecognized type in a stored definition is a platform bug, not caller
        // input. Skip rather than guess at a coercion.
        break;
      }
    }
  }

  return { ok: errors.length === 0, data, errors };
}

// ── File validation ──────────────────────────────────────────────────────────

/**
 * Default accepted upload types. Mirrors the platform's authenticated upload route
 * (app/api/upload/route.ts) rather than inventing a second, divergent list.
 */
export const DEFAULT_ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
] as const;

/** Hard ceiling per file, regardless of the field's own maxSize. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export interface FileLike {
  name: string;
  size: number;
  type: string;
}

/**
 * Validate one uploaded file against its field definition and the hard ceilings.
 * Enforced before any byte reaches Strapi's media library.
 */
export function validateFile(field: FormField, file: FileLike): FieldError | null {
  const fieldMax =
    typeof field.maxSize === "number" && field.maxSize > 0
      ? Math.min(field.maxSize * 1024 * 1024, MAX_FILE_BYTES)
      : MAX_FILE_BYTES;

  if (file.size <= 0) {
    return { field: field.id, message: `${field.label}: file is empty.` };
  }
  if (file.size > fieldMax) {
    const mb = Math.floor(fieldMax / (1024 * 1024));
    return { field: field.id, message: `${field.label}: file must be under ${mb} MB.` };
  }
  if (!DEFAULT_ACCEPTED_MIME.includes(file.type as (typeof DEFAULT_ACCEPTED_MIME)[number])) {
    return { field: field.id, message: `${field.label}: file type is not allowed.` };
  }
  return null;
}
