"use client";

import { ComboboxItem, Select as MantineSelect, SelectProps as MantineSelectProps } from "@mantine/core";
import React, { useState } from "react";

interface SelectProps extends MantineSelectProps {}

const Select = ({ ...selectProps }: SelectProps) => {
  const { value, onChange, ...restSelectProps } = selectProps;
  const [selectValue, setSelectValue] = useState<ComboboxItem | null>(null);
  return (
    <MantineSelect
      value={value ? value : selectValue?.value}
      onChange={(value, options) => {
        if (onChange) {
          onChange(value, options);
        }
        setSelectValue({
          label: options?.label,
          value: options?.value,
        });
      }}
      {...restSelectProps}
    />
  );
};

export default Select;
