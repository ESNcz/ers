"use client";

import { useCreateInitialState } from "@/utils/api";
import { CreateUserGender, InitialiseType } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import useStepper from "@/utils/useStepper";
import DateInput from "@components/primitives/DateInput";
import Select from "@components/primitives/Select";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Grid,
  PasswordInput,
  SimpleGrid,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import CountryList from "country-list-with-dial-code-and-flag";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface FormInitialTypes extends InitialiseType {
  confirmPassword: string | undefined;
  confirmPrivacyPolicy: boolean;
}

const InitialisePage = () => {
  const router = useRouter();
  const initialiseMutation = useCreateInitialState({
    mutation: {
      onSuccess: () => {
        router.push(routes.LOGIN);
      },
    },
  });

  const form = useForm<FormInitialTypes>({
    validateInputOnChange: true,
    initialValues: {
      confirmPassword: undefined,
      confirmPrivacyPolicy: false,
      user: {
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        gender: CreateUserGender["prefer-not-to-say"],
        birthDate: "",
        nationality: "",
        phonePrefix: "",
        phoneNumber: "",
        personalAddress: undefined,
      },
      organization: {
        name: "",
        legalName: "",
        cin: undefined,
        vatin: undefined,
        address: {
          houseNumber: "",
          city: "",
          country: "",
          zip: "",
          street: "",
        },
      },
    },
    validate: (values) => {
      const errors: Record<string, string | null> = {};
      const { address: organizationAddress } = values.organization;
      const { personalAddress: userAddress } = values.user;

      if (activeStep === 0) {
        if (!values.user.password)
          values.user.password.length >= 6
            ? (errors["user.password"] = null)
            : (errors["user.password"] = "This field's value is not valid. Must be longer then 6 characters.");

        if (values.user.password || values.confirmPassword)
          values.confirmPassword === values.user.password
            ? (errors["confirmPassword"] = null)
            : (errors["confirmPassword"] = "Password and Confirm Password fields does not match.");

        if (!values.user.firstName) errors["user.firstName"] = "This field's value is not valid.";
        if (!values.user.lastName) errors["user.lastName"] = "This field's value is not valid.";
        if (!values.user.email)
          values.user.email?.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
            ? (errors["user.email"] = null)
            : (errors["user.email"] = "This field's value is not valid.");
        if (!values.user.username)
          values.user.username.length >= 6
            ? (errors["user.username"] = null)
            : (errors["user.username"] = "This field's value is not valid. Must be longer then 6 characters.");
        if (!values.user.gender) errors["user.gender"] = "This field's value is not valid.";
        if (!values.user.birthDate) errors["user.birthDate"] = "This field's value is not valid.";
        if (!values.user.nationality) errors["user.nationality"] = "This field's value is not valid.";
        if (!values.user.phonePrefix) errors["user.phonePrefix"] = "This field's value is not valid.";
        if (!values.user.phoneNumber)
          values.user.phoneNumber?.match(/^\d+?$/)
            ? (errors["user.phoneNumber"] = null)
            : (errors["user.phoneNumber"] = "This field's value is not valid.");

        // if (userAddress) {
        //   if (!userAddress.city) errors["user.personalAddress.city"] = "This field's value is not valid.";
        //   if (!userAddress.country) errors["user.personalAddress.country"] = "This field's value is not valid.";
        //   if (!userAddress.houseNumber.match(/^(\d+)(\/\d+)?$/))
        //     errors["user.personalAddress.houseNumber"] = "This field's value is not valid.";
        //   if (!userAddress.street) errors["user.personalAddress.street"] = "This field's value is not valid.";
        //   if (!userAddress.zip) errors["user.personalAddress.zip"] = "This field's value is not valid.";
        // }
      }
      if (activeStep === 1) {
        if (!values.organization.name) errors["organization.name"] = "This field's value is not valid.";
        if (organizationAddress) {
          if (!organizationAddress.city) errors["organization.address.city"] = "This field's value is not valid.";
          if (!organizationAddress.country) errors["organization.address.country"] = "This field's value is not valid.";
          if (!organizationAddress.houseNumber.match(/^(\d+)(\/\d+)?$/))
            errors["organization.address.houseNumber"] = "This field's value is not valid.";
          if (!organizationAddress.street) errors["organization.address.street"] = "This field's value is not valid.";
          if (!organizationAddress.zip) errors["organization.address.zip"] = "This field's value is not valid.";
        }
      }

      return errors;
    },
  });

  const { activeStep, onClickStep, nextStep, prevStep } = useStepper(form);

  const initialiseSystem = (values: FormInitialTypes) => {
    form.validate();
    if (form.isValid()) {
      initialiseMutation.mutate({
        data: {
          user: values.user,
          organization: values.organization,
        },
      });
    }
  };

  return (
    <Container h="100vh">
      <Flex direction="column" justify="center" align="center" h="100%" gap={8}>
        <Box maw="32rem" w="100%">
          <Form form={form} onSubmit={initialiseSystem}>
            <Stepper iconSize={32} active={activeStep} onStepClick={onClickStep}>
              <Stepper.Step label="Step 1:" description="User Information">
                <Flex direction="column" gap={12}>
                  <SimpleGrid cols={2}>
                    <TextInput label="First Name" {...form.getInputProps("user.firstName")} required />
                    <TextInput label="Last Name" {...form.getInputProps("user.lastName")} required />
                  </SimpleGrid>
                  <SimpleGrid cols={2}>
                    <DateInput
                      label="Birthdate"
                      defaultValue={null}
                      placeholder="Birthdate"
                      value={form.values.user.birthDate ? dayjs(form.values.user.birthDate).toDate() : null}
                      onChange={(value) => {
                        value && form.setFieldValue("user.birthDate", dayjs(value).toISOString());
                      }}
                      error={form.errors["user.birthDate"]}
                      required
                    />
                    <Select
                      label="Nationality"
                      data={CountryList.getAll()
                        .filter(
                          (value, index, array) =>
                            index === array.findIndex((t) => t.name === value.name || t.code === value.code),
                        )
                        .map((country) => {
                          return {
                            label: `(${country.code}) ${country.name}`,
                            value: country.code,
                          };
                        })}
                      searchable
                      {...form.getInputProps("user.nationality")}
                      required
                    />
                  </SimpleGrid>
                  <TextInput label="Email" {...form.getInputProps("user.email")} required />
                  <Grid>
                    <Grid.Col span={4}>
                      <Select
                        label="Prefix"
                        data={CountryList.getAll()
                          .filter(
                            (value, index, array) =>
                              index === array.findIndex((t) => t.countryCode === value.countryCode),
                          )
                          .map((country) => {
                            return {
                              label: `${country.flag} (${country.countryCode}) ${country.code}`,
                              value: country.countryCode,
                            };
                          })}
                        {...form.getInputProps("user.phonePrefix")}
                        searchable
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <TextInput label="Phone number" {...form.getInputProps("user.phoneNumber")} required />
                    </Grid.Col>
                  </Grid>
                  <SimpleGrid cols={2}>
                    <TextInput label="Username" {...form.getInputProps("user.username")} required />
                    <Select
                      label="Gender"
                      defaultValue={CreateUserGender["prefer-not-to-say"]}
                      value={form.values.user.gender}
                      data={Object.entries(CreateUserGender).map(([key, gender]) => {
                        return {
                          label: gender, // (String(gender).charAt(0).toUpperCase() + String(gender).slice(1)).replaceAll("-", " "),
                          value: key,
                        };
                      })}
                      onChange={(value) => {
                        value && form.setFieldValue("user.gender", value as CreateUserGender);
                      }}
                      clearable={false}
                      required
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={2}>
                    <PasswordInput label="Password" type="password" {...form.getInputProps("user.password")} required />
                    <PasswordInput
                      label="Confirm Password"
                      type="password"
                      {...form.getInputProps("confirmPassword")}
                      required
                    />
                  </SimpleGrid>
                </Flex>
              </Stepper.Step>
              <Stepper.Step label="Step 2" description="Organisation Information">
                <Grid>
                  <Grid.Col span={12}>
                    <TextInput label="Organisation Name" {...form.getInputProps("organization.name")} required />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Organisation Legal Name"
                      {...form.getInputProps("organization.legalName")}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Organisation CIN" {...form.getInputProps("organization.cin")} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Organisation VATIN" {...form.getInputProps("organization.vatin")} />
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <TextInput label="Street" {...form.getInputProps("organization.address.street")} required />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput
                      label="House Number"
                      {...form.getInputProps("organization.address.houseNumber")}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="ZIP code" {...form.getInputProps("organization.address.zip")} required />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="City" {...form.getInputProps("organization.address.city")} required />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput label="Country" {...form.getInputProps("organization.address.country")} required />
                  </Grid.Col>
                </Grid>
              </Stepper.Step>
              <Stepper.Completed>
                <Checkbox
                  label={
                    <Text>
                      I agree with{" "}
                      <Link href="https://esncz.org/privacy-policy " target="_blank">
                        Privacy Policy
                      </Link>
                    </Text>
                  }
                  {...form.getInputProps("confirmPrivacyPolicy")}
                  required
                />
                <Flex mt={16} gap={8} justify="center" align="center">
                  <Button type="submit" disabled={initialiseMutation.isPending}>
                    Submit
                  </Button>
                </Flex>
              </Stepper.Completed>
            </Stepper>

            <Flex direction="column" gap={16} mt={16}>
              {/* Register ERROR */}
              <Flex direction="row">
                {initialiseMutation.isError && <Text c="red">Something went wrong! Please try again later.</Text>}
              </Flex>
            </Flex>
            <Flex mt={16} gap={8} justify="space-between">
              <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
                Back
              </Button>
              <Button onClick={nextStep} disabled={activeStep === 2}>
                Next step
              </Button>
            </Flex>
          </Form>
        </Box>
      </Flex>
    </Container>
  );
};

export default InitialisePage;
