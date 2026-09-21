import { UserGender } from "./api.schemas";

export const genderLabel = (gender: UserGender) =>
  gender
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const genderOptions = Object.values(UserGender).map((gender) => ({
  value: gender,
  label: genderLabel(gender),
}));
