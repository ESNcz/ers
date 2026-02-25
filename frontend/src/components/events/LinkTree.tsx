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
import { ActionIcon, Button, Flex, TextInput } from "@mantine/core";
import { IconGripVertical, IconLinkPlus, IconTrash } from "@tabler/icons-react";
import React from "react";

export interface LinkItem {
  customId: string;
  name: string;
  link: string;
  id?: number | null;
}

interface SortableLinkItemProps {
  item: LinkItem;
  index: number;
  onRemove: (id: string) => void;
  onChange: (index: number, field: "name" | "link", value: string) => void;
}

const SortableLinkItem = ({ item, index, onRemove, onChange }: SortableLinkItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.customId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Flex ref={setNodeRef} style={style} w="100%" gap={16} align="flex-end">
      <Flex
        {...attributes}
        {...listeners}
        h={36}
        w={36}
        justify="center"
        align="center"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <IconGripVertical size={20} />
      </Flex>
      <Flex direction={{ base: "column", md: "row" }} w="100%" gap={{ base: 8, md: 16 }}>
        <TextInput
          label="Name"
          placeholder="ERS link"
          w="100%"
          value={item.name}
          onChange={(event) => {
            onChange(index, "name", event.currentTarget.value);
          }}
        />
        <TextInput
          label="URL"
          placeholder="https://www.ers.cz/"
          w="100%"
          value={item.link}
          onChange={(event) => {
            onChange(index, "link", event.currentTarget.value);
          }}
        />
      </Flex>
      <Flex w="fit-content" justify="center" align="center" h={36}>
        <ActionIcon onClick={() => onRemove(item.customId)} variant="light" color="red" size="lg">
          <IconTrash />
        </ActionIcon>
      </Flex>
    </Flex>
  );
};

interface LinkTreeProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

const LinkTree = ({ links, onChange }: LinkTreeProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.customId === active.id);
      const newIndex = links.findIndex((item) => item.customId === over.id);

      onChange(arrayMove(links, oldIndex, newIndex));
    }
  };

  const handleAddNewLink = () => {
    onChange([
      ...links,
      {
        customId: crypto.randomUUID(),
        id: null,
        name: "",
        link: "",
      },
    ]);
  };

  const handleRemoveLink = (customId: string) => {
    onChange(links.filter((link) => link.customId !== customId));
  };

  const handleLinkChange = (index: number, field: "name" | "link", value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange(newLinks);
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((link) => link.customId)} strategy={verticalListSortingStrategy}>
          <Flex direction="column" gap={8} w="100%">
            {links.map((value, index) => (
              <SortableLinkItem
                key={`sortable-link-item-${value.customId}-${index}`}
                item={value}
                index={index}
                onRemove={handleRemoveLink}
                onChange={handleLinkChange}
              />
            ))}
          </Flex>
        </SortableContext>
      </DndContext>
      <Flex justify="center" align="center" mt={16}>
        <Button leftSection={<IconLinkPlus />} onClick={handleAddNewLink} variant="light">
          Add new link
        </Button>
      </Flex>
    </>
  );
};

export default LinkTree;
