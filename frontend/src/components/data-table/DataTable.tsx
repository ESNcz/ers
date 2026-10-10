"use client";

import { ActionBar, Box, Skeleton, Stack, Table, Text } from "@mantine/core";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import classes from "./DataTable.module.css";
import { DataTableColumnResizer } from "./DataTableColumnResizer";
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
  selectionActions,
}: DataTableProps<TData>) {
  const { table, globalFilter, resetFilters } = useDataTable({
    columns,
    data,
    defaultPageSize,
    initialSorting,
    initialColumnVisibility,
    getRowId,
    enableRowSelection: !!selectionActions,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const visibleColumnCount = visibleColumns.length;
  // Every row is its own grid with the same columns, sized only from the column sizes - never from cell content,
  // so rows stay aligned even though only the rows in view are rendered. Columns grow to fill the free space
  // with `getSize()` as their minimum, except columns capped by `maxSize` and columns the user resized.
  const { columnSizing } = table.getState();
  const gridTemplateColumns = visibleColumns
    .map((column) => {
      const width = column.getSize();
      const isFixed = column.id in columnSizing || width >= (column.columnDef.maxSize ?? Infinity);
      return isFixed ? `${width}px` : `minmax(${width}px, 1fr)`;
    })
    .join(" ");
  // Rows hidden by filters stay selected but are left out, so actions apply only to what is visible
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const clearSelection = () => table.resetRowSelection(true);

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
          verticalSpacing={7}
          horizontalSpacing={10}
          className={classes.table}
          style={{ minWidth: table.getTotalSize(), "--data-table-columns": gridTemplateColumns }}
          role="table"
          aria-busy={loading}
        >
          <Table.Thead role="rowgroup">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={classes.headerCell}
                    role="columnheader"
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    <DataTableHeaderCell header={header} />
                    {header.column.getCanResize() && <DataTableColumnResizer header={header} />}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody role="rowgroup">
            {loading ? (
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <Table.Tr key={`skeleton-${index}`} role="row">
                  {visibleColumns.map((column) => (
                    <Table.Td key={column.id} role="cell">
                      <Skeleton height={16} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : rows.length === 0 ? (
              <Table.Tr role="row">
                <Table.Td colSpan={visibleColumnCount} className={`${classes.fullRow} ${classes.empty}`} role="cell">
                  <Text c="dimmed">{emptyMessage}</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr aria-hidden className={classes.spacer}>
                    <td colSpan={visibleColumnCount} className={classes.fullRow} style={{ height: paddingTop }} />
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
                      data-selected={row.getIsSelected() || undefined}
                      className={classes.row}
                      role="row"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Table.Td key={cell.id} title={String(cell.getValue() ?? "")} role="cell">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr aria-hidden className={classes.spacer}>
                    <td colSpan={visibleColumnCount} className={classes.fullRow} style={{ height: paddingBottom }} />
                  </tr>
                )}
              </>
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {!loading && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}

      {selectionActions && (
        <ActionBar
          opened={selectedRows.length > 0}
          onClose={clearSelection}
          closeOnEscape
          aria-label="Selected rows actions"
        >
          <Text size="sm" fw={500} px="xs">
            {selectedRows.length} selected
          </Text>
          <ActionBar.Divider />
          {selectionActions(selectedRows, clearSelection)}
          <ActionBar.Divider />
          <ActionBar.CloseButton aria-label="Clear selection" />
        </ActionBar>
      )}
    </Stack>
  );
}
