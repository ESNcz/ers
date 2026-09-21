"use client";

import { Box, Skeleton, Stack, Table, Text } from "@mantine/core";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import classes from "./DataTable.module.css";
import { DataTableHeaderCell } from "./DataTableHeaderCell";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { ALL_ROWS, type DataTableProps } from "./types";
import { useDataTable } from "./useDataTable";

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 250, ALL_ROWS];
const SKELETON_ROWS = 6;

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
  toolbarActions,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  defaultPageSize = 50,
  height = 640,
  estimateRowHeight = 52,
  initialSorting,
  initialColumnVisibility,
  getRowId,
}: DataTableProps<TData>) {
  const { table, globalFilter, resetFilters } = useDataTable({
    columns,
    data,
    defaultPageSize,
    initialSorting,
    initialColumnVisibility,
    getRowId,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  // Only rows inside the scroll viewport are rendered, so large pages stay fast.
  // Rows are measured after render because cells can wrap or hold buttons.
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    getItemKey: (index) => rows[index].id,
    overscan: 8,
  });

  const { pagination, sorting, columnFilters } = table.getState();
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, globalFilter]);

  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <Stack gap="sm">
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        onResetFilters={resetFilters}
        searchPlaceholder={searchPlaceholder}
        actions={toolbarActions}
      />

      <Box ref={scrollRef} className={classes.scroll} mah={height}>
        <Table
          stickyHeader
          highlightOnHover
          withColumnBorders
          layout="fixed"
          className={classes.table}
          style={{ minWidth: table.getTotalSize() }}
          aria-busy={loading}
        >
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={classes.headerCell}
                    style={{ width: header.getSize() }}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    <DataTableHeaderCell header={header} />
                    <div
                      className={classes.resizer}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() => header.column.resetSize()}
                    />
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <Table.Tr key={`skeleton-${index}`}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <Table.Td key={column.id}>
                      <Skeleton height={16} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={visibleColumnCount} className={classes.empty}>
                  <Text c="dimmed">{emptyMessage}</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr aria-hidden>
                    <td colSpan={visibleColumnCount} style={{ height: paddingTop, padding: 0 }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <Table.Tr
                      key={row.id}
                      ref={virtualizer.measureElement}
                      data-index={virtualRow.index}
                      data-odd={virtualRow.index % 2 === 1 || undefined}
                      className={classes.row}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Table.Td key={cell.id} title={String(cell.getValue() ?? "")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr aria-hidden>
                    <td colSpan={visibleColumnCount} style={{ height: paddingBottom, padding: 0 }} />
                  </tr>
                )}
              </>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {!loading && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
    </Stack>
  );
}
