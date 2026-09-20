"use client";

import { Group, Pagination, Select, Text } from "@mantine/core";
import type { Table } from "@tanstack/react-table";

import { ALL_ROWS } from "./types";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions: number[];
}

export function DataTablePagination<TData>({ table, pageSizeOptions }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = table.getCoreRowModel().rows.length;
  const pageCount = table.getPageCount();

  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(filteredCount, (pageIndex + 1) * pageSize);

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
      <Text size="sm" c="dimmed" className="tabular-nums" aria-live="polite">
        {filteredCount === 0 ? "No rows" : `${from}–${to} of ${filteredCount}`}
        {filteredCount !== totalCount && ` (filtered from ${totalCount})`}
      </Text>

      <Group gap="md" wrap="wrap">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Rows per page
          </Text>
          <Select
            size="xs"
            w={80}
            aria-label="Rows per page"
            allowDeselect={false}
            data={pageSizeOptions.map((size) => ({
              value: String(size),
              label: size === ALL_ROWS ? "All" : String(size),
            }))}
            value={String(pageSize)}
            onChange={(value) => {
              if (!value) return;
              table.setPagination({ pageIndex: 0, pageSize: Number(value) });
            }}
          />
        </Group>
        {pageCount > 1 && (
          <Pagination
            size="sm"
            total={pageCount}
            value={pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
            withEdges
            siblings={1}
          />
        )}
      </Group>
    </Group>
  );
}
