import type { Column, ColumnDef, FilterFn, RowData } from "@tanstack/react-table";
import dayjs from "dayjs";

import type { DataTableFilterVariant } from "./types";

export type NumberRangeFilterValue = [number | undefined, number | undefined];
export type DateRangeFilterValue = [string | null, string | null];

const toSearchableString = (value: unknown) => (value === null || value === undefined ? "" : String(value));

const isEmptyRange = (value: unknown) =>
  !Array.isArray(value) || value.every((part) => part === null || part === undefined || part === "");

export const textFilterFn: FilterFn<RowData> = (row, columnId, value: string) =>
  toSearchableString(row.getValue(columnId)).toLowerCase().includes(value.toLowerCase());
textFilterFn.autoRemove = (value) => !value;

export const selectFilterFn: FilterFn<RowData> = (row, columnId, value: string[]) =>
  value.includes(toSearchableString(row.getValue(columnId)));
selectFilterFn.autoRemove = (value) => !Array.isArray(value) || value.length === 0;

export const numberRangeFilterFn: FilterFn<RowData> = (row, columnId, [min, max]: NumberRangeFilterValue) => {
  const raw = row.getValue(columnId);
  if (raw === null || raw === undefined || raw === "") return false;
  const value = Number(raw);
  if (Number.isNaN(value)) return false;
  return (min === undefined || value >= min) && (max === undefined || value <= max);
};
numberRangeFilterFn.autoRemove = isEmptyRange;

export const dateRangeFilterFn: FilterFn<RowData> = (row, columnId, [from, to]: DateRangeFilterValue) => {
  const raw = row.getValue(columnId);
  if (!raw) return false;
  const date = dayjs(raw as string | Date);
  if (!date.isValid()) return false;
  if (from && date.isBefore(dayjs(from).startOf("day"))) return false;
  if (to && date.isAfter(dayjs(to).endOf("day"))) return false;
  return true;
};
dateRangeFilterFn.autoRemove = isEmptyRange;

/** Quick search - matches any searchable column containing the text */
export const quickSearchFilterFn: FilterFn<RowData> = (row, columnId, value: string) =>
  toSearchableString(row.getValue(columnId)).toLowerCase().includes(value.trim().toLowerCase());

const filterFnByVariant: Record<DataTableFilterVariant, FilterFn<RowData>> = {
  text: textFilterFn,
  select: selectFilterFn,
  number: numberRangeFilterFn,
  date: dateRangeFilterFn,
};

export const getFilterVariant = <TData, TValue>(column: Column<TData, TValue>): DataTableFilterVariant =>
  column.columnDef.meta?.filterVariant ?? "text";

/** Gives every column without its own `filterFn` the one matching its filter variant */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- column value types differ per column
export const withDefaultFilterFns = <TData>(columns: ColumnDef<TData, any>[]): ColumnDef<TData, any>[] =>
  columns.map((column) =>
    column.filterFn
      ? column
      : { ...column, filterFn: filterFnByVariant[column.meta?.filterVariant ?? "text"] as FilterFn<TData> },
  );
