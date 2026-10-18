import { useExportEventFormResponses, useGetEventFormResponses } from "@/utils/api";
import { EventFormExportFormat } from "@/utils/api.schemas";
import { downloadFile } from "@/utils/downloadFile";
import Modal from "@components/Modal/Modal";
import { DataTable } from "@components/data-table";
import { eventFormResponseColumns } from "@components/data-table/event-form-response-columns";
import { Button, Group } from "@mantine/core";
import { IconTableExport } from "@tabler/icons-react";
import { useMemo } from "react";

import { toFileSlug } from "./eventFormUtils";

interface EventFormResponsesModalProps {
  eventId: number;
  formId: number;
  isOpened: boolean;
  closeModal: () => void;
}

const EventFormResponsesModal = ({ eventId, formId, isOpened, closeModal }: EventFormResponsesModalProps) => {
  const { data, isLoading } = useGetEventFormResponses(eventId, formId);

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

  const columns = useMemo(() => {
    if (!data) return [];
    const hasRemovedAnswers = data.rows.some((row) => Object.keys(row.removedAnswers).length > 0);
    return eventFormResponseColumns(data.form, hasRemovedAnswers);
  }, [data]);

  return (
    <Modal
      fullScreen
      opened={isOpened}
      onClose={closeModal}
      title={data ? `Responses – ${data.form.name}` : "Responses"}
    >
      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
        emptyMessage="No applicants found."
        getRowId={(row) => String(row.applicationId)}
        toolbarActions={
          <Group gap="xs">
            <Button
              leftSection={<IconTableExport size={16} />}
              loading={exportXlsx.isFetching}
              disabled={!data}
              onClick={() => handleExport(exportXlsx, "xlsx")}
            >
              Export XLSX
            </Button>
            <Button
              variant="default"
              leftSection={<IconTableExport size={16} />}
              loading={exportCsv.isFetching}
              disabled={!data}
              onClick={() => handleExport(exportCsv, "csv")}
            >
              Export CSV
            </Button>
          </Group>
        }
      />
    </Modal>
  );
};

export default EventFormResponsesModal;
