"use client";

import {
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
  useGetAllUsers,
  useGetOrganisationById,
  useOrganizationMembers,
  useTransferManager,
} from "@/utils/api";
import { OrganizationMember } from "@/utils/api.schemas";
import ApiImage from "@components/ApiImage/ApiImage";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCrown, IconUserX } from "@tabler/icons-react";
import { useMemo, useState } from "react";

interface OrganizationMemberListProps {
  organizationId: string;
}

const OrganizationMemberList = ({ organizationId }: OrganizationMemberListProps) => {
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { data: currentOrganisation, refetch: refetchCurrentOrganisation } = useGetOrganisationById(organizationId);

  const { data: allUsersList, refetch: refetchAllUsers } = useGetAllUsers(
    { all: true },
    {
      query: {
        enabled: !!searchValue,
      },
    },
  );

  const { data: organizationMembers, refetch: refetchOrganisationMembers } = useOrganizationMembers(organizationId);

  const addOrganizationMemberMutation = useAddOrganizationMembers({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });
  const deleteOrganizationMemberMutation = useDeleteOrganizationMembers({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });

  const filteredUserList = useMemo(() => {
    return (
      allUsersList?.data?.filter((user) => {
        // Check if is not in organisation already, if yes, then it will not be added
        if (organizationMembers?.data?.find((member) => member.user.id === user.id)) return;
        // Check if firstName, lastName, username or e-mail is included in search field
        return [user.firstName, user.lastName, user.username, user.email].some((value) => {
          return value.toLowerCase().includes(searchValue?.toLowerCase() ?? "");
        });
      }) ?? []
    );
  }, [allUsersList, searchValue, organizationMembers, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteOrganizationMembers = (member: OrganizationMember) => {
    if (
      !confirm(
        `Do you really want to remove ${member.user.firstName} ${member.user.lastName} (${member.user.username}) from ${currentOrganisation?.name}?`,
      )
    ) {
      return;
    }
    deleteOrganizationMemberMutation.mutate({
      id: organizationId,
      memberId: member.id,
    });
  };

  const handleAddMemberToOrganization = (userId: string) => {
    addOrganizationMemberMutation.mutate({
      id: organizationId,
      data: {
        userIds: [userId],
      },
    });
  };

  const transferOrganisationManagerMutation = useTransferManager({
    mutation: {
      onSuccess: () => {
        refetchOrganisationMembersInfo();
      },
    },
  });

  const handleTransferSectionManager = (organisationId: string, userId: string) => {
    transferOrganisationManagerMutation.mutate({
      organisationId: organisationId,
      userId: userId,
    });
  };

  const refetchOrganisationMembersInfo = () => {
    refetchCurrentOrganisation();
    refetchAllUsers();
    refetchOrganisationMembers();
  };

  if (!currentOrganisation) return null;

  return (
    <Stack>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        w="100%"
        gap={24}
      >
        <Title>Manage Organisation Members</Title>
        <Title>{currentOrganisation?.name}</Title>
      </Flex>
      <Flex direction="column" gap={8}>
        <Box>
          <TextInput
            label="Search Users"
            placeholder="Search Users"
            value={searchValue}
            onChange={(value) => {
              setSearchValue(value.currentTarget.value);
            }}
          />
        </Box>
        {allUsersList && !!searchValue ? (
          <>
            {filteredUserList?.map((user, index) => {
              return (
                <Box bg={index % 2 === 0 ? "gray.3" : "gray.0"} key={`user-listed-${user.id}-${index}`}>
                  <Flex align="center" gap={16} direction={{ base: "column", sm: "row" }}>
                    <Flex justify="space-between" align="center" gap={16} wrap="wrap" w="100%" p={8}>
                      <Text miw={156}>{`${user.firstName} ${user.lastName}`}</Text>
                      <Text miw={156}>{user.username}</Text>
                      <Text miw={156}>{user.email}</Text>
                      <Text miw={156}>{user.gender}</Text>
                    </Flex>
                    <Button
                      w={{ base: "100%", sm: 128 }}
                      onClick={() => handleAddMemberToOrganization(user.id)}
                      loading={addOrganizationMemberMutation.isPending}
                    >
                      Add
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </>
        ) : null}
      </Flex>
      <ScrollArea w="100%">
        <Table withTableBorder withColumnBorders withRowBorders striped highlightOnHover={true}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th h="100%" maw={64} w={64}>
                Photo
              </Table.Th>
              <Table.Th h="100%" w={148}>
                Full Name
              </Table.Th>
              <Table.Th w={148} miw={148}>
                Address
              </Table.Th>
              <Table.Th w={148} miw={148}>
                Gender
              </Table.Th>
              <Table.Th w={148} miw={148}>
                E-mail
              </Table.Th>
              <Table.Th w={148}>Role</Table.Th>
              <Table.Th w={200}>Operations</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {organizationMembers?.data?.map((member, index) => {
              const { user } = member;
              const { personalAddress } = user;

              return (
                <Table.Tr key={`member-${index}-${member.id}`}>
                  <Table.Td>
                    <Box>
                      <ApiImage src={user.photo?.id} />
                    </Box>
                  </Table.Td>
                  <Table.Td>{`${user.firstName} ${user.lastName}`}</Table.Td>
                  <Table.Td>
                    {personalAddress ? (
                      <Flex direction="column" justify="start" align="start" ta="start">
                        <Text>{`${personalAddress.street} ${personalAddress.houseNumber}`}</Text>
                        <Text>{`${personalAddress.zip} ${personalAddress.city}`}</Text>
                        <Text>{personalAddress.country}</Text>
                      </Flex>
                    ) : (
                      `N/A`
                    )}
                  </Table.Td>
                  <Table.Td>{user.gender}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.role?.name ?? "N/A"}</Table.Td>
                  <Table.Td>
                    <Flex justify="space-evenly" gap={16}>
                      <Tooltip
                        label={
                          currentOrganisation?.manager?.id === member.user.id
                            ? "This person is section manager"
                            : "Transfer Manager"
                        }
                      >
                        <ActionIcon
                          variant="subtle"
                          size={48}
                          color="yellow"
                          onClick={() => handleTransferSectionManager(currentOrganisation.id, member.user.id)}
                          disabled={currentOrganisation?.manager?.id === member.user.id}
                        >
                          <IconCrown width={32} height={32} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remove from Organization">
                        <ActionIcon
                          variant="subtle"
                          size={48}
                          color="red"
                          loading={deleteOrganizationMemberMutation.isPending}
                          onClick={() => handleDeleteOrganizationMembers(member)}
                        >
                          <IconUserX width={32} height={32} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
};

export default OrganizationMemberList;
