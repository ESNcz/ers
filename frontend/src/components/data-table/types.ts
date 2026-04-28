import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export interface DataTableFacetedFilterConfig {
  columnId: string;
  title: string;
  options: DataTableFilterOption[];
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  globalFilterFn?: FilterFn<TData>;
  searchableColumns?: { id: string; placeholder?: string }[];
  facetedFilters?: DataTableFacetedFilterConfig[];
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  enableVirtualization?: boolean;
  virtualRowHeight?: number;
  virtualContainerHeight?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  manualPagination?: boolean;
  pageCount?: number;
  totalRows?: number;
  paginationState?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowSelectionChange?: (rows: Row<TData>[]) => void;
  toolbar?: (table: Table<TData>) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
}
