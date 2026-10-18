import { FormFieldDefinition, FormFieldType } from "@/utils/api.schemas";

export type FormAnswers = Record<string, unknown>;

/** Value shapes Mantine inputs work with */
export type FormInputValue = string | number | boolean | string[] | null;

export type FieldCheck = "ok" | "empty" | "invalid";

const MAX_TEXT_ANSWER_LENGTH = 5000;

export const isSelectType = (type: FormFieldType) =>
  type === FormFieldType.singleSelect || type === FormFieldType.multiSelect;

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

// Mirrors backend `checkFieldAnswer` (backend/apps/api/src/modules/events/forms/form-fields.ts) - keep in sync
export const checkFieldAnswer = (field: FormFieldDefinition, value: unknown): FieldCheck => {
  if (field.type === FormFieldType.checkbox) {
    if (value === undefined || value === null) return "empty";
    if (typeof value !== "boolean") return "invalid";
    return field.required && !value ? "empty" : "ok";
  }

  if (isEmptyValue(value)) return "empty";

  const options = field.options ?? [];
  switch (field.type) {
    case FormFieldType.shortText:
    case FormFieldType.longText:
      return typeof value === "string" && value.length <= MAX_TEXT_ANSWER_LENGTH ? "ok" : "invalid";
    case FormFieldType.number:
      return typeof value === "number" && Number.isFinite(value) ? "ok" : "invalid";
    case FormFieldType.singleSelect:
      return typeof value === "string" && options.includes(value) ? "ok" : "invalid";
    case FormFieldType.multiSelect:
      return Array.isArray(value) &&
        value.every((item) => typeof item === "string" && options.includes(item)) &&
        new Set(value).size === value.length
        ? "ok"
        : "invalid";
    default:
      return "invalid";
  }
};

/** Errors keyed by field ID, ready for `form.setErrors` */
export const validateAnswers = (fields: FormFieldDefinition[], answers: FormAnswers): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const check = checkFieldAnswer(field, answers[field.id]);
    if (check === "invalid") errors[field.id] = "Invalid value";
    else if (check === "empty" && field.required) errors[field.id] = "This field is required";
  }
  return errors;
};

const emptyInputValue = (field: FormFieldDefinition): FormInputValue => {
  switch (field.type) {
    case FormFieldType.checkbox:
      return false;
    case FormFieldType.multiSelect:
      return [];
    case FormFieldType.singleSelect:
      return null;
    default:
      return "";
  }
};

/** Answers that no longer match the field (type or options changed) start empty */
export const toInitialValues = (
  fields: FormFieldDefinition[],
  answers: FormAnswers | undefined,
): Record<string, FormInputValue> =>
  Object.fromEntries(
    fields.map((field) => {
      const value = answers?.[field.id];
      return [field.id, checkFieldAnswer(field, value) === "ok" ? (value as FormInputValue) : emptyInputValue(field)];
    }),
  );

/** Empty inputs are sent as `null` so the backend sees them as not filled */
export const toAnswersPayload = (fields: FormFieldDefinition[], values: Record<string, FormInputValue>): FormAnswers =>
  Object.fromEntries(
    fields.map((field) => {
      const value = values[field.id];
      if (field.type === FormFieldType.number) return [field.id, typeof value === "number" ? value : null];
      if (typeof value === "string" && value.trim() === "") return [field.id, null];
      return [field.id, value ?? null];
    }),
  );

export const formatAnswer = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

/** Same slug as backend `toFileSlug` so downloaded names match the API's filename */
export const toFileSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "form";
