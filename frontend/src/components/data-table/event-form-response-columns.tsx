import { type EventFormDetail, type EventFormResponseRow, EventFormStatus, FormFieldType } from "@/utils/api.schemas";
import { dateWithTime } from "@/utils/time";
import FormStatusBadge from "@components/eventForms/FormStatusBadge";
import { formatAnswer } from "@components/eventForms/eventFormUtils";
import { Text } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";

const STATUS_FILTER_OPTIONS = [
  { value: EventFormStatus.complete, label: "Complete" },
  { value: EventFormStatus.incomplete, label: "Incomplete" },
  { value: EventFormStatus.missing, label: "Not filled" },
];

/** Columns depend on the form - applicant info, status, one column per current field, removed answers if any */
export const eventFormResponseColumns = (
  form: EventFormDetail,
  showRemovedAnswers: boolean,
): ColumnDef<EventFormResponseRow>[] => {
  const columns: ColumnDef<EventFormResponseRow>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: "Name",
      minSize: 200,
      cell: ({ row, getValue }) => (
        <div>
          <Text size="sm">{getValue<string>()}</Text>
          <Text size="xs" c="dimmed">
            {row.original.email}
          </Text>
        </div>
      ),
    },
    {
      id: "organization",
      accessorFn: (row) => row.organization,
      header: "Organisation",
      minSize: 160,
      meta: { filterVariant: "select" },
    },
    {
      id: "spot",
      accessorFn: (row) => row.spotName ?? "N/A",
      header: "Spot",
      minSize: 140,
      meta: { filterVariant: "select" },
    },
    {
      accessorKey: "status",
      header: "Status",
      minSize: 140,
      meta: { filterVariant: "select", filterOptions: STATUS_FILTER_OPTIONS },
      cell: ({ row }) => <FormStatusBadge status={row.original.status} required={form.required} />,
    },
    {
      id: "updatedAt",
      accessorFn: (row) => row.updatedAt,
      header: "Last updated",
      minSize: 170,
      meta: { filterVariant: "date" },
      cell: ({ row }) => (row.original.updatedAt ? dateWithTime(row.original.updatedAt) : "—"),
    },
    ...form.fields.map(
      (field): ColumnDef<EventFormResponseRow> => ({
        id: `field:${field.id}`,
        // Numbers stay numeric for sorting and range filter, a stale answer of another type is shown as text
        accessorFn: (row) => {
          const value = row.answers[field.id];
          return field.type === FormFieldType.number && typeof value === "number" ? value : formatAnswer(value);
        },
        header: field.label,
        minSize: 160,
        meta: {
          label: field.label,
          filterVariant:
            field.type === FormFieldType.number
              ? "number"
              : field.type === FormFieldType.singleSelect || field.type === FormFieldType.checkbox
                ? "select"
                : "text",
        },
        cell: ({ getValue }) => (
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {String(getValue() ?? "") || "—"}
          </Text>
        ),
      }),
    ),
  ];

  if (showRemovedAnswers) {
    columns.push({
      id: "removedAnswers",
      accessorFn: (row) =>
        Object.entries(row.removedAnswers)
          .map(([id, value]) => `${id}: ${formatAnswer(value)}`)
          .join("; "),
      header: "Removed fields",
      minSize: 220,
    });
  }

  return columns;
};
