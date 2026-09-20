"use client";

import {
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type Updater,
  type VisibilityState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import { quickSearchFilterFn, withDefaultFilterFns } from "./filter-fns";
import type { DataTableProps } from "./types";

type UseDataTableOptions<TData> = Pick<
  DataTableProps<TData>,
  "columns" | "data" | "defaultPageSize" | "initialSorting" | "initialColumnVisibility" | "getRowId"
>;

export function useDataTable<TData>({
  columns,
  data,
  defaultPageSize = 50,
  initialSorting = [],
  initialColumnVisibility = {},
  getRowId,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: defaultPageSize });

  // Automatic page reset is off so row updates (e.g. an edited cell) keep the current page.
  // Changing what is shown or its order starts from the first page instead.
  const withPageReset = useCallback(
    <T>(setter: Dispatch<SetStateAction<T>>) =>
      (updater: Updater<T>) => {
        setter(updater);
        setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));
      },
    [],
  );

  const tableColumns = useMemo(() => withDefaultFilterFns(columns), [columns]);

  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    state: { sorting, columnFilters, columnVisibility, globalFilter, pagination },
    getRowId,
    autoResetPageIndex: false,
    onSortingChange: withPageReset(setSorting),
    onColumnFiltersChange: withPageReset(setColumnFilters),
    onGlobalFilterChange: withPageReset(setGlobalFilter),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    globalFilterFn: quickSearchFilterFn as FilterFn<TData>,
    // Quick search looks only at visible data columns
    getColumnCanGlobalFilter: (column) =>
      column.columnDef.enableGlobalFilter !== false && !!column.accessorFn && column.getIsVisible(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  // Keep the page in range when rows disappear (deleted rows, narrower filter)
  const pageCount = table.getPageCount();
  useEffect(() => {
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount) {
      setPagination((current) => ({ ...current, pageIndex: Math.max(0, pageCount - 1) }));
    }
  }, [pageCount, pagination.pageIndex]);

  const resetFilters = useCallback(() => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  }, [table]);

  return { table, globalFilter, resetFilters };
}
