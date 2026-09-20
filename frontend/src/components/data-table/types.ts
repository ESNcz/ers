import type { ColumnDef, RowData, SortingState, VisibilityState } from "@tanstack/react-table";
import type { ReactNode } from "react";

/**
 * Filter input rendered in the column header menu.
 * - `text` - case-insensitive "contains" (default)
 * - `select` - multi-select of values, options are generated from the data unless `filterOptions` are set
 * - `number` - min/max range
 * - `date` - date range, column value must be parsable by dayjs
 */
export type DataTableFilterVariant = "text" | "select" | "number" | "date";

export interface DataTableFilterOption {
  value: string;
  label: string;
}

declare module "@tanstack/react-table" {
  // Generic parameters must match the original declaration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Label for menus when `header` is not a string */
    label?: string;
    filterVariant?: DataTableFilterVariant;
    /** Fixed options for the `select` filter, e.g. to give raw values readable labels */
    filterOptions?: DataTableFilterOption[];
  }
}

/** Page size option that shows every row on one page */
export const ALL_ROWS = Number.MAX_SAFE_INTEGER;

export interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- column value types differ per column
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** Shows skeleton rows instead of data */
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  /** Extra controls rendered on the right side of the toolbar */
  toolbarActions?: ReactNode;
  /** Page sizes offered in the footer, use `ALL_ROWS` for "All" */
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  /** Max height of the scrollable body in px, rows are virtualized inside it */
  height?: number;
  /** Row height estimate before rows are measured */
  estimateRowHeight?: number;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  getRowId?: (row: TData, index: number) => string;
}
