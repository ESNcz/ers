"use client";

import { Badge, Button, Checkbox, Menu } from "@mantine/core";
import { IconColumns3 } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { getColumnLabel } from "./DataTableHeaderCell";

interface DataTableColumnsMenuProps<TData> {
  table: Table<TData>;
}

export function DataTableColumnsMenu<TData>({ table }: DataTableColumnsMenuProps<TData>) {
  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  if (hideableColumns.length === 0) return null;

  const hiddenCount = hideableColumns.filter((column) => !column.getIsVisible()).length;

  return (
    <Menu shadow="md" width={220} position="bottom-end" closeOnItemClick={false}>
      <Menu.Target>
        <Button
          variant="default"
          size="sm"
          leftSection={<IconColumns3 size={16} />}
          rightSection={
            hiddenCount > 0 ? (
              <Badge size="xs" circle>
                {hiddenCount}
              </Badge>
            ) : null
          }
        >
          Columns
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Visible columns</Menu.Label>
        {hideableColumns.map((column) => (
          <Menu.Item key={column.id} onClick={() => column.toggleVisibility()}>
            <Checkbox
              size="xs"
              label={getColumnLabel(column)}
              checked={column.getIsVisible()}
              readOnly
              tabIndex={-1}
              styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
            />
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item disabled={hiddenCount === 0} onClick={() => table.resetColumnVisibility(true)}>
          Show all
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
