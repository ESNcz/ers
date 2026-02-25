import { Avatar, Group, MultiSelectProps, Text } from "@mantine/core";
import React from "react";

export const otherOption = {
  Other: {},
};

type OptionBody = { image?: string };

type BaseOption = Record<string, OptionBody>;

export const healthLimitationsOptions: BaseOption = {
  "Prefer Not To Say": {},
  ...otherOption,
};

export const renderHealthLimitationOptions: MultiSelectProps["renderOption"] = ({ option }) => (
  <Group gap="sm">
    {allergenOptions[option.value]?.image ? (
      <Avatar src={allergenOptions[option.value].image} size={36} radius="xl" />
    ) : null}
    <div>
      <Text size="sm">{option.value}</Text>
    </div>
  </Group>
);

export const allergenOptions: BaseOption = {
  "Cereals containing gluten": {},
  "Crustaceans and products thereof": {},
  "Eggs and products thereof": {},
  "Fish and products thereof": {},
  "Peanuts and products thereof": {},
  "Soybeans and products thereof": {},
  "Milk and products thereof": {},
  Nuts: {},
  "Celery and products thereof": {},
  "Mustard and products thereof": {},
  "Sesame seeds and products thereof": {},
  "Sulphur dioxide and sulphites": {},
  "Lupin and products thereof": {},
  "Molluscs and products thereof": {},
  ...otherOption,
};

export const renderAllergenOptions: MultiSelectProps["renderOption"] = ({ option }) => (
  <Group gap="sm">
    {allergenOptions[option.value]?.image ? (
      <Avatar src={allergenOptions[option.value].image} size={36} radius="xl" />
    ) : null}
    <div>
      <Text size="sm">{option.value}</Text>
    </div>
  </Group>
);

export const foodRestrictionOptions: BaseOption = {
  Vegetarian: {},
  Vegan: {},
  "Lactose-free": {},
  "Gluten-free": {},
  "No Fish": {},
  "No pork": {},
  ...otherOption,
};

export const renderFoodRestrictionsOptions: MultiSelectProps["renderOption"] = ({ option }) => (
  <Group gap="sm">
    {foodRestrictionOptions[option.value]?.image ? (
      <Avatar src={allergenOptions[option.value].image} size={36} radius="xl" />
    ) : null}
    <div>
      <Text size="sm">{option.value}</Text>
    </div>
  </Group>
);

export const joinRestrictions = (restrictions: string[], additional: string | undefined = "") => {
  const includesOther = restrictions.includes("Other");
  const restrictionsSorted = restrictions
    .filter((f) => f !== "Other")
    .sort()
    .join(", ");

  const formatedAdditional = additional?.length > 0 ? `, ${additional.replace(",", "")}` : "";

  if (includesOther) {
    if (restrictionsSorted.length > 0) return `${restrictionsSorted}, Other${formatedAdditional}`;
    if (restrictionsSorted.length === 0) return `Other${formatedAdditional}`;
  }
  if (!includesOther) {
    if (restrictionsSorted.length > 0) return `${restrictionsSorted}`;
  }
  return "";
};
