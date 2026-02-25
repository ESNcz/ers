"use client";

import { Event, User } from "@/utils/api.schemas";
import { dayMonthYear, isDateString } from "@/utils/time";
import CustomColumnsTBody, {
  ButtonColumn,
  DateColumn,
  SelectColumn,
  TextInputColumn,
} from "@components/shared/CustomColumnsTBody";
import CustomColumnsTHead from "@components/shared/CustomColumnsTHead";
import { Box, Flex, ScrollArea, Table, TextInput } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

/** ---- Dot path utilities ---- */
type IsRecord<T> = T extends object ? (T extends any[] ? false : T extends Date ? false : true) : false;

type DotPrefix<S extends string> = S extends "" ? "" : `.${S}`;

/** Recursively builds "a", "a.b", "a.b.c" keys for object-like fields.
 *  - Skips functions, arrays (treats them as leaves), and Date.
 *  - Handles nullable fields by recursing on NonNullable<T>.
 */
export type DotPaths<T> = T extends Function
  ? never
  : IsRecord<T> extends true
    ? {
        [K in keyof T & string]: NonNullable<T[K]> extends infer V
          ? IsRecord<V> extends true
            ? `${K}` | `${K}${DotPrefix<DotPaths<NonNullable<V>>>}`
            : `${K}`
          : never;
      }[keyof T & string]
    : never;

/** Union type for all column types */
export type CustomColumn = TextInputColumn | ButtonColumn | SelectColumn | DateColumn;

const getNestedValue = <T extends object>(obj: T, path: keyof T | string) => {
  if (!obj) return undefined;

  let value = path
    .toString()
    .split(".")
    // @ts-ignore
    .reduce((val, key) => {
      if (!val) return;
      if (key in val) {
        return val[key as keyof T];
      }
      return;
    }, obj);

  if (path in obj) {
    path = path as keyof T;
    if (isDateString(obj[path])) return dayMonthYear(value);
    if (typeof obj[path] === "boolean") return value ? <IconCheck color="green" /> : <IconX color="red" />;
    if (typeof obj[path] === "object") {
      if (!obj[path]) return;
      return Object.entries(obj[path] as object).map(([key, value]) => {
        if (key === "id") return;
        return (
          <>
            {`${formatNestedText(key)}: ${value}`}
            <br />
          </>
        );
      });
    }
    return value;
  }
  return value ? value : null;
};

const formatNestedText = (column: string): string => {
  return column
    .split(".") // Split by dot notation
    .map(
      (word) =>
        word
          .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between camelCase or PascalCase
          .replace(/_/g, " ") // Replace underscores with spaces (optional)
          .split(" ") // Split into individual words
          .map((subWord) => subWord.charAt(0).toUpperCase() + subWord.slice(1)) // Capitalize each word
          .join(" "), // Join back into a formatted string
    )
    .join(" "); // Join all segments
};

/** Props for the Dynamic Table */
export interface DynamicSearchProps<T> {
  filterData: T[];
  dataColumns: DotPaths<T>[];
  customColumns: CustomColumn[];
}

const DynamicSearch = <T extends User | Event>({ filterData, dataColumns, customColumns }: DynamicSearchProps<T>) => {
  const [searchValue, setSearchValue] = useState<string>("");

  if (!filterData || filterData.length === 0) return <p>No data available.</p>;

  const filteredData =
    filterData &&
    filterData?.filter((item) =>
      dataColumns.some((column) => {
        const value = getNestedValue(item, column)?.toString().toLowerCase();
        return value?.includes(searchValue?.toLowerCase() ?? "");
      }),
    );

  return (
    <Flex direction="column" gap={8}>
      <Box>
        <TextInput
          label="Search Users"
          placeholder="Search Users"
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value.currentTarget.value);
          }}
        />
      </Box>
      <ScrollArea>
        <Table striped highlightOnHover={true}>
          <Table.Thead>
            <Table.Tr>
              {dataColumns.map((column, index) => (
                <Table.Th key={`dynamic-head-column-${index}`}>{formatNestedText(column.toString())}</Table.Th>
              ))}

              <CustomColumnsTHead customColumns={customColumns} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredData.map((row, rowIndex) => (
              <Table.Tr key={`${row.id}-dynamic-body-row-${rowIndex}`}>
                {dataColumns.map((column, colIndex) => (
                  <Table.Td key={`${rowIndex}-dynamic-body-column-${colIndex}`}>{getNestedValue(row, column)}</Table.Td>
                ))}
                <CustomColumnsTBody rowId={row.id.toString()} customColumns={customColumns} />
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Flex>
  );
};

export default DynamicSearch;
