import { Checkbox } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";

export const SELECTION_COLUMN_ID = "select";

/** Checkbox column for row selection, the header checkbox toggles all rows matching the current filters */
export const selectionColumn = <TData,>(): ColumnDef<TData> => ({
  id: SELECTION_COLUMN_ID,
  minSize: 48,
  maxSize: 48,
  enableSorting: false,
  enableHiding: false,
  enableColumnFilter: false,
  enableGlobalFilter: false,
  enableResizing: false,
  meta: { label: "Select" },
  header: ({ table }) => (
    <Checkbox
      size="sm"
      aria-label="Select all rows"
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      size="sm"
      aria-label="Select row"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
});
