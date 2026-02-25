import { useUpdatePriorities } from "@/utils/api";
import { EventApplicationDetailedWithApplications, OrganizationMemberWithoutUser, User } from "@/utils/api.schemas";
import { isUserAdmin } from "@/utils/checkPermissions";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Button, Group, Modal, Paper, Select, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconGripVertical } from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";

interface PriorityListModalProps {
  isOpened: boolean;
  closeModal: () => void;
  eventApplications: EventApplicationDetailedWithApplications[];
  userOrganisationMemberships: OrganizationMemberWithoutUser[];
  currentUser: User;
  onSuccess: () => void;
}

interface SortableItemProps {
  id: number;
  application: EventApplicationDetailedWithApplications;
}

const SortableItem = ({ id, application }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, index } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p="sm" shadow="xs" {...attributes}>
      <Group>
        <ActionIcon variant="subtle" color="gray" {...listeners}>
          <IconGripVertical size={18} />
          {index + 1}
        </ActionIcon>
        <Text size="sm" style={{ flex: 1 }}>
          {application.user.firstName} {application.user.lastName} ({application.user.username})
        </Text>
        {application.priority && (
          <Text size="xs" c="dimmed">
            Previous priority: {application.priority}
          </Text>
        )}
      </Group>
    </Paper>
  );
};

const PriorityListModal = ({
  isOpened,
  closeModal,
  eventApplications,
  userOrganisationMemberships,
  currentUser,
  onSuccess,
}: PriorityListModalProps) => {
  const isAdmin = isUserAdmin(currentUser.role);

  /**
   * For admin, we want to show all organisations that have applications for this event
   * For organisation managers we want to show only applications from organisations that they manage
   **/
  const relevantOrganizations = useMemo(() => {
    if (isAdmin) {
      const organizationMap = new Map<string, string>();
      eventApplications.forEach((application) => {
        if (application.organization) {
          organizationMap.set(application.organization.id, application.organization.name);
        }
      });
      return Array.from(organizationMap.entries()).map(([id, name]) => ({ value: id, label: name }));
    }

    return userOrganisationMemberships
      .filter((m) => m.organization.manager?.id === currentUser.id)
      .map((m) => ({
        value: m.organization.id,
        label: m.organization.name,
      }));
  }, [userOrganisationMemberships, currentUser, eventApplications, isAdmin]);

  const [selectedOrganisationId, setSelectedOrganisationId] = useState<string | null>(null);
  const [sortedApplications, setSortedApplications] = useState<EventApplicationDetailedWithApplications[]>([]);

  const updatePriorities = useUpdatePriorities({
    mutation: {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Priorities updated successfully",
          color: "green",
        });
        onSuccess();
        closeModal();
      },
      onError: (error: any) => {
        console.error(error);
        notifications.show({
          title: "Error",
          message: "Failed to update priorities",
          color: "red",
        });
      },
    },
  });

  // Set first organisation as the default value for select input
  useEffect(() => {
    if (relevantOrganizations.length > 0 && !selectedOrganisationId) {
      setSelectedOrganisationId(relevantOrganizations[0].value);
    }
  }, [relevantOrganizations, selectedOrganisationId]);

  // Filter event applications based on selected organisation when selected organisation changes
  useEffect(() => {
    if (selectedOrganisationId) {
      const filteredApps = eventApplications.filter((app) => app.organization?.id === selectedOrganisationId);
      setSortedApplications(filteredApps);
    } else {
      setSortedApplications([]);
    }
  }, [selectedOrganisationId, eventApplications]);

  const reorderPriorities = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedApplications((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const priorities = sortedApplications.map((item, index) => ({
      applicationId: item.id,
      priority: index + 1,
    }));

    updatePriorities.mutate({ data: { priorities } });
  };

  return (
    <Modal opened={isOpened} onClose={closeModal} title="Priority list" size="lg">
      <Stack>
        <Select
          label="Select organization"
          placeholder="Pick organization"
          data={relevantOrganizations}
          value={selectedOrganisationId}
          onChange={setSelectedOrganisationId}
        />

        {selectedOrganisationId && sortedApplications.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={reorderPriorities}>
            <SortableContext items={sortedApplications.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <Stack gap="xs">
                {sortedApplications.map((item) => (
                  <SortableItem key={item.id} id={item.id} application={item} />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          selectedOrganisationId && <Text size="sm">No applications for this organization.</Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={updatePriorities.isPending} disabled={sortedApplications.length === 0}>
            Save priorities
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default PriorityListModal;
