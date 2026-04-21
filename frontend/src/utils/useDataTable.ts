"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  globalFilterFn?: FilterFn<TData>;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  manualPagination?: boolean;
  pageCount?: number;
  paginationState?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
}

export function useDataTable<TData>({
  data,
  columns,
  globalFilterFn,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  manualPagination = false,
  pageCount,
  paginationState,
  onPaginationChange,
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fallback internal pagination when the consumer doesn't provide controlled state
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const isControlled = paginationState !== undefined;
  const currentPagination = isControlled ? paginationState! : internalPagination;

  // Workaround for TanStack Table bug where pageIndex can momentarily become -1
  // during data refetches (see https://github.com/TanStack/table/issues/4271).
  // We clamp it to the previous valid value before propagating.
  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === "function" ? updater(currentPagination) : updater;
      console.log("[useDataTable] pagination change", { current: currentPagination, next, isControlled });
      const safe: PaginationState = {
        pageIndex: next.pageIndex < 0 ? currentPagination.pageIndex : next.pageIndex,
        pageSize: next.pageSize,
      };
      if (isControlled) {
        onPaginationChange?.(safe);
      } else {
        setInternalPagination(safe);
        onPaginationChange?.(safe);
      }
    },
    [currentPagination, isControlled, onPaginationChange],
  );

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(enablePagination ? { pagination: currentPagination } : {}),
    },

    // Disable automatic resets to maintain user context when applying filters, sorting, or selecting rows
    autoResetPageIndex: false,
    autoResetExpanded: false,

    enableRowSelection,
    globalFilterFn: globalFilterFn ?? "includesString",
    getColumnCanGlobalFilter: (column) => column.columnDef.enableGlobalFilter !== false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    ...(enablePagination ? { onPaginationChange: handlePaginationChange } : {}),
    ...(enablePagination && manualPagination ? { manualPagination: true, pageCount: pageCount ?? -1 } : {}),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(enablePagination && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Ensures that focusing on the search input or applying filters returns to the first page
  useEffect(() => {
    if (!enablePagination || manualPagination) return;
    const filteredCount = table.getFilteredRowModel().rows.length;
    const start = currentPagination.pageIndex * currentPagination.pageSize;
    if (filteredCount > 0 && start >= filteredCount) {
      handlePaginationChange({ ...currentPagination, pageIndex: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, columnFilters]);

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);

  const resetAll = useCallback(() => {
    setSorting(initialSorting);
    setColumnFilters(initialColumnFilters);
    setColumnVisibility(initialColumnVisibility);
    setRowSelection({});
    setGlobalFilter("");
  }, [initialSorting, initialColumnFilters, initialColumnVisibility]);

  return {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    resetAll,
  };
}
