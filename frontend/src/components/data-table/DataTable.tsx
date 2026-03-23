import { useDataTable } from "@/utils/useDataTable";
import { Stack, Table, Text } from "@mantine/core";
import { flexRender } from "@tanstack/react-table";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableProps } from "./types";

export function DataTable<TData>({
  columns,
  data,
  globalFilterFn,
  facetedFilters,
  enableRowSelection = false,
  enablePagination = true,
  enableVirtualization = false,
  pageSize = 10,
  pageSizeOptions,
  toolbar: customToolbar,
  emptyMessage = "No results found.",
  className,
  initialSorting,
  initialColumnFilters,
  initialColumnVisibility,
}: DataTableProps<TData>) {
  const { table, globalFilter, setGlobalFilter, resetFilters } = useDataTable({
    data,
    columns,
    globalFilterFn,
    enableRowSelection,
    enablePagination: enablePagination,
    pageSize,
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
  });

  return (
    <Stack gap="md" className={className}>
      {/*Toolbar */}
      {customToolbar ? (
        customToolbar(table)
      ) : (
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          facetedFilters={facetedFilters}
          onResetFilters={resetFilters}
        />
      )}

      <Table.ScrollContainer minWidth={600}>
        <Table withTableBorder withColumnBorders withRowBorders striped highlightOnHover style={{ textAlign: "left" }}>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id} bg={row.getIsSelected() ? "var(--mantine-primary-color-light)" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length} style={{ textAlign: "center", height: 96 }}>
                  <Text c="dimmed">{emptyMessage}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination */}
      {enablePagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} showRowSelection={enableRowSelection} />
      )}
    </Stack>
  );
}
