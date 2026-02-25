import { useCreateEventSpot } from "@/utils/api";
import { CreateEventSpot } from "@/utils/api.schemas";
import Modal from "@components/Modal/Modal";
import { Button, Flex, Group, NumberInput, SimpleGrid, TextInput } from "@mantine/core";
import { Form, hasLength, useForm } from "@mantine/form";
import React from "react";

interface CreateSpotModalProps {
  isOpened: boolean;
  closeModal: () => void;
  eventId: number;
  handleSuccess: () => void;
}

const CreateSpotModal = ({ isOpened, closeModal, eventId, handleSuccess = () => {} }: CreateSpotModalProps) => {
  const createSpotMutation = useCreateEventSpot({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        handleCloseModal();
      },
    },
  });

  const form = useForm<Partial<CreateEventSpot>>({
    initialValues: {
      name: "",
      price: 0,
    },
    validate: {
      name: hasLength({ min: 6 }, "Must be at least 6 characters."),
      price: (value) => (!!value && value < 0 ? "Must be larger than or equal to 0" : null),
    },
  });

  const handleCloseModal = () => {
    form.reset();
    closeModal();
  };

  const handleCreateSpot = (submitValues: Partial<CreateEventSpot>) => {
    form.validate();
    if (form.isValid()) {
      createSpotMutation.mutate({
        id: eventId,
        data: submitValues as CreateEventSpot,
      });
    }
  };

  const isTouchedDirty = form.isTouched() && form.isDirty();

  return (
    <Modal size="lg" opened={isOpened} onClose={handleCloseModal} title="Add Spot type">
      <Form form={form} onSubmit={handleCreateSpot}>
        <Flex direction="column" gap={16}>
          <SimpleGrid cols={2}>
            <TextInput label="Spot Name" {...form.getInputProps("name")}></TextInput>
            <NumberInput label="Spot Price (CZK)" {...form.getInputProps("price")} suffix=" CZK" min={0} />
          </SimpleGrid>
        </Flex>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={createSpotMutation.isPending}>
            Create Spot
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};
export default CreateSpotModal;
