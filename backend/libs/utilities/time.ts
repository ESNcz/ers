import dayjs from "dayjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts unknown input to test
export const isDateString = (value: any): boolean => {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
};

export const dayMonthYear = (time: Date | string | undefined | null) => {
  return dayjs(time).format("DD.MM.YYYY");
};

export const dateWithTime = (time: Date | string | undefined | null) => {
  return dayjs(time).format("DD.MM.YYYY HH:mm");
};
