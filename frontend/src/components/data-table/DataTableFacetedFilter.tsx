import type { Column } from '@tanstack/react-table'
import { Button, Checkbox, Menu, Badge, Group, Text } from '@mantine/core'
import { IconFilter, IconX } from '@tabler/icons-react'
import type { DataTableFilterOption } from './types'

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title: string
  options: DataTableFilterOption[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[] | undefined)

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    const filterValues = Array.from(next)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
  }

  return (
    <Menu shadow="md" width={220} closeOnItemClick={false}>
      <Menu.Target>
        <Button
          variant={selectedValues.size > 0 ? 'light' : 'default'}
          size="sm"
          leftSection={<IconFilter size={14} />}
          rightSection={
            selectedValues.size > 0 ? (
              <Badge size="xs" circle>
                {selectedValues.size}
              </Badge>
            ) : null
          }
        >
          {title}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {selectedValues.size > 0 && (
          <>
            <Menu.Item
              leftSection={<IconX size={14} />}
              onClick={() => column?.setFilterValue(undefined)}
            >
              <Text size="sm" c="dimmed">Clear filters</Text>
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value)
          const Icon = option.icon
          return (
            <Menu.Item
              key={option.value}
              onClick={() => toggleValue(option.value)}
            >
              <Group gap="sm">
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleValue(option.value)}
                  size="xs"
                  readOnly
                  tabIndex={-1}
                  styles={{ input: { cursor: 'pointer' } }}
                />
                {Icon && <Icon className="" style={{ width: 16, height: 16 }} />}
                <Text size="sm">{option.label}</Text>
              </Group>
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
