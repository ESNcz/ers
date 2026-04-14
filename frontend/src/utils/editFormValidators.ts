import { UpdateUser } from "@/utils/api.schemas";
import { isNotEmpty } from "@mantine/form";

type UserFormValues = Partial<UpdateUser>;

export const userValidators = {
  firstName: isNotEmpty("First name can not be empty."),
  lastName: isNotEmpty("Last name can not be empty."),
  birthDate: isNotEmpty("Birthdate can not be empty."),
  nationality: isNotEmpty("Nationality can not be empty."),
  gender: (value: unknown) => (value ? null : "Gender is required."),
  phoneNumber: (value: string | undefined) =>
    value ? (value.match(/^\d+?$/) ? null : "Phone number must be numeric.") : "Phone Number can not be empty.",
  personalAddress: {
    street: (value: string | undefined, values: UserFormValues) => {
      const addr = values.personalAddress;
      if (!addr || Object.values(addr).every((v) => !v)) return null;
      return value ? null : "Street is required.";
    },
    houseNumber: (value: string | undefined, values: UserFormValues) => {
      const addr = values.personalAddress;
      if (!addr || Object.values(addr).every((v) => !v)) return null;
      if (!value) return "House number is required.";
      return value.match(/^(\d+)(\/\d+)?$/) ? null : "House number must match the required pattern.";
    },
    zip: (value: string | undefined, values: UserFormValues) => {
      const addr = values.personalAddress;
      if (!addr || Object.values(addr).every((v) => !v)) return null;
      return value ? null : "ZIP code is required.";
    },
    city: (value: string | undefined, values: UserFormValues) => {
      const addr = values.personalAddress;
      if (!addr || Object.values(addr).every((v) => !v)) return null;
      return value ? null : "City is required.";
    },
    country: (value: string | undefined, values: UserFormValues) => {
      const addr = values.personalAddress;
      if (!addr || Object.values(addr).every((v) => !v)) return null;
      return value ? null : "Country is required.";
    },
  },
  pronouns: (value: string | null | undefined) => {
    if (!value) return null;
    if (value.length > 10) return "Pronouns must be 30 characters or less.";
    return null;
  },
  phonePrefix: (value: string | undefined) => {
    if (!value) return "Phone prefix can not be empty.";
    if (!value.match(/^\+\d{1,4}$/)) return "Phone prefix must be in format +XXX.";
    return null;
  },
};
