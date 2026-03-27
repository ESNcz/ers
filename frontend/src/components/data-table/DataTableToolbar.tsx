import { Button, Group, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";

import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableViewOptions } from "./DataTableViewOptions";
import type { DataTableFacetedFilterConfig } from "./types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  searchPlaceholder?: string;
  facetedFilters?: DataTableFacetedFilterConfig[];
  onResetFilters?: () => void;
  extraActions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search...",
  facetedFilters = [],
  onResetFilters,
  extraActions,
}: DataTableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = useState(globalFilter);
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  const debouncedUpdate = useCallback(
    (value: string) => {
      const id = setTimeout(() => onGlobalFilterChange(value), 300);
      return () => clearTimeout(id);
    },
    [onGlobalFilterChange],
  );

  useEffect(() => {
    const cleanup = debouncedUpdate(localSearch);
    return cleanup;
  }, [localSearch, debouncedUpdate]);

  useEffect(() => {
    setLocalSearch(globalFilter);
  }, [globalFilter]);

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
      <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
        <TextInput
          placeholder={searchPlaceholder}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          size="sm"
          style={{ minWidth: 500, maxWidth: 700 }}
        />

        {facetedFilters.map((filter) => (
          <DataTableFacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)}
            title={filter.title}
            options={filter.options}
          />
        ))}

        {isFiltered && (
          <Button
            variant="subtle"
            size="xs"
            onClick={() => {
              onResetFilters?.();
              setLocalSearch("");
            }}
            rightSection={<IconX size={14} />}
          >
            Reset
          </Button>
        )}
      </Group>

      <Group gap="sm">
        {extraActions}
        <DataTableViewOptions table={table} />
      </Group>
    </Group>
  );
}
