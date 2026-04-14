import { useUpdateUserById } from "@/utils/api";
import { UpdateUser, User, UserGender } from "@/utils/api.schemas";
import { userValidators } from "@/utils/editFormValidators";
import { genderOptions } from "@/utils/table-helpers";
import Modal from "@components/Modal/Modal";
import DateInput from "@components/primitives/DateInput";
import Select from "@components/primitives/Select";
import { Button, Flex, Grid, Group, SimpleGrid, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import CountryList from "country-list-with-dial-code-and-flag";
import dayjs from "dayjs";
import { useEffect } from "react";

interface EditUserModalProps {
  user: User | undefined;
  isOpened: boolean;
  closeModal: () => void;
  handleOnSuccess: () => void;
}

const EditUserModal = ({ user, isOpened, closeModal, handleOnSuccess }: EditUserModalProps) => {
  const form = useForm<Partial<UpdateUser>>({
    mode: "uncontrolled",
    initialValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      birthDate: user?.birthDate ?? undefined,
      nationality: user?.nationality ?? "",
      gender: (user?.gender as UpdateUser["gender"]) ?? UserGender["prefer-not-to-say"],
      pronouns: user?.pronouns ?? "",
      phonePrefix: user?.phonePrefix ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      personalAddress: {
        street: user?.personalAddress?.street ?? "",
        houseNumber: user?.personalAddress?.houseNumber ?? "",
        zip: user?.personalAddress?.zip ?? "",
        city: user?.personalAddress?.city ?? "",
        country: user?.personalAddress?.country ?? "",
      },
    },
    validateInputOnChange: true,
    validate: userValidators,
  });

  useEffect(() => {
    if (!user || !isOpened) return;

    const values: Partial<UpdateUser> = {
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate ?? undefined,
      nationality: user.nationality ?? "",
      gender: user.gender as UpdateUser["gender"],
      pronouns: user.pronouns ?? "",
      phonePrefix: user.phonePrefix,
      phoneNumber: user.phoneNumber,
      personalAddress: {
        street: user.personalAddress?.street ?? "",
        houseNumber: user.personalAddress?.houseNumber ?? "",
        zip: user.personalAddress?.zip ?? "",
        city: user.personalAddress?.city ?? "",
        country: user.personalAddress?.country ?? "",
      },
    };
    form.setInitialValues(values);
    form.setValues(values);
    form.resetDirty();
    form.resetTouched();
  }, [user, isOpened]);

  const updateUserMutation = useUpdateUserById({
    mutation: {
      onSuccess: () => {
        handleOnSuccess();
        handleClose();
      },
    },
  });

  const handleSubmit = (values: Partial<UpdateUser>) => {
    if (!user) return;
    const isAddressEmpty = !values.personalAddress || Object.values(values.personalAddress).every((v) => !v);
    updateUserMutation.mutate({
      id: user.id,
      data: {
        ...values,
        personalAddress: isAddressEmpty ? undefined : values.personalAddress,
      } as UpdateUser,
    });
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
        <Flex direction="column" gap={12}>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput label="First Name" {...form.getInputProps("firstName")} required />
            <TextInput label="Last Name" {...form.getInputProps("lastName")} required />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <DateInput
              label="Birthdate"
              defaultValue={null}
              placeholder="Birthdate"
              defaultLevel="year"
              value={form.getValues().birthDate ? dayjs(form.getValues().birthDate).toDate() : null}
              onChange={(value) => {
                if (value) form.setFieldValue("birthDate", dayjs(value).toISOString());
              }}
              error={form.errors.birthDate}
              required
            />
            <Select
              label="Nationality"
              data={CountryList.getAll()
                .filter(
                  (value, index, array) =>
                    index === array.findIndex((t) => t.name === value.name || t.code === value.code),
                )
                .map((country) => ({
                  label: `(${country.code}) ${country.name}`,
                  value: country.code,
                }))}
              searchable
              maxDropdownHeight={200}
              comboboxProps={{ position: "bottom-start", middlewares: { flip: false, shift: false } }}
              {...form.getInputProps("nationality")}
              required
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Select label="Gender" data={genderOptions} {...form.getInputProps("gender")} required />
            <TextInput label="Pronouns" {...form.getInputProps("pronouns")} />
          </SimpleGrid>
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Prefix"
                data={CountryList.getAll()
                  .filter(
                    (value, index, array) => index === array.findIndex((t) => t.countryCode === value.countryCode),
                  )
                  .map((country) => ({
                    label: `${country.flag} (${country.countryCode}) ${country.code}`,
                    value: country.countryCode,
                  }))}
                searchable
                maxDropdownHeight={200}
                comboboxProps={{ position: "bottom-start", middlewares: { flip: false, shift: false } }}
                {...form.getInputProps("phonePrefix")}
                required
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput label="Phone Number" {...form.getInputProps("phoneNumber")} required />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={8}>
              <TextInput label="Street" {...form.getInputProps("personalAddress.street")} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="House Number" {...form.getInputProps("personalAddress.houseNumber")} />
            </Grid.Col>
          </Grid>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput label="ZIP Code" {...form.getInputProps("personalAddress.zip")} />
            <TextInput label="City" {...form.getInputProps("personalAddress.city")} />
          </SimpleGrid>
          <Select
            label="Country"
            data={CountryList.getAll()
              .filter(
                (value, index, array) =>
                  index === array.findIndex((t) => t.name === value.name || t.code === value.code),
              )
              .map((country) => ({
                label: `(${country.code}) ${country.name}`,
                value: country.code,
              }))}
            searchable
            maxDropdownHeight={200}
            comboboxProps={{ position: "bottom-start", middlewares: { flip: false, shift: false } }}
            {...form.getInputProps("personalAddress.country")}
          />
        </Flex>
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
