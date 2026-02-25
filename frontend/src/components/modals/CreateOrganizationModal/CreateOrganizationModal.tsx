import { useCreateOrganization } from "@/utils/api";
import { CreateOrganization } from "@/utils/api.schemas";
import Modal from "@components/Modal/Modal";
import { Button, Grid, Group, TextInput } from "@mantine/core";
import { Form, isNotEmpty, useForm } from "@mantine/form";
import React from "react";

interface CrateOrganizationModalProps {
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess: () => void;
}

const CreateOrganizationModal = ({ isOpened, closeModal, handleSuccess }: CrateOrganizationModalProps) => {
  const form = useForm<Partial<CreateOrganization>>({
    initialValues: {
      name: "",
      legalName: "",
      cin: "",
      vatin: "",
      address: {
        street: "",
        houseNumber: "",
        zip: "",
        city: "",
        country: "",
      },
    },
    validate: {
      name: isNotEmpty("This field should not be empty"),
      address: {
        street: isNotEmpty("This field should not be empty"),
        houseNumber: (zipValue: string | undefined) =>
          zipValue ? (/^(\d+)(\/\d+)?$/.test(zipValue) ? null : "Unable to send format") : null,
        zip: isNotEmpty("This field should not be empty"),
        city: isNotEmpty("This field should not be empty"),
        country: isNotEmpty("This field should not be empty"),
      },
    },
  });

  const createOrganizationMutation = useCreateOrganization({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        form.reset();
        closeModal();
      },
    },
  });

  const handleCreateOrganization = (submitValues: Partial<CreateOrganization>) => {
    form.validate();
    if (form.isValid()) {
      createOrganizationMutation.mutate({
        data: submitValues as CreateOrganization,
      });
    }
  };

  const isTouchedDirty = form.isTouched() && form.isDirty();

  const handleClose = () => {
    form.reset();
    closeModal();
  };

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title="Create Organization">
      <Form form={form} onSubmit={handleCreateOrganization}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="Organisation Name" {...form.getInputProps("name")} required />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="Legal Organisation Name" {...form.getInputProps("legalName")} required />
          </Grid.Col>
          <Grid.Col span={{ base: 6 }}>
            <TextInput label="Organisation CIN" {...form.getInputProps("cin")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6 }}>
            <TextInput label="Organisation VATIN" {...form.getInputProps("vatin")} />
          </Grid.Col>
          <Grid.Col span={8}>
            <TextInput label="Street" {...form.getInputProps("address.street")} required />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput label="House Number" {...form.getInputProps("address.houseNumber")} required />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="ZIP code" {...form.getInputProps("address.zip")} required />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="City" {...form.getInputProps("address.city")} required />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Country" {...form.getInputProps("address.country")} required />
          </Grid.Col>
        </Grid>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={createOrganizationMutation.isPending}>
            Save changes
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};
export default CreateOrganizationModal;
