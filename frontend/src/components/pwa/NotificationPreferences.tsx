"use client";

import {
  getGetNotificationPreferencesQueryKey,
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/utils/api";
import { NotificationPreferenceDto, NotificationType } from "@/utils/api.schemas";
import { showErrorNotification } from "@/utils/notifications";
import { Checkbox, Loader, Stack, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";

const typeLabels: Record<NotificationType, { label: string; description: string }> = {
  sugarCube: { label: "Sugar cubes", description: "Someone sends you a sugar cube" },
  spotAssigned: { label: "Assigned spot", description: "You get a spot in an event you applied to" },
  eventPublished: { label: "New events", description: "A new event is published" },
  formDeadline: { label: "Form deadlines", description: "A required form of your event is about to close" },
  registrationReminder: { label: "Registration reminders", description: "Registration for an event is about to close" },
};

/**
 * Notification types turned on/off one by one, saved per user - applies to all of their devices
 */
const NotificationPreferences = () => {
  const queryClient = useQueryClient();
  const queryKey = getGetNotificationPreferencesQueryKey();
  const { data: preferences, isLoading } = useGetNotificationPreferences();

  const { mutate: updatePreferences } = useUpdateNotificationPreferences({
    mutation: {
      // Checkbox reacts right away, rolled back when saving fails
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<NotificationPreferenceDto[]>(queryKey);
        queryClient.setQueryData<NotificationPreferenceDto[]>(queryKey, (current) =>
          current?.map((preference) => data.preferences.find((item) => item.type === preference.type) ?? preference),
        );
        return { previous };
      },
      onError: (error, _variables, context) => {
        queryClient.setQueryData(queryKey, context?.previous);
        showErrorNotification(error);
      },
      onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    },
  });

  if (isLoading) return <Loader size="sm" />;
  if (!preferences) return null;

  return (
    <Stack gap="xs">
      <div>
        <Text size="sm" fw={500}>
          Notify me about
        </Text>
        <Text size="xs" c="dimmed">
          Applies to all your devices
        </Text>
      </div>
      {preferences.map(({ type, enabled }) => (
        <Checkbox
          key={type}
          label={typeLabels[type]?.label ?? type}
          description={typeLabels[type]?.description}
          checked={enabled}
          onChange={(event) =>
            updatePreferences({ data: { preferences: [{ type, enabled: event.currentTarget.checked }] } })
          }
        />
      ))}
    </Stack>
  );
};

export default NotificationPreferences;
