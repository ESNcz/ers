import { Badge, Button, Checkbox, Group, Menu, Text } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";

import type { DataTableFilterOption } from "./types";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  options: DataTableFilterOption[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[] | undefined);

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    const filterValues = Array.from(next);
    column?.setFilterValue(filterValues.length ? filterValues : undefined);
  };

  return (
    <Menu shadow="md" width={220} closeOnItemClick={false}>
      <Menu.Target>
        <Button
          variant={selectedValues.size > 0 ? "light" : "default"}
          size="sm"
          leftSection={<IconFilter size={14} />}
          rightSection={
            selectedValues.size > 0 ? (
              <Badge size="xs" circle>
                {selectedValues.size}
              </Badge>
            ) : null
          }
        >
          {title}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          const Icon = option.icon;
          return (
            <Menu.Item key={option.value} onClick={() => toggleValue(option.value)}>
              <Group gap="sm">
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleValue(option.value)}
                  size="xs"
                  readOnly
                  tabIndex={-1}
                  styles={{ input: { cursor: "pointer" } }}
                />
                {Icon && <Icon className="" style={{ width: 16, height: 16 }} />}
                <Text size="sm">{option.label}</Text>
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
