import { describe, expect, it } from "vitest";
import {
  validateSubmission,
  validateFile,
  dataFields,
  isPresentationalField,
  LIMITS,
  MAX_FILE_BYTES,
  type FormField,
} from "../form-schema";

/**
 * `/api/forms/submit` is the only unauthenticated write path in the platform, and
 * validateSubmission is what stands between an anonymous caller and the tenant's
 * database. These tests are the gate on that boundary — particularly the
 * allow-list behavior, which is what stops arbitrary keys being written.
 */

const field = (over: Partial<FormField> & Pick<FormField, "id" | "type">): FormField => ({
  label: over.label ?? over.id,
  ...over,
});

describe("presentational fields", () => {
  it("classifies heading and divider as presentational", () => {
    expect(isPresentationalField("heading")).toBe(true);
    expect(isPresentationalField("divider")).toBe(true);
    expect(isPresentationalField("text")).toBe(false);
  });

  it("excludes them from the data fields of a definition", () => {
    const fields = [
      field({ id: "h", type: "heading" }),
      field({ id: "name", type: "text" }),
      field({ id: "d", type: "divider" }),
    ];
    expect(dataFields(fields).map((f) => f.id)).toEqual(["name"]);
  });

  it("never stores a value for them, even when the payload supplies one", () => {
    const fields = [field({ id: "h", type: "heading" }), field({ id: "name", type: "text" })];
    const r = validateSubmission(fields, { h: "injected", name: "Ada" });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ name: "Ada" });
  });

  it("does not make a required heading block submission", () => {
    // A heading can't be "filled in" — treating it as required would make the
    // form permanently unsubmittable.
    const fields = [field({ id: "h", type: "heading", required: true })];
    expect(validateSubmission(fields, {}).ok).toBe(true);
  });
});

describe("allow-list behavior", () => {
  it("drops keys the definition does not declare", () => {
    const fields = [field({ id: "name", type: "text" })];
    const r = validateSubmission(fields, {
      name: "Ada",
      is_admin: true,
      isRead: true,
      __proto__: { polluted: true },
      form: "another-form",
    });
    expect(r.ok).toBe(true);
    expect(Object.keys(r.data)).toEqual(["name"]);
  });

  it("cannot be polluted via a __proto__ key in the payload", () => {
    const fields = [field({ id: "name", type: "text" })];
    const r = validateSubmission(fields, JSON.parse('{"name":"Ada","__proto__":{"x":1}}'));
    expect(r.ok).toBe(true);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it("rejects a non-object payload", () => {
    const fields = [field({ id: "name", type: "text" })];
    expect(validateSubmission(fields, "nope").ok).toBe(false);
    expect(validateSubmission(fields, ["a"]).ok).toBe(false);
    expect(validateSubmission(fields, null).ok).toBe(false);
  });

  it("caps how many fields of one definition are considered", () => {
    const many = Array.from({ length: LIMITS.MAX_FIELDS + 25 }, (_, i) =>
      field({ id: `f${i}`, type: "text" })
    );
    const payload = Object.fromEntries(many.map((f) => [f.id, "x"]));
    const r = validateSubmission(many, payload);
    expect(Object.keys(r.data).length).toBe(LIMITS.MAX_FIELDS);
  });
});

describe("required enforcement", () => {
  it("rejects a missing required field", () => {
    const fields = [field({ id: "name", type: "text", required: true })];
    const r = validateSubmission(fields, {});
    expect(r.ok).toBe(false);
    expect(r.errors[0].field).toBe("name");
  });

  it("treats whitespace-only as empty", () => {
    const fields = [field({ id: "name", type: "text", required: true })];
    expect(validateSubmission(fields, { name: "   " }).ok).toBe(false);
  });

  it("stores nothing for an optional empty field", () => {
    const fields = [field({ id: "name", type: "text" })];
    const r = validateSubmission(fields, { name: "" });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({});
  });
});

describe("text and length caps", () => {
  it("trims stored values", () => {
    const fields = [field({ id: "name", type: "text" })];
    expect(validateSubmission(fields, { name: "  Ada  " }).data.name).toBe("Ada");
  });

  it("rejects text past the single-line cap", () => {
    const fields = [field({ id: "name", type: "text" })];
    const r = validateSubmission(fields, { name: "x".repeat(LIMITS.MAX_TEXT_LENGTH + 1) });
    expect(r.ok).toBe(false);
  });

  it("allows a longer value in a textarea than a text field", () => {
    const long = "x".repeat(LIMITS.MAX_TEXT_LENGTH + 100);
    expect(validateSubmission([field({ id: "m", type: "textarea" })], { m: long }).ok).toBe(true);
    expect(validateSubmission([field({ id: "m", type: "text" })], { m: long }).ok).toBe(false);
  });

  it("rejects textarea past its own cap", () => {
    const fields = [field({ id: "m", type: "textarea" })];
    const r = validateSubmission(fields, { m: "x".repeat(LIMITS.MAX_TEXTAREA_LENGTH + 1) });
    expect(r.ok).toBe(false);
  });

  it("rejects an object where text is expected", () => {
    const fields = [field({ id: "name", type: "text" })];
    expect(validateSubmission(fields, { name: { nested: "value" } }).ok).toBe(false);
  });
});

describe("email, phone, url, date", () => {
  it("accepts a valid email and rejects junk", () => {
    const fields = [field({ id: "e", type: "email" })];
    expect(validateSubmission(fields, { e: "ada@example.com" }).ok).toBe(true);
    expect(validateSubmission(fields, { e: "not-an-email" }).ok).toBe(false);
    expect(validateSubmission(fields, { e: "a@b" }).ok).toBe(false);
  });

  it("accepts common international phone shapes", () => {
    const fields = [field({ id: "p", type: "phone" })];
    expect(validateSubmission(fields, { p: "+1 (555) 123-4567" }).ok).toBe(true);
    expect(validateSubmission(fields, { p: "5551234567" }).ok).toBe(true);
    expect(validateSubmission(fields, { p: "call me" }).ok).toBe(false);
  });

  it("rejects a javascript: URL", () => {
    // The stored value is rendered back in the dashboard, so a non-web scheme
    // must never be persisted.
    const fields = [field({ id: "u", type: "url" })];
    expect(validateSubmission(fields, { u: "https://example.com" }).ok).toBe(true);
    expect(validateSubmission(fields, { u: "javascript:alert(1)" }).ok).toBe(false);
    expect(validateSubmission(fields, { u: "not a url" }).ok).toBe(false);
  });

  it("rejects an unparseable date", () => {
    const fields = [field({ id: "d", type: "date" })];
    expect(validateSubmission(fields, { d: "2026-07-24" }).ok).toBe(true);
    expect(validateSubmission(fields, { d: "the third of never" }).ok).toBe(false);
  });
});

describe("number", () => {
  it("coerces a numeric string", () => {
    const fields = [field({ id: "n", type: "number" })];
    expect(validateSubmission(fields, { n: "42" }).data.n).toBe(42);
  });

  it("rejects a non-number", () => {
    const fields = [field({ id: "n", type: "number" })];
    expect(validateSubmission(fields, { n: "abc" }).ok).toBe(false);
  });

  it("enforces min and max", () => {
    const fields = [field({ id: "n", type: "number", min: 1, max: 10 })];
    expect(validateSubmission(fields, { n: 5 }).ok).toBe(true);
    expect(validateSubmission(fields, { n: 0 }).ok).toBe(false);
    expect(validateSubmission(fields, { n: 11 }).ok).toBe(false);
  });

  it("rejects Infinity and NaN", () => {
    const fields = [field({ id: "n", type: "number" })];
    expect(validateSubmission(fields, { n: Infinity }).ok).toBe(false);
    expect(validateSubmission(fields, { n: "NaN" }).ok).toBe(false);
  });
});

describe("select, radio, checkbox", () => {
  const options = ["Design", "Development", "Strategy"];

  it("accepts only an offered option", () => {
    const fields = [field({ id: "s", type: "select", options })];
    expect(validateSubmission(fields, { s: "Design" }).ok).toBe(true);
    expect(validateSubmission(fields, { s: "Something else" }).ok).toBe(false);
  });

  it("accepts multiple checkbox values and dedupes them", () => {
    const fields = [field({ id: "c", type: "checkbox", options })];
    const r = validateSubmission(fields, { c: ["Design", "Design", "Strategy"] });
    expect(r.ok).toBe(true);
    expect(r.data.c).toEqual(["Design", "Strategy"]);
  });

  it("rejects a checkbox value outside the options", () => {
    const fields = [field({ id: "c", type: "checkbox", options })];
    expect(validateSubmission(fields, { c: ["Design", "Injected"] }).ok).toBe(false);
  });

  it("caps checkbox selections", () => {
    const fields = [field({ id: "c", type: "checkbox", options })];
    const many = Array.from({ length: LIMITS.MAX_SELECTIONS + 1 }, () => "Design");
    expect(validateSubmission(fields, { c: many }).ok).toBe(false);
  });

  it("normalizes a single checkbox value into an array", () => {
    const fields = [field({ id: "c", type: "checkbox", options })];
    expect(validateSubmission(fields, { c: "Design" }).data.c).toEqual(["Design"]);
  });
});

describe("consent", () => {
  it("requires an affirmative value when required", () => {
    const fields = [field({ id: "ok", type: "consent", required: true })];
    expect(validateSubmission(fields, { ok: true }).ok).toBe(true);
    expect(validateSubmission(fields, { ok: "true" }).ok).toBe(true);
    expect(validateSubmission(fields, { ok: "on" }).ok).toBe(true);
    expect(validateSubmission(fields, { ok: false }).ok).toBe(false);
    expect(validateSubmission(fields, {}).ok).toBe(false);
  });

  it("stores false for an unticked optional consent", () => {
    const fields = [field({ id: "ok", type: "consent" })];
    const r = validateSubmission(fields, {});
    expect(r.ok).toBe(true);
    expect(r.data.ok).toBe(false);
  });
});

describe("file presence", () => {
  it("requires an actual upload for a required file field", () => {
    const fields = [field({ id: "cv", type: "file", required: true })];
    expect(validateSubmission(fields, {}).ok).toBe(false);
    // A caller cannot satisfy it by sending a plain string value.
    expect(validateSubmission(fields, { cv: "definitely-a-file.pdf" }).ok).toBe(false);
    expect(validateSubmission(fields, {}, { providedFileFields: ["cv"] }).ok).toBe(true);
  });

  it("never stores a caller-supplied value for a file field", () => {
    const fields = [field({ id: "cv", type: "file" })];
    const r = validateSubmission(fields, { cv: "https://evil.example/x.pdf" });
    expect(r.data.cv).toBeUndefined();
  });
});

describe("validateFile", () => {
  const f = field({ id: "cv", type: "file", label: "Attachment" });

  it("accepts an allowed type within the limit", () => {
    expect(validateFile(f, { name: "a.pdf", size: 1024, type: "application/pdf" })).toBeNull();
  });

  it("rejects a disallowed MIME type", () => {
    const err = validateFile(f, { name: "x.sh", size: 10, type: "application/x-sh" });
    expect(err).not.toBeNull();
  });

  it("rejects an empty file", () => {
    expect(validateFile(f, { name: "a.pdf", size: 0, type: "application/pdf" })).not.toBeNull();
  });

  it("rejects a file over the hard ceiling", () => {
    const err = validateFile(f, {
      name: "a.pdf",
      size: MAX_FILE_BYTES + 1,
      type: "application/pdf",
    });
    expect(err).not.toBeNull();
  });

  it("honors a field maxSize stricter than the ceiling", () => {
    const small = field({ id: "cv", type: "file", label: "Attachment", maxSize: 1 });
    expect(validateFile(small, { name: "a.pdf", size: 2 * 1024 * 1024, type: "application/pdf" })).not.toBeNull();
    expect(validateFile(small, { name: "a.pdf", size: 512 * 1024, type: "application/pdf" })).toBeNull();
  });

  it("does not let a field maxSize raise the hard ceiling", () => {
    const huge = field({ id: "cv", type: "file", label: "Attachment", maxSize: 5000 });
    const err = validateFile(huge, {
      name: "a.pdf",
      size: MAX_FILE_BYTES + 1,
      type: "application/pdf",
    });
    expect(err).not.toBeNull();
  });
});

describe("error reporting", () => {
  it("collects every failing field, not just the first", () => {
    const fields = [
      field({ id: "a", type: "text", required: true }),
      field({ id: "b", type: "email", required: true }),
      field({ id: "c", type: "number", min: 5 }),
    ];
    const r = validateSubmission(fields, { b: "nope", c: 1 });
    expect(r.ok).toBe(false);
    expect(r.errors.map((e) => e.field).sort()).toEqual(["a", "b", "c"]);
  });
});
