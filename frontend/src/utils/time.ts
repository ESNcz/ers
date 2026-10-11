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

/** Time applied when a deadline picker gets a date without explicit time */
export const END_OF_DAY_TIME = "23:59:59";
