import { ActionIcon, Group, Select, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showRowSelection?: boolean;
  totalRows?: number;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showRowSelection = true,
  totalRows,
}: DataTablePaginationProps<TData>) {
  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm" pt="md">
      <Text size="sm" c="dimmed">
        {showRowSelection && table.getFilteredSelectedRowModel().rows.length > 0
          ? `${table.getFilteredSelectedRowModel().rows.length} of ${totalRows ?? table.getFilteredRowModel().rows.length} row(s) selected`
          : `${table.getFilteredRowModel().rows.length} row(s) total`}
      </Text>

      <Group gap="md" align="center">
        <Group gap="xs" align="center">
          <Text size="sm" c="dimmed">
            Rows
          </Text>
          <Select
            data={pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            value={String(table.getState().pagination.pageSize)}
            onChange={(value) => value && table.setPageSize(Number(value))}
            size="xs"
            w={70}
            allowDeselect={false}
          />
        </Group>

        <Text size="sm" fw={500}>
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </Text>

        <Group gap={4}>
          <ActionIcon
            variant="default"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First page"
          >
            <IconChevronsLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous page"
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next page"
          >
            <IconChevronRight size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Last page"
          >
            <IconChevronsRight size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Group>
  );
}
