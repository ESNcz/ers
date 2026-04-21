"use client";

import { useGetAllUsers } from "@/utils/api";
import ApiImage from "@components/ApiImage/ApiImage";
import { ActionIcon, Flex, Modal, Paper, ScrollArea, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";

interface AddOrganisationMemberModalProps {
  isOpened: boolean;
  closeModal: () => void;
  memberUserIds: Set<string>;
  onAddMember: (userId: string) => void;
  isPending: boolean;
}

const PAGE_SIZE = 20;

const AddOrganisationMemberModal = ({
  isOpened,
  closeModal,
  memberUserIds,
  onAddMember,
  isPending,
}: AddOrganisationMemberModalProps) => {
  const [search, setSearch] = useState("");
  const hasSearch = !!search.trim();

  const { data: allUsersList, isFetching } = useGetAllUsers(
    hasSearch ? { all: true } : { page: 1, perPage: PAGE_SIZE },
    { query: { enabled: isOpened } },
  );

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const allUsers = allUsersList?.data ?? [];
    const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));
    if (!q) return nonMembers;
    return nonMembers.filter((u) =>
      [u.firstName, u.lastName, `${u.firstName} ${u.lastName}`, u.username, u.email].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [allUsersList?.data, memberUserIds, search]);

  const totalCount = allUsersList?.pagination?.totalCount;

  return (
    <Modal opened={isOpened} onClose={closeModal} title="Add member to organisation" size="lg" centered>
      <Stack>
        <TextInput
          placeholder="Search by name, username or email"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        {!hasSearch && totalCount !== undefined && totalCount > PAGE_SIZE ? (
          <Text size="xs" c="dimmed">
            Showing {candidates.length} of {totalCount} — type to search all users.
          </Text>
        ) : null}
        <ScrollArea h={400}>
          <Stack gap="xs">
            {isFetching && !allUsersList ? (
              <Text c="dimmed" ta="center">
                Loading...
              </Text>
            ) : candidates.length === 0 ? (
              <Text c="dimmed" ta="center">
                {hasSearch ? "No users found." : "No users available."}
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
