import type { Table } from '@tanstack/react-table'
import { Button, Menu, Switch, Text } from '@mantine/core'
import { IconSettings2 } from '@tabler/icons-react'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <Menu shadow="md" width={200} closeOnItemClick={false}>
      <Menu.Target>
        <Button
          variant="default"
          size="sm"
          leftSection={<IconSettings2 size={14} />}
        >
          View
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Toggle columns</Menu.Label>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <Menu.Item key={column.id} closeMenuOnClick={false}>
              <Switch
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
                label={<Text size="sm" tt="capitalize">{column.id}</Text>}
                size="xs"
              />
            </Menu.Item>
          ))}
      </Menu.Dropdown>
    </Menu>
  )
}
