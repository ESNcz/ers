import { useGenerateSheetEventApplication } from "@/utils/api";
import { downloadFile } from "@/utils/downloadFile";
import Modal from "@components/Modal/Modal";
import { Button, Checkbox, Group, Stack, Text } from "@mantine/core";
import { IconTableExport } from "@tabler/icons-react";
import { useState } from "react";

interface ExportApplicationsModalProps {
  eventId: number;
  /** Form answers are visible only to event editors - the backend rejects `includeForms` for others */
  canIncludeForms: boolean;
  isOpened: boolean;
  closeModal: () => void;
}

const ExportApplicationsModal = ({ eventId, canIncludeForms, isOpened, closeModal }: ExportApplicationsModalProps) => {
  const [includeForms, setIncludeForms] = useState(false);
  const [onlyWithSpot, setOnlyWithSpot] = useState(false);

  // Fetched only on click - the endpoint builds the whole file
  const exportToSheet = useGenerateSheetEventApplication(
    eventId,
    { includeForms: canIncludeForms && includeForms, onlyWithSpot },
    { request: { responseType: "blob" }, query: { enabled: false } },
  );

  const handleExport = () => {
    exportToSheet.refetch().then((response) => {
      if (!response.data) return;
      downloadFile(response.data);
      closeModal();
    });
  };

  return (
    <Modal opened={isOpened} onClose={closeModal} title="Export applications">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Downloads all applications of this event as an XLSX file.
        </Text>
        <Checkbox
          label="Leave out people without a spot"
          description="Only applicants who have been assigned a spot are exported"
          checked={onlyWithSpot}
          onChange={(event) => setOnlyWithSpot(event.currentTarget.checked)}
        />
        {canIncludeForms && (
          <Checkbox
            label="Include additional forms"
            description="Adds each form's status and answers, grouped under the form name"
            checked={includeForms}
            onChange={(event) => setIncludeForms(event.currentTarget.checked)}
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={closeModal}>
            Cancel
          </Button>
          <Button leftSection={<IconTableExport size={18} />} loading={exportToSheet.isFetching} onClick={handleExport}>
            Export
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ExportApplicationsModal;
