import { DateValue, DateInput as MantineDateInput, DateInputProps as MantineDateInputProps } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/en";

export interface DateInputProps extends MantineDateInputProps {
  value: DateValue;
  onChange: (value: DateValue) => void;
}

const DateInput = ({ value, onChange, ...props }: DateInputProps) => {
  const dateParser: DateInputProps["dateParser"] = (input: string) => {
    return dayjs(input).format("DD.MM.YYYY");
  };
  return (
    <MantineDateInput
      leftSection={<IconCalendar />}
      dateParser={dateParser}
      valueFormat="DD.MM.YYYY"
      placeholder="dd.mm.yyyy"
      locale="en"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default DateInput;
