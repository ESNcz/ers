"use client";

import {
  useAddOrganizationMembers,
  useDeleteOrganizationMembers,
  useGetAllUsers,
  useGetCurrentUser,
  useGetOrganisationById,
  useOrganizationMembers,
  useTransferManager,
} from "@/utils/api";
import { Organization, OrganizationMember, User, UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
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

interface MyOrganisationMemberListProps {
  organizationId: string;
}

const MyOrganisationMemberList = ({ organizationId }: MyOrganisationMemberListProps) => {
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { data: currentUser } = useGetCurrentUser();
  const { data: currentOrganisation, refetch: refetchCurrentOrganisation } = useGetOrganisationById(organizationId);
  const { data: organizationMembers, refetch: refetchOrganisationMembers } = useOrganizationMembers(organizationId);

  const { data: allUsersList, refetch: refetchAllUsers } = useGetAllUsers(
    { all: true },
    {
      query: {
        enabled: !!searchValue,
      },
    },
  );

  const isUserManager = useMemo(() => {
    return (
      currentOrganisation?.manager?.id === currentUser?.id ||
      hasSomePermissions(currentUser?.role as UserRole, ["organisation.deleteUser"])
    );
  }, [currentOrganisation, currentUser]);

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
        // Check if firstName, lastName, username or e-mail is included in search field
        return (
          !organizationMembers?.data?.find((member) => member.user.id === user.id) &&
          [user.firstName, user.lastName, user.username, user.email].some((value) => value.includes(searchValue ?? ""))
        );
      }) ?? []
    );
  }, [allUsersList, searchValue, organizationMembers]);

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

  const handleTransferSectionManager = (organisation: Organization, user: User) => {
    if (
      !confirm(
        `Do you really want to transfer organisation manager to ${user.firstName} ${user.lastName} (${user.username})?`,
      )
    ) {
      return;
    }
    transferOrganisationManagerMutation.mutate({
      organisationId: organisation.id,
      userId: user.id,
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
        w="100%"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
        gap={16}
      >
        <Title order={1}>My Organisation</Title>
        <Title order={2}>{currentOrganisation?.name}</Title>
      </Flex>
      <Flex direction="column" gap={8}>
        {isUserManager && (
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
        )}
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
              <Table.Th w={148}>Username</Table.Th>
              {isUserManager && <Table.Th w={200}>Operations</Table.Th>}
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
                      <Flex direction="column" justify="start" align="start">
                        <Text>{`${personalAddress.street} ${personalAddress.houseNumber}`}</Text>
                        <Text>{`${personalAddress.zip}, ${personalAddress.city}`}</Text>
                        <Text>{personalAddress.country}</Text>
                      </Flex>
                    ) : (
                      `N/A`
                    )}
                  </Table.Td>
                  <Table.Td>{user.gender}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.username}</Table.Td>
                  {isUserManager && (
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
                            onClick={() => handleTransferSectionManager(currentOrganisation, member.user)}
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
                            disabled={member.user.id === currentUser?.id}
                          >
                            <IconUserX width={32} height={32} />
                          </ActionIcon>
                        </Tooltip>
                      </Flex>
                    </Table.Td>
                  )}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
};

export default MyOrganisationMemberList;
