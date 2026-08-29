import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formFieldComponents, type FormFieldDescriptor } from "./fields";

/**
 * Fetches a form definition and renders it, posting submissions to the tenant
 * site's own ingest route.
 *
 * Two deliberate choices:
 *
 * 1. It fetches `/api/forms/:key` RELATIVE, so it works unchanged on the deployed
 *    tenant site and inside the customizer preview (both serve that route on their
 *    own origin). That keeps the theme free of any token or base-URL knowledge, and
 *    means no new global has to be added to the platform's theme externals list.
 *
 * 2. Submission goes to `/api/forms/submit`, same origin, again with no credential.
 *    The write token lives server-side in that route. Client-side `required` here
 *    is a convenience only — the server revalidates everything against the stored
 *    definition and is the actual gate.
 */

interface FormDefinition {
  name: string;
  key: string;
  fields: FormFieldDescriptor[];
  settings?: { submit?: string; success?: string; redirect?: string } | null;
}

interface SubmitError {
  field: string;
  message: string;
}

/** Rendered when the platform ships a field type this theme hasn't styled yet. */
function FallbackField({
  field,
  value,
  onChange,
}: {
  field: FormFieldDescriptor;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
      </label>
      <input
        id={field.id}
        name={field.id}
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      />
    </div>
  );
}

export function FormRenderer({
  formKey,
  className,
}: {
  formKey?: string;
  className?: string;
}) {
  const [definition, setDefinition] = useState<FormDefinition | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!formKey) return;
    let cancelled = false;

    fetch(`/api/forms/${encodeURIComponent(formKey)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: FormDefinition) => {
        if (!cancelled) setDefinition(data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [formKey]);

  const setValue = useCallback((id: string, value: unknown) => {
    setValues((cur) => ({ ...cur, [id]: value }));
    // Clear the server error for a field as soon as it's edited, so a stale
    // message doesn't sit under a field the visitor has already corrected.
    setErrors((cur) => {
      if (!(id in cur)) return cur;
      const next = { ...cur };
      delete next[id];
      return next;
    });
  }, []);

  const fields = useMemo(() => definition?.fields ?? [], [definition]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !definition) return;

    setSubmitting(true);
    setErrors({});

    try {
      const hasFiles = Object.keys(files).length > 0;
      let response: Response;

      if (hasFiles) {
        const body = new FormData();
        body.append("formKey", definition.key);
        body.append("values", JSON.stringify(values));
        body.append("_hp", "");
        for (const [fieldId, file] of Object.entries(files)) {
          body.append(`file:${fieldId}`, file, file.name);
        }
        response = await fetch("/api/forms/submit", { method: "POST", body });
      } else {
        response = await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formKey: definition.key, values, _hp: "" }),
        });
      }

      const result = (await response.json()) as {
        ok?: boolean;
        errors?: SubmitError[];
        success?: string | null;
        redirect?: string | null;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          // Built with a loop rather than Object.fromEntries: this theme compiles
          // to an older lib target, and raising it would change the bundle's
          // browser support for the sake of one line.
          const next: Record<string, string> = {};
          for (const e of result.errors) next[e.field] = e.message;
          setErrors(next);
        } else {
          setErrors({ _form: result.error || "Something went wrong. Please try again." });
        }
        return;
      }

      if (result.redirect) {
        window.location.href = result.redirect;
        return;
      }

      setDone(result.success || definition.settings?.success || "Thanks — we got it.");
    } catch {
      setErrors({ _form: "Couldn't reach the server. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Nothing bound yet, or the bound form was deleted. Render nothing rather than
  // showing site visitors an error about the site's own configuration.
  if (!formKey || loadFailed) return null;

  if (!definition) {
    return <div className={cn("min-h-40", className)} aria-hidden="true" />;
  }

  if (done) {
    return (
      <div className={cn("rounded-lg border border-border bg-background p-6", className)}>
        <p role="status" className="text-sm">
          {done}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-5", className)}>
      {/* Honeypot: hidden from humans, tempting to bots. Kept out of the tab order
          and announced to nobody. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${definition.key}-hp`}>Leave this field empty</label>
        <input id={`${definition.key}-hp`} name="_hp" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => {
          const Component = formFieldComponents[field.type];
          const isHalf = field.width === "half";

          return (
            <div
              key={field.id}
              className={isHalf ? "col-span-2 sm:col-span-1" : "col-span-2"}
            >
              {Component ? (
                <Component
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  disabled={submitting}
                  onChange={(value) => {
                    if (field.type === "file") {
                      const file = value as File | null;
                      setFiles((cur) => {
                        const next = { ...cur };
                        if (file) next[field.id] = file;
                        else delete next[field.id];
                        return next;
                      });
                      return;
                    }
                    setValue(field.id, value);
                  }}
                />
              ) : (
                <FallbackField
                  field={field}
                  value={values[field.id]}
                  onChange={(value) => setValue(field.id, value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {errors._form && (
        <p role="alert" className="text-sm text-destructive">
          {errors._form}
        </p>
      )}

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : definition.settings?.submit || "Submit"}
        </Button>
      </div>
    </form>
  );
}
