import { Checkbox } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "./DataTableColumnHeader";

export interface ColumnConfig<TData> {
  /** Data accessor key (e.g. "title", "email"). Omit for custom columns (actions, etc.) */
  accessor?: keyof TData & string;
  /** Custom accessor function for nested data (e.g. (row) => row.user.email) */
  accessorFn?: (row: TData) => unknown;
  /** Unique column ID. Defaults to accessor */
  id?: string;
  /** Header title displayed in the table */
  header: string;
  /** Column width in px */
  width?: number;
  /** Minimum column width in px */
  minWidth?: number;
  /** Custom cell renderer. Receives the full row data */
  render?: (row: TData) => React.ReactNode;
  /** Enable sorting on this column (default: true if accessor is set) */
  enableSorting?: boolean;
  /** Allow hiding this column (default: true) */
  enableHiding?: boolean;
  /** Custom filter function for faceted filters */
  filterFn?: ColumnDef<TData>["filterFn"];
  /** Include in global search (default: true if accessor is set) */
  enableGlobalFilter?: boolean;
}

export interface CreateColumnsOptions {
  /** Add a selection column (checkbox) as the first column */
  enableRowSelection?: boolean;
}

/**
 * Creates TanStack columns from a simplified config.
 *
 * @example
 * const columns = createColumns<Event>([
 *   { accessor: "title", header: "Event Name", width: 148 },
 *   { accessor: "visible", header: "Published?", width: 56, render: (row) => row.visible ? <IconCheck /> : <IconX /> },
 *   { id: "actions", header: "Operations", width: 200, render: (row) => <ActionButtons event={row} /> },
 * ])
 */
export function createColumns<TData>(
  configs: ColumnConfig<TData>[],
  options?: CreateColumnsOptions,
): ColumnDef<TData>[] {
  const columns: ColumnDef<TData>[] = [];

  // Selection column
  if (options?.enableRowSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all"
          size="xs"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          size="xs"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    });
  }

  // User-defined columns
  for (const config of configs) {
    const columnId = config.id ?? config.accessor;
    if (!columnId) {
      throw new Error('Column must have either "accessor" or "id"');
    }

    const hasAccessor = !!config.accessor || !!config.accessorFn;

    const columnDef: ColumnDef<TData> = {
      ...(config.accessor ? { accessorKey: config.accessor } : {}),
      ...(config.accessorFn ? { accessorFn: config.accessorFn } : {}),
      id: columnId,
      header: ({ column }) => <DataTableColumnHeader column={column} title={config.header} />,
      enableSorting: config.enableSorting ?? hasAccessor,
      enableHiding: config.enableHiding ?? true,
      ...(config.width ? { size: config.width } : {}),
      ...(config.minWidth ? { minSize: config.minWidth } : {}),
      ...(config.filterFn ? { filterFn: config.filterFn } : {}),
      enableGlobalFilter: config.enableGlobalFilter ?? hasAccessor,
    };

    // Custom render or default (raw value)
    if (config.render) {
      columnDef.cell = ({ row }) => config.render!(row.original);
    }

    columns.push(columnDef);
  }

  return columns;
}
