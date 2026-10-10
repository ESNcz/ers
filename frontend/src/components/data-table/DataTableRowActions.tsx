"use client";

import { ActionIcon, Flex, type MantineColor, Menu, Text } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { ReactNode } from "react";

export interface DataTableRowAction {
  label: string;
  icon: ReactNode;
  color?: MantineColor;
  /** Renders the item as a link instead of a button */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Small text under the label, e.g. why the action is disabled */
  hint?: string;
  /** Leaves the item out, e.g. when the user lacks the permission */
  hidden?: boolean;
}

interface DataTableRowActionsProps {
  actions: DataTableRowAction[];
  /** `aria-label` of the menu button */
  label?: string;
}

/** Single button opening a menu with the row actions */
export function DataTableRowActions({ actions, label = "Row operations" }: DataTableRowActionsProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  if (visibleActions.length === 0) return null;

  return (
    <Flex justify="center">
      <Menu position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" size={36} aria-label={label}>
            <IconDotsVertical width={20} height={20} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {visibleActions.map((action) => {
            const content = (
              <>
                <Text size="sm">{action.label}</Text>
                {action.hint && (
                  <Text size="xs" c="dimmed">
                    {action.hint}
                  </Text>
                )}
              </>
            );

            return action.href ? (
              <Menu.Item
                key={action.label}
                component={Link}
                href={action.href}
                color={action.color}
                leftSection={action.icon}
                disabled={action.disabled}
              >
                {content}
              </Menu.Item>
            ) : (
              <Menu.Item
                key={action.label}
                color={action.color}
                leftSection={action.icon}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {content}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
}

const ACTIONS_COLUMN_WIDTH = 90;

/** Fixed width actions column rendering `DataTableRowActions` with the actions returned for each row */
export const rowActionsColumn = <TData,>(
  getActions: (row: TData) => DataTableRowAction[],
  label?: string,
): ColumnDef<TData> => ({
  id: "actions",
  header: "Actions",
  minSize: ACTIONS_COLUMN_WIDTH,
  maxSize: ACTIONS_COLUMN_WIDTH,
  enableSorting: false,
  enableHiding: false,
  enableGlobalFilter: false,
  enableResizing: false,
  cell: ({ row }) => <DataTableRowActions actions={getActions(row.original)} label={label} />,
});
