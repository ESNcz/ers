import dayjs from "dayjs";

export const isDateString = (value: any): boolean => {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
};

export const dayMonthYear = (time: Date | string | undefined) => {
  return dayjs(time).format("DD.MM.YYYY");
};

export const dateWithTime = (time: Date | string | undefined) => {
  return dayjs(time).format("DD.MM.YYYY HH:mm");
};
