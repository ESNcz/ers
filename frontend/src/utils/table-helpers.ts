import { UserGender } from "./api.schemas";

export const genderOptions = [
  { label: "Male", value: UserGender.male },
  { label: "Female", value: UserGender.female },
  { label: "Non-binary", value: UserGender["non-binary"] },
  { label: "Prefer not to say", value: UserGender["prefer-not-to-say"] },
];
