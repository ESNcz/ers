import { Group, UnstyledButton } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconArrowsSort, IconEyeOff } from "@tabler/icons-react";
import { type Column } from "@tanstack/react-table";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({ column, title }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Group gap={4} wrap="nowrap">
      <UnstyledButton
        onClick={() => column.getCanSort() && column.toggleSorting()}
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        <span>{title}</span>
        {column.getCanSort() && (
          <>
            {sorted === "asc" ? (
              <IconArrowUp size={14} />
            ) : sorted === "desc" ? (
              <IconArrowDown size={14} />
            ) : (
              <IconArrowsSort size={14} style={{ opacity: 0.5 }} />
            )}
          </>
        )}
      </UnstyledButton>
      {column.getCanHide() && (
        <UnstyledButton
          onClick={() => column.toggleVisibility(false)}
          style={{ opacity: 0, transition: "opacity 150ms" }}
          className="group-hover-visible"
          title={`Hide ${title}`}
        >
          <IconEyeOff size={14} />
        </UnstyledButton>
      )}
    </Group>
  );
}
