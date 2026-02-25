import { useCreateUserApplication, useUserOrganizationMemberships } from "@/utils/api";
import {
  CreateEventApplication,
  CreateEventApplicationInvoiceMethod,
  EventDetail,
  Organization,
  User,
} from "@/utils/api.schemas";
import useStepper from "@/utils/useStepper";
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
} from "@components/shared/renderRestrictionOptions";
import {
  Anchor,
  Blockquote,
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  MultiSelect,
  SimpleGrid,
  Stepper,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useState } from "react";

interface JoinEventModalProps {
  currentUser: User;
  eventDetail: EventDetail;
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess?: () => void;
}

type InvoiceMethodsType = "personal" | "organisation" | "different";

const EventApplicationModal = ({
  currentUser,
  eventDetail,
  isOpened,
  closeModal,
  handleSuccess = () => {},
}: JoinEventModalProps) => {
  const [allergenList, setAllergenList] = useState<string[]>([]);
  const [foodRestrictionList, setFoodRestrictionList] = useState<string[]>([]);
  const [healthLimitationsList, setHealthLimitationsList] = useState<string[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organization | null>(null);
  const [invoiceMethod, setInvoiceMethod] = useState<InvoiceMethodsType | undefined>(undefined);

  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentUser.id);

  const form = useForm<Partial<CreateEventApplication>>({
    mode: "uncontrolled",
    initialValues: {
      validUntil: undefined,
      idNumber: undefined,
      organization: undefined,
      spotTypeId: null,
      invoicedTo: null,
      invoiceAddress: undefined,
      invoiceMethod: undefined,
      additionalInformation: "",
      allergies: "",
      foodRestriction: "",
      healthLimitations: "",
      additionalFormData: {},
    },
    validate: (values) => {
      const errors: Record<string, string | null> = {};

      if (activeStep === 0) {
        if (!values.validUntil) {
          errors["validUntil"] = "ID/Passport valid until date is required";
        }

        if (!values.idNumber?.trim()) {
          errors["idNumber"] = "ID number is required";
        }

        if (!values.organization) {
          errors["organization.type"] = "Organization data is required";
        }

        if (values.organization?.type === "custom") {
          if (!values.organization.name?.trim()) {
            errors["organization.name"] = "Organization name is required";
          }
          if (!values.organization.country?.trim()) {
            errors["organization.country"] = "Country is required";
          }
        }

        if (values.organization?.type === "organization") {
          if (!values.organization.id) {
            errors["organization.id"] = "Organization ID is required";
          }
        }
      }

      if (activeStep === 1) {
        if (values.invoiceMethod === "different") {
          if (!values.invoicedTo) {
            errors["invoicedTo"] = "Invoiced to is required";
          }
          if (!values.invoiceAddress?.street) errors["invoiceAddress.street"] = "Invoiced to is required";
          if (!values.invoiceAddress?.houseNumber) errors["invoiceAddress.houseNumber"] = "House number to is required";
          if (!values.invoiceAddress?.zip) errors["invoiceAddress.zip"] = "ZIP is required";
          if (!values.invoiceAddress?.city) errors["invoiceAddress.city"] = "City to is required";
          if (!values.invoiceAddress?.country) errors["invoiceAddress.country"] = "Country to is required";
        }
      }

      return errors;
    },
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

  const { activeStep, onClickStep, nextStep, prevStep } = useStepper(form);

  const isTouchedDirty = form.isTouched() && form.isDirty();

  const handleClose = () => {
    form.reset();
    onClickStep(0);
    closeModal();
  };

  const eventApplicationMutation = useCreateUserApplication({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        form.reset();
        closeModal();
      },
    },
  });

  const handleEventApplication = (submitValues: Partial<CreateEventApplication>) => {
    form.validate();
    if (form.isValid()) {
      eventApplicationMutation.mutate({
        eventId: eventDetail.id,
        data: submitValues as CreateEventApplication,
      });
    }
  };

  if (!userOrganisationMemberships || !currentUser) {
    return null;
  }

  return (
    <Modal size="xl" opened={isOpened} onClose={handleClose} title={<Text fz="h3">Event Application</Text>}>
      <Form form={form} onSubmit={handleEventApplication}>
        <Stepper active={activeStep} iconSize={32}>
          <Stepper.Step label="Step 1:" description="General Information">
            <Flex direction="column" gap="md">
              <SimpleGrid cols={2}>
                <TextInput label="ID/Passport Number" {...form.getInputProps("idNumber")} required />
                <DateInput
                  label="Valid until (ID/Passport)"
                  defaultValue={null}
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
                      <TextInput
                        label="Organisation Country"
                        {...form.getInputProps("organization.country")}
                        required
                      />
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
          </Stepper.Step>
          <Stepper.Step label="Step 2" description="Invoice Information">
            <Flex direction="column" gap="md">
              <Select
                label="Invoice Method"
                value={invoiceMethod}
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
                  setInvoiceMethod(value as InvoiceMethodsType);
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
                      form.setFieldValue("invoicedTo", selectedOrganisation.legalName);
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
                      form.setFieldValue("invoiceAddress", {
                        street: "",
                        houseNumber: "",
                        zip: "",
                        city: "",
                        country: "",
                      });
                      form.setFieldValue("invoicedTo", null);
                    }
                  }
                }}
                error={form.errors["invoiceAddress"]}
                clearable={false}
                required
              />
              {invoiceMethod && (
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
                    }[invoiceMethod]
                  }
                </Box>
              )}
            </Flex>
          </Stepper.Step>
          <Stepper.Step label="Step 3" description="Additional Information">
            <Flex direction="column" gap="md">
              <MultiSelect
                label="Allergies"
                data={Object.entries(allergenOptions).map(([key]) => key)}
                renderOption={renderAllergenOptions}
                onChange={(value) => {
                  setAllergenList(value);
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
                label="Food Restrictions"
                data={Object.entries(foodRestrictionOptions).map(([key]) => key)}
                renderOption={renderFoodRestrictionsOptions}
                onChange={(value) => {
                  setFoodRestrictionList(value);
                }}
                hidePickedOptions
                clearable
              />
              {foodRestrictionList.includes("Other") && (
                <Textarea label="Food Restrictions (Other)" {...form.getInputProps("foodRestriction")} autosize />
              )}
              <MultiSelect
                label="Disability or Health Limitations"
                data={Object.entries(healthLimitationsOptions).map(([key]) => key)}
                onChange={(value) => {
                  setHealthLimitationsList(value);
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
          </Stepper.Step>
          <Stepper.Completed>
            <Flex direction="column" gap="md">
              <Checkbox
                label={
                  <Text>
                    I agree with{" "}
                    <Link href={eventDetail.termsAndConditionsLink} target="_blank">
                      Terms and conditions
                    </Link>
                  </Text>
                }
                required
              />
              <Checkbox
                label={
                  <Text>
                    I agree with{" "}
                    <Link href={eventDetail.photoPolicyLink} target="_blank">
                      Photo Consent
                    </Link>
                  </Text>
                }
                required
              />
              <Checkbox
                label={
                  <Text>
                    I agree with{" "}
                    <Link href={eventDetail.codeOfConductLink} target="_blank">
                      Code of Conduct
                    </Link>
                  </Text>
                }
                required
              />
            </Flex>
          </Stepper.Completed>
        </Stepper>

        <Flex mt={16} gap={8} justify="space-between">
          <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
            Back
          </Button>
          {activeStep > 2 ? (
            <Button type="submit" disabled={!isTouchedDirty} loading={eventApplicationMutation.isPending}>
              Submit application
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={activeStep > 2}>
              Next step
            </Button>
          )}
        </Flex>
      </Form>
    </Modal>
  );
};
export default EventApplicationModal;
