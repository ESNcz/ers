import { useUpdateEventSpot } from "@/utils/api";
import { EventSpotSimple, UpdateEventSpot } from "@/utils/api.schemas";
import Modal from "@components/Modal/Modal";
import { Button, Flex, Group, NumberInput, SimpleGrid, TextInput } from "@mantine/core";
import { Form, hasLength, useForm } from "@mantine/form";
import React, { useEffect } from "react";

interface UpdateSpotModalProps {
  currentSpot: EventSpotSimple;
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess: () => void;
}

const UpdateSpotModal = ({ currentSpot, isOpened, closeModal, handleSuccess = () => {} }: UpdateSpotModalProps) => {
  const updateSpotMutation = useUpdateEventSpot({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        handleClose();
      },
    },
  });

  const form = useForm<Partial<EventSpotSimple>>({
    initialValues: {
      name: undefined,
      price: undefined,
    },
    validate: {
      name: hasLength({ min: 6 }, "Must be at least 6 characters."),
      price: (value) => (!!value && value < 0 ? "Must be larger than or equal to 0" : null),
    },
  });

  useEffect(() => {
    form.setInitialValues(currentSpot);
    form.setValues(currentSpot);
  }, [currentSpot]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSpot = (submitValues: Partial<UpdateEventSpot>) => {
    form.validate();
    if (form.isValid()) {
      updateSpotMutation.mutate({
        id: currentSpot.id,
        data: submitValues as UpdateEventSpot,
      });
    }
  };

  const handleClose = () => {
    form.reset();
    closeModal();
  };

  const isTouchedDirty = form.isTouched() && form.isDirty();

  return (
    <Modal size="lg" opened={isOpened} onClose={handleClose} title="Add Spot type">
      <Form form={form} onSubmit={handleUpdateSpot}>
        <Flex direction="column" gap={16}>
          <SimpleGrid cols={2}>
            <TextInput label="Spot Name" {...form.getInputProps("name")}></TextInput>
            <NumberInput label="Spot Price (CZK)" {...form.getInputProps("price")} suffix=" CZK" min={0} />
          </SimpleGrid>
        </Flex>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={updateSpotMutation.isPending}>
            Update Spot
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};

export default UpdateSpotModal;
