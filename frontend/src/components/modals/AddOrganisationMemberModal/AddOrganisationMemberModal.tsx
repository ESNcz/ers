"use client";

import { useOrganizationMemberCandidates } from "@/utils/api";
import ApiImage from "@components/ApiImage/ApiImage";
import { ActionIcon, Flex, Modal, Paper, ScrollArea, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";

interface AddOrganisationMemberModalProps {
  organisationId: string;
  isOpened: boolean;
  closeModal: () => void;
  onAddMember: (userId: string) => void;
  isPending: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;

const AddOrganisationMemberModal = ({
  organisationId,
  isOpened,
  closeModal,
  onAddMember,
  isPending,
}: AddOrganisationMemberModalProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const hasSearch = debouncedSearch.length > 0;

  // Users are searched on the backend, which also leaves out current members
  const { data: candidatesList, isFetching } = useOrganizationMemberCandidates(
    organisationId,
    { search: debouncedSearch },
    { query: { enabled: isOpened && hasSearch, placeholderData: keepPreviousData } },
  );

  const candidates = hasSearch ? (candidatesList?.data ?? []) : [];
  const totalCount = candidatesList?.pagination?.totalCount ?? 0;

  return (
    <Modal
      opened={isOpened}
      onClose={closeModal}
      // Next opening starts with an empty search
      onExitTransitionEnd={() => setSearch("")}
      title="Add member to organisation"
      size="lg"
      centered
    >
      <Stack>
        <TextInput
          placeholder="Search by name, username or email"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          data-autofocus
        />
        {hasSearch && totalCount > candidates.length ? (
          <Text size="xs" c="dimmed">
            Showing {candidates.length} of {totalCount} users — refine the search to find others.
          </Text>
        ) : null}
        <ScrollArea h={400}>
          <Stack gap="xs">
            {!hasSearch ? (
              <Text c="dimmed" ta="center">
                Start typing to search users.
              </Text>
            ) : isFetching && !candidatesList ? (
              <Text c="dimmed" ta="center">
                Loading...
              </Text>
            ) : candidates.length === 0 ? (
              <Text c="dimmed" ta="center">
                No users found.
              </Text>
            ) : (
              candidates.map((user) => (
                <Paper key={user.id} withBorder p="sm">
                  <Flex justify="space-between" align="center" gap="md">
                    <Flex align="center" gap="md">
                      <ApiImage src={user.photo?.id} w={48} h={48} radius="xl" fit="cover" />
                      <Stack gap={0}>
                        <Text fw={500}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {user.username} — {user.email}
                        </Text>
                      </Stack>
                    </Flex>
                    <Tooltip label="Add to organisation">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        size={40}
                        loading={isPending}
                        onClick={() => onAddMember(user.id)}
                      >
                        <IconUserPlus size={24} />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default AddOrganisationMemberModal;
