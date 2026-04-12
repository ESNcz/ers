import { getGetAllUsersQueryKey, useUpdateUserById } from "@/utils/api";
import { UpdateUser, User, UserGender } from "@/utils/api.schemas";
import { genderOptions } from "@/utils/table-helpers";
import Modal from "@components/Modal/Modal";
import Select from "@components/primitives/Select";
import { Button, Grid, Group, TextInput } from "@mantine/core";
import { Form, isNotEmpty, useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface EditUserModalProps {
  user: User | undefined;
  isOpened: boolean;
  closeModal: () => void;
  handleOnSuccess: () => void;
}

const EditUserModal = ({ user, isOpened, closeModal, handleOnSuccess }: EditUserModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<Partial<UpdateUser>>({
    mode: "uncontrolled",
    initialValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      gender: (user?.gender as UpdateUser["gender"]) ?? UserGender["prefer-not-to-say"],
      pronouns: user?.pronouns ?? "",
      phonePrefix: user?.phonePrefix ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      personalAddress: user?.personalAddress
        ? {
            street: user.personalAddress.street,
            houseNumber: user.personalAddress.houseNumber,
            zip: user.personalAddress.zip,
            city: user.personalAddress.city,
            country: user.personalAddress.country,
          }
        : undefined,
    },
    validate: {
      firstName: isNotEmpty("First name is required"),
      lastName: isNotEmpty("Last name is required"),
      username: isNotEmpty("Username is required"),
    },
  });

  useEffect(() => {
    if (!user && !isOpened) return;

    form.setValues({
      firstName: user?.firstName,
      lastName: user?.lastName,
      username: user?.username,
      gender: user?.gender as UpdateUser["gender"],
      pronouns: user?.pronouns ?? "",
      phonePrefix: user?.phonePrefix,
      phoneNumber: user?.phoneNumber,
      personalAddress: user?.personalAddress
        ? {
            street: user.personalAddress.street,
            houseNumber: user.personalAddress.houseNumber,
            zip: user.personalAddress.zip,
            city: user.personalAddress.city,
            country: user.personalAddress.country,
          }
        : undefined,
    });
  }, [user, isOpened]);

  const updateUserMutation = useUpdateUserById({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [getGetAllUsersQueryKey()] });
        handleOnSuccess();
        handleClose();
      },
    },
  });

  const handleSubmit = (values: Partial<UpdateUser>) => {
    form.validate();
    if (form.isValid() && user) {
      updateUserMutation.mutate({
        id: user.id,
        data: values as UpdateUser,
      });
    }
  };

  const handleClose = () => {
    form.reset();
    closeModal();
  };

  if (!user) return null;

  const isTouchedDirty = form.isTouched() && form.isDirty();

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title={`Edit User - ${user.firstName} ${user.lastName}`}>
      <Form form={form} onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="First Name" {...form.getInputProps("firstName")} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="Last Name" {...form.getInputProps("lastName")} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="Username" {...form.getInputProps("username")} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Gender"
              data={genderOptions}
              value={form.getValues().gender}
              onChange={(value) => form.setFieldValue("gender", value as UpdateUser["gender"])}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput label="Pronouns" {...form.getInputProps("pronouns")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <TextInput label="Phone Prefix" {...form.getInputProps("phonePrefix")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <TextInput label="Phone Number" {...form.getInputProps("phoneNumber")} />
          </Grid.Col>
          <Grid.Col span={8}>
            <TextInput label="Street" {...form.getInputProps("personalAddress.street")} />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput label="House Number" {...form.getInputProps("personalAddress.houseNumber")} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="ZIP Code" {...form.getInputProps("personalAddress.zip")} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="City" {...form.getInputProps("personalAddress.city")} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Country" {...form.getInputProps("personalAddress.country")} />
          </Grid.Col>
        </Grid>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={updateUserMutation.isPending}>
            Save Changes
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
