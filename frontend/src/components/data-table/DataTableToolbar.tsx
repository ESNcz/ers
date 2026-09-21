"use client";

import { Button, CloseButton, Group, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconFilterOff, IconSearch } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { type ReactNode, useState } from "react";

import { DataTableColumnsMenu } from "./DataTableColumnsMenu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onResetFilters: () => void;
  searchPlaceholder: string;
  actions?: ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  onResetFilters,
  searchPlaceholder,
  actions,
}: DataTableToolbarProps<TData>) {
  const [search, setSearch] = useState(globalFilter);
  const applySearch = useDebouncedCallback((value: string) => table.setGlobalFilter(value), 250);

  const activeFilterCount = table.getState().columnFilters.length + (globalFilter ? 1 : 0);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    applySearch(value);
  };

  const handleReset = () => {
    applySearch.cancel();
    setSearch("");
    onResetFilters();
  };

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
      <Group gap="sm" wrap="wrap" flex={1}>
        <TextInput
          size="sm"
          w={{ base: "100%", sm: 320 }}
          aria-label="Quick search"
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          rightSection={
            search ? <CloseButton size="sm" aria-label="Clear search" onClick={() => handleSearchChange("")} /> : null
          }
          value={search}
          onChange={(event) => handleSearchChange(event.currentTarget.value)}
        />
        {activeFilterCount > 0 && (
          <Button size="sm" variant="subtle" leftSection={<IconFilterOff size={16} />} onClick={handleReset}>
            Clear filters ({activeFilterCount})
          </Button>
        )}
      </Group>
      <Group gap="sm">
        {actions}
        <DataTableColumnsMenu table={table} />
      </Group>
    </Group>
  );
}
