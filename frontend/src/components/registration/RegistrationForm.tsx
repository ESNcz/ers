"use client";

import { useCreateUser } from "@/utils/api";
import { CreateUser, CreateUserGender } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import DateInput from "@components/primitives/DateInput";
import Select from "@components/primitives/Select";
import { Box, Button, Checkbox, Flex, Grid, PasswordInput, SimpleGrid, Text, TextInput } from "@mantine/core";
import { Form, hasLength, isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import CountryList from "country-list-with-dial-code-and-flag";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface FormInitialTypes extends Partial<CreateUser> {
  confirmPassword: string | undefined;
}

const RegistrationForm = () => {
  const router = useRouter();
  const registerUserMutation = useCreateUser({
    mutation: {
      onSuccess: () => {
        notifications.update({
          title: "Registration",
          message: "You have registered successfully! Verify your e-mail to log in.",
          color: "green",
          loading: false,
          autoClose: true,
        });
        router.push(routes.LOGIN);
      },
    },
  });

  const form = useForm<FormInitialTypes>({
    validateInputOnChange: true,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: undefined,
      gender: CreateUserGender["prefer-not-to-say"],
      birthDate: undefined,
      nationality: undefined,
      phoneNumber: undefined,
    },
    validate: {
      firstName: isNotEmpty("First name can not be empty."),
      lastName: isNotEmpty("Last name can not be empty."),
      email: isEmail("E-mail is not valid."),
      username: hasLength({ min: 6 }, "Must be at least 6 characters"),
      gender: (value) => (value ? null : "Gender is required."),
      birthDate: isNotEmpty("Birthdate can not be empty."),
      nationality: isNotEmpty("Nationality can not be empty."),
      phoneNumber: (value) =>
        value ? (value?.match(/^\d+?$/) ? null : "Phone number must be numeric.") : "Phone Number can not be empty.",
      password: hasLength({ min: 6 }, "Must be at least 6 characters"),
      confirmPassword: (value, values) => (values.password === value ? null : "Password does not match"),
      personalAddress: (address) => {
        if (!address) return null;
        if (!address.city) return "City is required.";
        if (!address.country) return "Country is required.";
        if (!address.houseNumber.match(/^(\d+)(\/\d+)?$/)) return "House number must match the required pattern.";
        if (!address.street) return "Street is required.";
        if (!address.zip) return "ZIP code is required.";
        return null;
      },
    },
  });

  const registerUser = (values: Partial<CreateUser>) => {
    form.validate();
    if (form.isValid()) {
      registerUserMutation.mutate({
        data: values as CreateUser,
      });
    }
  };

  return (
    <Box maw="32rem" w="100%">
      <Form form={form} onSubmit={registerUser}>
        <Flex direction="column" gap={12}>
          <SimpleGrid cols={2}>
            <TextInput label="First Name" {...form.getInputProps("firstName")} required />
            <TextInput label="Last Name" {...form.getInputProps("lastName")} required />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <DateInput
              label="Birthdate"
              defaultValue={null}
              placeholder="Birthdate"
              defaultLevel="year"
              value={form.values.birthDate ? dayjs(form.values.birthDate).toDate() : null}
              onChange={(value) => {
                value && form.setFieldValue("birthDate", dayjs(value).toISOString());
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
                .map((country) => {
                  return {
                    label: `(${country.code}) ${country.name}`,
                    value: country.code,
                  };
                })}
              searchable
              {...form.getInputProps("nationality")}
              required
            />
          </SimpleGrid>
          <TextInput label="Email" {...form.getInputProps("email")} required />
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Prefix"
                data={CountryList.getAll()
                  .filter(
                    (value, index, array) => index === array.findIndex((t) => t.countryCode === value.countryCode),
                  )
                  .map((country) => {
                    return {
                      label: `${country.flag} (${country.countryCode}) ${country.code}`,
                      value: country.countryCode,
                    };
                  })}
                {...form.getInputProps("phonePrefix")}
                searchable
                required
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput label="Phone number" {...form.getInputProps("phoneNumber")} required />
            </Grid.Col>
          </Grid>
          <SimpleGrid cols={2}>
            <TextInput label="Username" {...form.getInputProps("username")} required />
            <Select
              label="Gender"
              defaultValue={CreateUserGender["prefer-not-to-say"]}
              data={Object.entries(CreateUserGender).map(([key, gender]) => {
                return {
                  label: gender, // (String(gender).charAt(0).toUpperCase() + String(gender).slice(1)).replaceAll("-", " "),
                  value: key,
                };
              })}
              {...form.getInputProps("gender")}
              required
            />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <PasswordInput label="Password" type="password" {...form.getInputProps("password")} required />
            <PasswordInput
              label="Confirm Password"
              type="password"
              {...form.getInputProps("confirmPassword")}
              required
            />
          </SimpleGrid>
        </Flex>
        <Flex direction="column" gap={16} mt={16}>
          <Checkbox
            label={
              <Text>
                I agree with{" "}
                <Link href="https://esncz.org/privacy-policy " target="_blank">
                  Privacy Policy
                </Link>
              </Text>
            }
            required
          />
          <Button loading={registerUserMutation.isPending} type="submit">
            Register
          </Button>
          {/* Register ERROR */}
          <Flex direction="row">
            {registerUserMutation.isError && <Text c="red">Something went wrong! Please try again.</Text>}
          </Flex>
        </Flex>
      </Form>
    </Box>
  );
};

export default RegistrationForm;
