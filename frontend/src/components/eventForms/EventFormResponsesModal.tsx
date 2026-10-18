import { useExportEventFormResponses, useGetEventFormResponses } from "@/utils/api";
import { EventFormExportFormat, EventFormStatus } from "@/utils/api.schemas";
import { downloadFile } from "@/utils/downloadFile";
import { dateWithTime } from "@/utils/time";
import Modal from "@components/Modal/Modal";
import { Button, Group, SegmentedControl, Skeleton, Stack, Table, Text } from "@mantine/core";
import { IconTableExport } from "@tabler/icons-react";
import { useState } from "react";

import FormStatusBadge from "./FormStatusBadge";
import { formatAnswer, toFileSlug } from "./eventFormUtils";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: EventFormStatus.complete, label: "Complete" },
  { value: EventFormStatus.incomplete, label: "Incomplete" },
  { value: EventFormStatus.missing, label: "Not filled" },
];

interface EventFormResponsesModalProps {
  eventId: number;
  formId: number;
  isOpened: boolean;
  closeModal: () => void;
}

const EventFormResponsesModal = ({ eventId, formId, isOpened, closeModal }: EventFormResponsesModalProps) => {
  const { data, isLoading } = useGetEventFormResponses(eventId, formId);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetched only on click - the export endpoint builds the whole file
  const exportOptions = { request: { responseType: "blob" as const }, query: { enabled: false } };
  const exportXlsx = useExportEventFormResponses(
    eventId,
    formId,
    { format: EventFormExportFormat.xlsx },
    exportOptions,
  );
  const exportCsv = useExportEventFormResponses(eventId, formId, { format: EventFormExportFormat.csv }, exportOptions);

  const handleExport = (query: typeof exportXlsx, format: "xlsx" | "csv") => {
    if (!data) return;
    query.refetch().then((response) => {
      if (response.data) downloadFile(response.data, `${toFileSlug(data.form.name)}-responses.${format}`);
    });
  };

  const rows = data?.rows.filter((row) => statusFilter === "all" || row.status === statusFilter) ?? [];
  const hasRemovedAnswers = data?.rows.some((row) => Object.keys(row.removedAnswers).length > 0) ?? false;

  return (
    <Modal
      fullScreen
      opened={isOpened}
      onClose={closeModal}
      title={data ? `Responses – ${data.form.name}` : "Responses"}
    >
      {isLoading || !data ? (
        <Skeleton height={320} />
      ) : (
        <Stack>
          <Group justify="space-between" wrap="wrap">
            <SegmentedControl data={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
            <Group>
              <Button
                leftSection={<IconTableExport size={16} />}
                loading={exportXlsx.isFetching}
                onClick={() => handleExport(exportXlsx, "xlsx")}
              >
                Export XLSX
              </Button>
              <Button
                variant="default"
                leftSection={<IconTableExport size={16} />}
                loading={exportCsv.isFetching}
                onClick={() => handleExport(exportCsv, "csv")}
              >
                Export CSV
              </Button>
            </Group>
          </Group>

          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover withTableBorder stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Organisation</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Last updated</Table.Th>
                  {data.form.fields.map((field) => (
                    <Table.Th key={field.id}>{field.label}</Table.Th>
                  ))}
                  {hasRemovedAnswers && <Table.Th>Removed fields</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.applicationId}>
                    <Table.Td>
                      {row.firstName} {row.lastName}
                      <Text size="xs" c="dimmed">
                        {row.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>{row.organization || "—"}</Table.Td>
                    <Table.Td>
                      <FormStatusBadge status={row.status} required={data.form.required} />
                    </Table.Td>
                    <Table.Td>{row.updatedAt ? dateWithTime(row.updatedAt) : "—"}</Table.Td>
                    {data.form.fields.map((field) => (
                      <Table.Td key={field.id} style={{ whiteSpace: "pre-wrap" }}>
                        {formatAnswer(row.answers[field.id]) || "—"}
                      </Table.Td>
                    ))}
                    {hasRemovedAnswers && (
                      <Table.Td>
                        {Object.entries(row.removedAnswers)
                          .map(([id, value]) => `${id}: ${formatAnswer(value)}`)
                          .join("; ") || "—"}
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {rows.length === 0 && <Text c="dimmed">No applicants match this filter.</Text>}
        </Stack>
      )}
    </Modal>
  );
};

export default EventFormResponsesModal;
