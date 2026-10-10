import { EventApplicationDetailedWithApplications } from "@/utils/api.schemas";
import { dateWithTime, dayMonthYear } from "@/utils/time";
import AddressCodeBlock from "@components/AddressCodeBlock/AddressCodeBlock";
import Modal from "@components/Modal/Modal";
import { Divider, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface ViewEventApplicationModalProps {
  application: EventApplicationDetailedWithApplications;
  isOpened: boolean;
  closeModal: () => void;
}

const invoiceMethodLabels: Record<EventApplicationDetailedWithApplications["invoiceMethod"], string> = {
  personal: "Personal",
  organisation: "Organisation",
  different: "Different person or company",
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap={2}>
    <Text size="xs" c="dimmed" fw={500}>
      {label}
    </Text>
    {typeof children === "string" ? <Text size="sm">{children || "—"}</Text> : children}
  </Stack>
);

/** Read-only overview of a sent event application */
const ViewEventApplicationModal = ({ application, isOpened, closeModal }: ViewEventApplicationModalProps) => {
  const organisation = application.organization
    ? application.organization.name
    : application.customOrganization
      ? `${application.customOrganization.name} (${application.customOrganization.country})`
      : "";
  const spot = application.spotType
    ? `${application.spotType.name} - ${application.spotType.price} ${application.spotType.currency}`
    : "Not assigned yet";

  return (
    <Modal size="lg" opened={isOpened} onClose={closeModal} title="Your application">
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Field label="Registered at">{dateWithTime(application.createdAt)}</Field>
          <Field label="Spot">{spot}</Field>
          <Field label="Organisation">{organisation}</Field>
        </SimpleGrid>

        <Divider />
        <Title order={4}>Identity document</Title>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Field label="ID / Passport number">{application.idNumber}</Field>
          <Field label="Valid until">{application.validUntil ? dayMonthYear(application.validUntil) : ""}</Field>
        </SimpleGrid>

        <Divider />
        <Title order={4}>Invoice</Title>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Field label="Invoice method">{invoiceMethodLabels[application.invoiceMethod]}</Field>
          {application.invoiceMethod === "different" && (
            <Field label="Invoiced to">{application.invoicedTo ?? ""}</Field>
          )}
        </SimpleGrid>
        {application.invoiceAddress && (
          <Field label="Invoice address">
            <AddressCodeBlock address={application.invoiceAddress} />
          </Field>
        )}

        <Divider />
        <Title order={4}>Health and food</Title>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Field label="Allergies">{application.allergies}</Field>
          <Field label="Food restrictions">{application.foodRestriction}</Field>
          <Field label="Health limitations">{application.healthLimitations}</Field>
        </SimpleGrid>
        <Field label="Additional information">{application.additionalInformation ?? ""}</Field>
      </Stack>
    </Modal>
  );
};

export default ViewEventApplicationModal;
