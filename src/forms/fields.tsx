import type React from "react";
import { cn } from "@/lib/utils";

/**
 * Styled form field components — this theme's answer to the platform's form
 * builder.
 *
 * The platform owns the field VOCABULARY (which types exist, how submissions are
 * validated); a theme owns how each one LOOKS. That split is what lets two themes
 * render the same form completely differently while the data stays identical.
 *
 * Everything here is built from this theme's own design tokens (`border-input`,
 * `bg-background`, `ring-ring`, the `Button` variants), so a form inherits the
 * site's look automatically rather than arriving as generic browser chrome.
 *
 * Adding a field type: the platform ships it in lib/forms/field-schema.ts and
 * templates/theme-site/lib/form-schema.ts, then it needs an entry here. A type with
 * no entry falls back to an unstyled input on the deployed site rather than
 * breaking the page.
 */

export interface FormFieldDescriptor {
  id: string;
  type: string;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  options?: string[];
  min?: number;
  max?: number;
  accept?: string;
  maxSize?: number;
}

export interface FormFieldProps {
  field: FormFieldDescriptor;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Server-side validation message for this field, if any. */
  error?: string;
  disabled?: boolean;
}

const CONTROL =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground outline-none transition-[color,box-shadow] " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/** Label + control + help/error, shared by every field so spacing stays uniform. */
function Field({
  field,
  error,
  children,
  labelFor,
}: {
  field: FormFieldDescriptor;
  error?: string;
  children: React.ReactNode;
  labelFor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={labelFor} className="text-sm font-medium">
        {field.label}
        {field.required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {field.help && !error && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({ field, value, onChange, error, disabled }: FormFieldProps) {
  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "phone"
        ? "tel"
        : field.type === "url"
          ? "url"
          : field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : "text";

  return (
    <Field field={field} error={error} labelFor={field.id}>
      <input
        id={field.id}
        name={field.id}
        type={inputType}
        value={value == null ? "" : String(value)}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        min={field.type === "number" ? field.min : undefined}
        max={field.type === "number" ? field.max : undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, error && "border-destructive")}
      />
    </Field>
  );
}

function TextareaField({ field, value, onChange, error, disabled }: FormFieldProps) {
  return (
    <Field field={field} error={error} labelFor={field.id}>
      <textarea
        id={field.id}
        name={field.id}
        rows={5}
        value={value == null ? "" : String(value)}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "h-auto min-h-24 resize-y", error && "border-destructive")}
      />
    </Field>
  );
}

function SelectField({ field, value, onChange, error, disabled }: FormFieldProps) {
  return (
    <Field field={field} error={error} labelFor={field.id}>
      <select
        id={field.id}
        name={field.id}
        value={value == null ? "" : String(value)}
        required={field.required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, error && "border-destructive")}
      >
        <option value="">{field.placeholder || "Select…"}</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function RadioField({ field, value, onChange, error, disabled }: FormFieldProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-sm font-medium">
        {field.label}
        {field.required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      <div className="flex flex-col gap-2 pt-1">
        {(field.options ?? []).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={String(value ?? "") === option}
              disabled={disabled}
              onChange={() => onChange(option)}
              className="size-4 accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
      {field.help && !error && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function CheckboxGroupField({ field, value, onChange, error, disabled }: FormFieldProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((v) => v !== option)
        : [...selected, option]
    );
  };

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-sm font-medium">
        {field.label}
        {field.required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      <div className="flex flex-col gap-2 pt-1">
        {(field.options ?? []).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={field.id}
              value={option}
              checked={selected.includes(option)}
              disabled={disabled}
              onChange={() => toggle(option)}
              className="size-4 accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
      {field.help && !error && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Single boolean checkbox where the label IS the statement being agreed to. */
function ConsentField({ field, value, onChange, error, disabled }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-2.5 text-sm leading-snug">
        <input
          type="checkbox"
          name={field.id}
          checked={value === true}
          required={field.required}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          {field.label}
          {field.required && (
            <span className="text-destructive" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function FileField({ field, onChange, error, disabled }: FormFieldProps) {
  return (
    <Field field={field} error={error} labelFor={field.id}>
      <input
        id={field.id}
        name={field.id}
        type="file"
        required={field.required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className={cn(
          "block w-full text-sm text-muted-foreground",
          "file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2",
          "file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80",
          error && "text-destructive"
        )}
      />
      {field.accept && (
        <p className="text-xs text-muted-foreground">
          {field.accept}
          {typeof field.maxSize === "number" ? ` · up to ${field.maxSize} MB` : ""}
        </p>
      )}
    </Field>
  );
}

/** Presentational — renders, collects nothing. */
function HeadingField({ field }: FormFieldProps) {
  return (
    <div>
      <h3 className="text-base font-semibold">{field.label}</h3>
      {field.help && <p className="mt-0.5 text-sm text-muted-foreground">{field.help}</p>}
    </div>
  );
}

function DividerField() {
  return <hr className="border-border" />;
}

export const formFieldComponents: Record<string, React.ComponentType<FormFieldProps>> = {
  text: TextField,
  email: TextField,
  phone: TextField,
  url: TextField,
  number: TextField,
  date: TextField,
  textarea: TextareaField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxGroupField,
  consent: ConsentField,
  file: FileField,
  heading: HeadingField,
  divider: DividerField as React.ComponentType<FormFieldProps>,
};
