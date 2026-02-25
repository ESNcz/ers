import { useGetCurrentUser, useUpdateEventApplication, useUserOrganizationMemberships } from "@/utils/api";
import {
  CreateEventApplicationInvoiceMethod,
  EventApplicationDetailedWithApplications,
  Organization,
  UpdateEventApplication,
} from "@/utils/api.schemas";
import AddressCodeBlock from "@components/AddressCodeBlock/AddressCodeBlock";
import Modal from "@components/Modal/Modal";
import DateInput from "@components/primitives/DateInput";
import Select from "@components/primitives/Select";
import {
  allergenOptions,
  foodRestrictionOptions,
  healthLimitationsOptions,
  joinRestrictions,
  renderAllergenOptions,
  renderFoodRestrictionsOptions,
  renderHealthLimitationOptions,
} from "@components/shared/renderRestrictionOptions";
import {
  Anchor,
  Blockquote,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  MultiSelect,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

interface UpdateEventModalProps {
  currentApplication: EventApplicationDetailedWithApplications;
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess?: () => void;
}

const UpdateEventApplicationModal = ({
  currentApplication,
  isOpened,
  closeModal,
  handleSuccess = () => {},
}: UpdateEventModalProps) => {
  const allergenEntries = Object.entries(allergenOptions).map(([key]) => key);
  const applicationAllergens = currentApplication.allergies.split(", ");
  const foodRestrictionEntries = Object.entries(foodRestrictionOptions).map(([key]) => key);
  const applicationFoodRestrictions = currentApplication.foodRestriction.split(", ");
  const healthLimitationsEntries = Object.entries(healthLimitationsOptions).map(([key]) => key);
  const applicationHealthLimitations = currentApplication.healthLimitations.split(", ");

  const getAllergens = () => {
    return allergenEntries.filter((item) => applicationAllergens.includes(item));
  };
  const getOtherAllergens = () => {
    return applicationAllergens.filter((item) => !allergenEntries.includes(item)).join(", ");
  };
  const getFoodRestrictions = () => {
    return foodRestrictionEntries.filter((item) => applicationFoodRestrictions.includes(item));
  };
  const getOtherFoodRestrictions = () => {
    return applicationFoodRestrictions.filter((item) => !foodRestrictionEntries.includes(item)).join(", ");
  };
  const getHealthLimitations = () => {
    return healthLimitationsEntries.filter((item) => applicationHealthLimitations.includes(item));
  };
  const getOtherHealthLimitations = () => {
    return applicationHealthLimitations.filter((item) => !healthLimitationsEntries.includes(item)).join(", ");
  };

  const [allergenList, setAllergenList] = useState<string[]>(getAllergens());
  const [foodRestrictionList, setFoodRestrictionList] = useState<string[]>(getFoodRestrictions());
  const [healthLimitationsList, setHealthLimitationsList] = useState<string[]>(getHealthLimitations());
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organization | null>(
    currentApplication.organization,
  );

  const { data: currentUser } = useGetCurrentUser();

  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentApplication.user.id);

  const form = useForm<UpdateEventApplication>({
    mode: "uncontrolled",
    validate: {},
    transformValues: (values) => {
      const { allergies, foodRestriction, healthLimitations, ...restValues } = values;

      return {
        ...restValues,
        allergies: joinRestrictions(allergenList, allergies),
        foodRestriction: joinRestrictions(foodRestrictionList, foodRestriction),
        healthLimitations: joinRestrictions(healthLimitationsList, healthLimitations),
      };
    },
  });

  useEffect(() => {
    setAllergenList(getAllergens());
    setFoodRestrictionList(getFoodRestrictions());
    setHealthLimitationsList(getHealthLimitations());
    setSelectedOrganisation(currentApplication.organization);
    form.setValues({
      idNumber: currentApplication.idNumber,
      validUntil: currentApplication.validUntil,
      invoiceMethod: currentApplication.invoiceMethod,
      organization:
        currentApplication.customOrganization === null
          ? {
              type: "organization",
              id: currentApplication.organization.id,
            }
          : {
              type: "custom",
              id: currentApplication.customOrganization.id,
              name: currentApplication.customOrganization.name,
              country: currentApplication.customOrganization.country,
            },
      allergies: getOtherAllergens(),
      foodRestriction: getOtherFoodRestrictions(),
      healthLimitations: getOtherHealthLimitations(),
      additionalInformation: currentApplication.additionalInformation,
      invoicedTo: currentApplication.invoicedTo,
      invoiceAddress: currentApplication.invoiceAddress,
    });
  }, [currentApplication, isOpened]);

  const isTouchedDirty = form.isTouched() && form.isDirty();

  const updateEventApplication = useUpdateEventApplication({
    mutation: {
      onSuccess: (data) => {
        handleSuccess();
        handleCloseModal();
      },
    },
  });

  const handleSubmit = (data: UpdateEventApplication) => {
    updateEventApplication.mutate({
      id: currentApplication.id,
      data: data,
    });
  };

  const handleCloseModal = () => {
    form.reset();
    closeModal();
  };

  if (!userOrganisationMemberships || !currentUser) {
    return null;
  }

  return (
    <Modal size="xl" opened={isOpened} onClose={handleCloseModal} title="Update Event Applicaton">
      <Form form={form} onSubmit={handleSubmit}>
        <Stack gap="md">
          <Flex direction="column" gap="md">
            <SimpleGrid cols={2}>
              <TextInput label="ID/Passport Number" {...form.getInputProps("idNumber")} required />
              <DateInput
                label="Valid until (ID/Passport)"
                defaultValue={null}
                placeholder="ID/Passport valid until"
                value={form.values.validUntil ? dayjs(form.values.validUntil).toDate() : null}
                onChange={(value) => {
                  value && form.setFieldValue("validUntil", dayjs(value).toISOString());
                }}
                error={form.errors.validUntil}
                required
              />
            </SimpleGrid>
            <Select
              label="Select Organisation"
              value={
                form.values.organization
                  ? form.values.organization?.type === "custom"
                    ? "null"
                    : form.values.organization.id
                  : null
              }
              data={
                userOrganisationMemberships.length > 0
                  ? [
                      ...userOrganisationMemberships.map((membership) => {
                        return {
                          label: membership.organization.name,
                          value: membership.organization.id,
                        };
                      }),
                      {
                        label: "Different Organisation",
                        value: "null",
                      },
                    ]
                  : [{ label: "Different Organisation", value: "null" }]
              }
              onChange={(value) => {
                if (!value) return;
                const membership = userOrganisationMemberships.find((f) => f.organization.id === value);
                if (!membership || value === "null") {
                  form.setFieldValue("organization", {
                    type: "custom",
                    name: "",
                    country: "",
                  });
                  return;
                }
                form.setFieldValue("organization", {
                  type: "organization",
                  id: membership.organization.id,
                });
                setSelectedOrganisation(membership.organization);
                form.setFieldValue("invoicedTo", membership.organization.name);
              }}
              error={form.errors["organization.type"]}
              clearable={false}
              required
            />
            {form.values.organization?.type &&
              {
                custom: (
                  <SimpleGrid cols={2}>
                    <TextInput label="Organisation Name" {...form.getInputProps("organization.name")} required />
                    <TextInput label="Organisation Country" {...form.getInputProps("organization.country")} required />
                  </SimpleGrid>
                ),
                organization: (
                  <Blockquote>
                    <Text>Organisation: {selectedOrganisation?.name}</Text>
                    {selectedOrganisation?.cin && <Text>CIN: {selectedOrganisation.cin}</Text>}
                    {selectedOrganisation?.vatin && <Text>VATIN: {selectedOrganisation.vatin}</Text>}
                    {selectedOrganisation?.manager && (
                      <Text>
                        Manager:{" "}
                        {`${selectedOrganisation?.manager?.firstName} ${selectedOrganisation?.manager?.lastName}`}
                      </Text>
                    )}
                  </Blockquote>
                ),
              }[form.values.organization.type]}
          </Flex>
          <Flex direction="column" gap="md">
            <Select
              label="Invoice Method"
              value={form.values.invoiceMethod}
              data={[
                { label: "Personal Address", value: "personal", disabled: !currentUser.personalAddress },
                {
                  label: "Organisation Address",
                  value: "organisation",
                  disabled: !selectedOrganisation,
                },
                { label: "Different Invoice Address", value: "different" },
              ]}
              onChange={(value) => {
                if (!value) return;
                form.setFieldValue("invoiceMethod", value as CreateEventApplicationInvoiceMethod);
                switch (value) {
                  case "personal": {
                    if (!currentUser.personalAddress) return;
                    form.setFieldValue("invoicedTo", `${currentUser.firstName} ${currentUser.lastName}`);
                    form.setFieldValue("invoiceAddress", {
                      city: currentUser.personalAddress.city,
                      country: currentUser.personalAddress.country,
                      houseNumber: currentUser.personalAddress.houseNumber,
                      street: currentUser.personalAddress.street,
                      zip: currentUser.personalAddress.zip,
                    });
                    break;
                  }
                  case "organisation": {
                    if (!selectedOrganisation) return;
                    form.setFieldValue("invoicedTo", selectedOrganisation.name);
                    form.setFieldValue("invoiceAddress", {
                      city: selectedOrganisation.address.city,
                      country: selectedOrganisation.address.country,
                      houseNumber: selectedOrganisation.address.houseNumber,
                      street: selectedOrganisation.address.street,
                      zip: selectedOrganisation.address.zip,
                    });
                    break;
                  }
                  case "different": {
                    form.setFieldValue("invoiceAddress", undefined);
                    form.setFieldValue("invoicedTo", null);
                  }
                }
              }}
              error={form.errors["invoiceAddress"]}
              clearable={false}
              required
            />
            {form.values.invoiceMethod && (
              <Box>
                {
                  {
                    personal: (
                      <Box>
                        <AddressCodeBlock
                          beforeAddress={form.values.invoicedTo}
                          address={currentUser.personalAddress}
                        />
                      </Box>
                    ),
                    organisation: (
                      <Box>
                        <Text>{selectedOrganisation?.name}</Text>
                        <AddressCodeBlock
                          beforeAddress={form.values.invoicedTo}
                          address={selectedOrganisation?.address}
                        />
                      </Box>
                    ),
                    different: (
                      <Grid>
                        <Grid.Col span={{ base: 12 }}>
                          <TextInput label="Invoiced To" {...form.getInputProps("invoicedTo")} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 7, md: 7 }}>
                          <TextInput label="Street" {...form.getInputProps("invoiceAddress.street")} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 5, md: 5 }}>
                          <TextInput label="House No." {...form.getInputProps("invoiceAddress.houseNumber")} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 5, md: 6 }}>
                          <TextInput label="ZIP code" {...form.getInputProps("invoiceAddress.zip")} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 7, md: 6 }}>
                          <TextInput label="City" {...form.getInputProps("invoiceAddress.city")} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 12 }}>
                          <TextInput label="Country" {...form.getInputProps("invoiceAddress.country")} />
                        </Grid.Col>
                      </Grid>
                    ),
                  }[form.values.invoiceMethod]
                }
              </Box>
            )}
          </Flex>
          <Flex direction="column" gap="md">
            <MultiSelect
              label="Allergies"
              data={allergenEntries}
              renderOption={renderAllergenOptions}
              defaultValue={allergenList}
              onChange={(value) => {
                setAllergenList(value);
                form.setDirty({ allergies: true });
                form.setTouched({ allergies: true });
              }}
              description={
                <Text fz="xs" span>
                  Full allergen list:{" "}
                  <Anchor
                    fz="xs"
                    href="https://drive.google.com/file/d/1XxX40NTKs0JpGHIHPngrAyGWw1_paa8N/view"
                    target="_blank"
                  >
                    link
                  </Anchor>
                </Text>
              }
              hidePickedOptions
              clearable
            />
            {allergenList.includes("Other") && (
              <Textarea label="Allergies (Other)" {...form.getInputProps("allergies")} autosize />
            )}
            <MultiSelect
              label="Food Restriction"
              data={foodRestrictionEntries}
              renderOption={renderFoodRestrictionsOptions}
              defaultValue={foodRestrictionList}
              onChange={(value) => {
                setFoodRestrictionList(value);
                form.setDirty({ foodRestriction: true });
                form.setTouched({ foodRestriction: true });
              }}
              hidePickedOptions
              clearable
            />
            {foodRestrictionList.includes("Other") && (
              <Textarea label="Food Restrictions (Other)" {...form.getInputProps("foodRestriction")} autosize />
            )}
            <MultiSelect
              label="Disability or Health Limitations"
              data={healthLimitationsEntries}
              renderOption={renderHealthLimitationOptions}
              defaultValue={healthLimitationsList}
              onChange={(value) => {
                setHealthLimitationsList(value);
                form.setDirty({ healthLimitations: true });
                form.setTouched({ healthLimitations: true });
              }}
            />
            {healthLimitationsList.includes("Other") && (
              <Textarea
                label="Disability or Health Limitations (Other)"
                {...form.getInputProps("healthLimitations")}
                autosize
              />
            )}
            <Textarea label="Additional Information" {...form.getInputProps("additionalInformation")} autosize />
          </Flex>
        </Stack>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={updateEventApplication.isPending}>
            Update Application
          </Button>
        </Group>
      </Form>
    </Modal>
  );
};
export default UpdateEventApplicationModal;
