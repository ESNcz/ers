import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Group, Input, Paper, Stack, Text } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface SortableOptionProps {
  option: string;
  position: number;
}

const SortableOption = ({ option, position }: SortableOptionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: option });

  return (
    <Paper
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      withBorder
      p="xs"
      shadow="xs"
    >
      <Group wrap="nowrap" gap="xs">
        {/* `touchAction` keeps touch drags from scrolling the modal instead */}
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={`Move ${option}, priority ${position}`}
          style={{ cursor: "grab", touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={18} />
        </ActionIcon>
        <Text size="sm" fw={600}>
          {position}
        </Text>
        <Text size="sm" style={{ flex: 1 }}>
          {option}
        </Text>
      </Group>
    </Paper>
  );
};

interface PriorityListInputProps {
  label: string;
  description?: string;
  withAsterisk: boolean;
  error?: ReactNode;
  /** Options in priority order, the first one is the most wanted */
  value?: string[];
  onChange: (value: string[]) => void;
}

const PriorityListInput = ({
  label,
  description,
  withAsterisk,
  error,
  value = [],
  onChange,
}: PriorityListInputProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, value.indexOf(String(active.id)), value.indexOf(String(over.id))));
  };

  return (
    <Input.Wrapper label={label} description={description} withAsterisk={withAsterisk} error={error}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <Stack gap="xs" mt={4}>
            {value.map((option, index) => (
              <SortableOption key={option} option={option} position={index + 1} />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Input.Wrapper>
  );
};

export default PriorityListInput;
