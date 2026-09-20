"use client";

import { Group, MultiSelect, NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconSearch } from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";
import { useMemo } from "react";

import { type DateRangeFilterValue, type NumberRangeFilterValue, getFilterVariant } from "./filter-fns";

interface DataTableColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  label: string;
}

// Dropdowns stay inside the header popover, a portal would count as an outside click and close it
const inPopover = { withinPortal: false } as const;

export function DataTableColumnFilter<TData, TValue>({ column, label }: DataTableColumnFilterProps<TData, TValue>) {
  const variant = getFilterVariant(column);
  const filterValue = column.getFilterValue();

  switch (variant) {
    case "select":
      return <SelectFilter column={column} label={label} />;

    case "number": {
      const [min, max] = (filterValue as NumberRangeFilterValue | undefined) ?? [undefined, undefined];
      const [facetMin, facetMax] = column.getFacetedMinMaxValues() ?? [];
      const toNumber = (value: string | number) => (value === "" ? undefined : Number(value));
      return (
        <Group gap="xs" grow>
          <NumberInput
            size="xs"
            label="Min"
            placeholder={facetMin !== undefined ? String(facetMin) : undefined}
            value={min ?? ""}
            onChange={(value) => column.setFilterValue([toNumber(value), max])}
          />
          <NumberInput
            size="xs"
            label="Max"
            placeholder={facetMax !== undefined ? String(facetMax) : undefined}
            value={max ?? ""}
            onChange={(value) => column.setFilterValue([min, toNumber(value)])}
          />
        </Group>
      );
    }

    case "date":
      return (
        <DatePickerInput
          size="xs"
          type="range"
          label="Between"
          placeholder="Pick dates"
          valueFormat="DD/MM/YYYY"
          clearable
          allowSingleDateInRange
          popoverProps={inPopover}
          value={(filterValue as DateRangeFilterValue | undefined) ?? [null, null]}
          onChange={(value) => column.setFilterValue(value)}
        />
      );

    default:
      return (
        <TextInput
          size="xs"
          aria-label={`Filter ${label}`}
          placeholder="Contains..."
          leftSection={<IconSearch size={14} />}
          value={(filterValue as string | undefined) ?? ""}
          onChange={(event) => column.setFilterValue(event.currentTarget.value)}
          data-autofocus
        />
      );
  }
}

function SelectFilter<TData, TValue>({ column, label }: DataTableColumnFilterProps<TData, TValue>) {
  const fixedOptions = column.columnDef.meta?.filterOptions;
  const uniqueValues = column.getFacetedUniqueValues();

  const options = useMemo(() => {
    if (fixedOptions) return fixedOptions;
    return Array.from(uniqueValues.keys())
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(String)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [fixedOptions, uniqueValues]);

  return (
    <MultiSelect
      size="xs"
      aria-label={`Filter ${label}`}
      placeholder="Any value"
      data={options}
      value={(column.getFilterValue() as string[] | undefined) ?? []}
      onChange={(value) => column.setFilterValue(value)}
      searchable
      clearable
      comboboxProps={inPopover}
      data-autofocus
    />
  );
}
