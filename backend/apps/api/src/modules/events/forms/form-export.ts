import dayjs from "dayjs";
import * as ExcelJS from "exceljs";

import type { EventFormResponsesTable } from "@api/models/responses";

import { EventFormStatus, type FormAnswers, type FormField, computeStatus } from "./form-fields";

export type ExportFormat = "xlsx" | "csv";

/**
 * Form shape needed for the applications export
 */
export interface ExportedForm {
  id: number;
  name: string;
  fields: FormField[];
}

const statusLabels: Record<EventFormStatus, string> = {
  [EventFormStatus.complete]: "Complete",
  [EventFormStatus.incomplete]: "Incomplete",
  [EventFormStatus.missing]: "Not filled",
};

// Spreadsheet apps execute CSV cells starting with these as formulas
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const formatAnswer = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

export const toFileSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "form";

export const exportFileName = (formName: string, format: ExportFormat) => `${toFileSlug(formName)}-responses.${format}`;

export const buildResponsesFile = async (table: EventFormResponsesTable, format: ExportFormat): Promise<Buffer> => {
  const cell = (value: string) => (format === "csv" && FORMULA_PREFIX.test(value) ? `'${value}` : value);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Responses");

  worksheet.columns = [
    { header: "First Name", key: "firstName" },
    { header: "Last Name", key: "lastName" },
    { header: "E-mail", key: "email" },
    { header: "Organisation", key: "organization" },
    { header: "Spot Name", key: "spotName" },
    { header: "Status", key: "status" },
    { header: "Last Updated", key: "updatedAt" },
    ...table.form.fields.map((field) => ({ header: cell(field.label), key: `field:${field.id}` })),
    { header: "Removed fields", key: "removedAnswers" },
  ];

  for (const row of table.rows) {
    worksheet.addRow({
      firstName: cell(row.firstName),
      lastName: cell(row.lastName),
      email: cell(row.email),
      organization: cell(row.organization),
      spotName: cell(row.spotName ?? ""),
      status: statusLabels[row.status],
      updatedAt: row.updatedAt ? dayjs(row.updatedAt).format("DD.MM.YYYY HH:mm") : "",
      ...Object.fromEntries(
        table.form.fields.map((field) => [`field:${field.id}`, cell(formatAnswer(row.answers[field.id]))]),
      ),
      removedAnswers: cell(
        Object.entries(row.removedAnswers)
          .map(([id, value]) => `${id}: ${formatAnswer(value)}`)
          .join("; "),
      ),
    });
  }

  if (format === "csv") {
    // BOM makes Excel read the file as UTF-8 so diacritics survive
    return Buffer.concat([Buffer.from("\uFEFF", "utf8"), Buffer.from(await workbook.csv.writeBuffer())]);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
};

const formStatusKey = (formId: number) => `form:${formId}:status`;
const formFieldKey = (formId: number, fieldId: string) => `form:${formId}:${fieldId}`;

/**
 * Columns appended to the applications export - per form a status column and one column per current field.
 * Two-row headers: form name above, question label below (merged by `mergeFormHeaders`).
 */
export const formExportColumns = (forms: ExportedForm[]) =>
  forms.flatMap((form) => [
    { header: [form.name, "Status"], key: formStatusKey(form.id) },
    ...form.fields.map((field) => ({ header: [form.name, field.label], key: formFieldKey(form.id, field.id) })),
  ]);

/**
 * Row values for one application, `answersByForm` is undefined when the application has no responses
 */
export const formExportCells = (forms: ExportedForm[], answersByForm: Map<number, FormAnswers> | undefined) =>
  Object.fromEntries(
    forms.flatMap((form) => {
      const answers = answersByForm?.get(form.id) ?? null;
      return [
        [formStatusKey(form.id), statusLabels[computeStatus(form.fields, answers)]],
        ...form.fields.map((field) => [formFieldKey(form.id, field.id), formatAnswer(answers?.[field.id])]),
      ];
    }),
  );

/**
 * Merges the two header rows: base columns vertically, each form name across its columns
 */
export const mergeFormHeaders = (worksheet: ExcelJS.Worksheet, baseColumnCount: number, forms: ExportedForm[]) => {
  for (let column = 1; column <= baseColumnCount; column++) {
    worksheet.mergeCells(1, column, 2, column);
  }

  let column = baseColumnCount + 1;
  for (const form of forms) {
    const lastColumn = column + form.fields.length;
    if (lastColumn > column) worksheet.mergeCells(1, column, 1, lastColumn);
    worksheet.getCell(1, column).alignment = { horizontal: "center" };
    column = lastColumn + 1;
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(2).font = { bold: true };
};
