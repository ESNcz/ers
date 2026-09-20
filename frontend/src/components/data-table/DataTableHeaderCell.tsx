"use client";

import { ActionIcon, Button, Divider, Group, Popover, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconDotsVertical,
  IconEyeOff,
  IconFilter,
  IconFilterOff,
} from "@tabler/icons-react";
import { type Column, type Header, flexRender } from "@tanstack/react-table";

import classes from "./DataTable.module.css";
import { DataTableColumnFilter } from "./DataTableColumnFilter";

export const getColumnLabel = <TData, TValue>(column: Column<TData, TValue>) => {
  const { header, meta } = column.columnDef;
  return meta?.label ?? (typeof header === "string" ? header : column.id);
};

interface DataTableHeaderCellProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function DataTableHeaderCell<TData, TValue>({ header }: DataTableHeaderCellProps<TData, TValue>) {
  const { column } = header;
  if (header.isPlaceholder) return null;

  // Custom header renderers are rendered as they are
  if (typeof column.columnDef.header === "function") {
    return flexRender(column.columnDef.header, header.getContext());
  }

  const label = getColumnLabel(column);
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter();
  const canHide = column.getCanHide();
  const sorted = column.getIsSorted();
  const isFiltered = column.getIsFiltered();

  const SortIcon = sorted === "asc" ? IconArrowUp : IconArrowDown;

  return (
    <Group gap={4} wrap="nowrap" justify="space-between">
      <UnstyledButton
        className={classes.headerLabel}
        onClick={canSort ? column.getToggleSortingHandler() : undefined}
        disabled={!canSort}
        aria-label={canSort ? `Sort by ${label}` : undefined}
      >
        <Text span size="sm" fw={600} truncate>
          {label}
        </Text>
        {sorted && <SortIcon size={14} aria-hidden />}
        {isFiltered && <IconFilter size={14} aria-hidden className={classes.activeIcon} />}
      </UnstyledButton>

      {(canSort || canFilter || canHide) && (
        <Popover position="bottom-end" width={280} shadow="md" trapFocus>
          <Popover.Target>
            <ActionIcon
              variant={sorted || isFiltered ? "light" : "subtle"}
              color={sorted || isFiltered ? undefined : "gray"}
              size="sm"
              aria-label={`${label} column options`}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="sm">
              {canSort && (
                <Stack gap={6}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                    Sort
                  </Text>
                  <Button.Group>
                    <Button
                      size="xs"
                      flex={1}
                      variant={sorted === "asc" ? "filled" : "default"}
                      leftSection={<IconArrowUp size={14} />}
                      onClick={() => column.toggleSorting(false)}
                    >
                      Asc
                    </Button>
                    <Button
                      size="xs"
                      flex={1}
                      variant={sorted === "desc" ? "filled" : "default"}
                      leftSection={<IconArrowDown size={14} />}
                      onClick={() => column.toggleSorting(true)}
                    >
                      Desc
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      disabled={!sorted}
                      onClick={() => column.clearSorting()}
                      aria-label="Clear sorting"
                    >
                      <IconArrowsSort size={14} />
                    </Button>
                  </Button.Group>
                </Stack>
              )}

              {canFilter && (
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                      Filter
                    </Text>
                    {isFiltered && (
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        leftSection={<IconFilterOff size={12} />}
                        onClick={() => column.setFilterValue(undefined)}
                      >
                        Clear
                      </Button>
                    )}
                  </Group>
                  <DataTableColumnFilter column={column} label={label} />
                </Stack>
              )}

              {canHide && (
                <>
                  <Divider />
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    justify="start"
                    leftSection={<IconEyeOff size={14} />}
                    onClick={() => column.toggleVisibility(false)}
                  >
                    Hide column
                  </Button>
                </>
              )}
            </Stack>
          </Popover.Dropdown>
        </Popover>
      )}
    </Group>
  );
}
