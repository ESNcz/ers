"use client";

import { useAllOrganizations, useDeleteOrganization } from "@/utils/api";
import type { Organization } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { DataTable, facetedFilters } from "@components/data-table";
import { OrganisationManagementColumns } from "@components/data-table/organisation-management-columns";
import CreateOrganizationModal from "@components/modals/CreateOrganizationModal/CreateOrganizationModal";
import UpdateOrganisationModal from "@components/modals/UpdateOrganizationModal/UpdateOrganisationModal";
import { ActionIcon, Button, Container, Flex, ScrollArea, Stack, Table, Text, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconPlus, IconTrash, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

const ManageOrganisationsPage = () => {
  const [isCreateOrganizationModalOpen, { open: openAddOrganizationModal, close: closeAddOrganizationModal }] =
    useDisclosure(false);
  const [isUpdateOrganizationModalOpen, { open: openUpdateOrganizationModal, close: closeUpdateOrganizationModal }] =
    useDisclosure(false);

  const [activeOrganisation, setActiveOrganisation] = useState<Organization | null>(null);

  const { data: organisationsList, refetch: refetchOrganisationsList } = useAllOrganizations();

  const deleteOrganizationMutation = useDeleteOrganization({
    mutation: {
      onSuccess: () => {
        handleRefetch();
      },
    },
  });

  const handleRefetch = () => {
    setActiveOrganisation(null);
    refetchOrganisationsList();
  };

  const handleDeleteOrganization = (organization: Organization) => {
    if (!confirm(`Do you really want to delete organization ${organization.name}?`)) {
      return;
    }
    deleteOrganizationMutation.mutate({ id: organization.id });
  };

  const organisations = organisationsList ? organisationsList : [];

  const columns = OrganisationManagementColumns(
    handleDeleteOrganization,
    setActiveOrganisation,
    openUpdateOrganizationModal,
    deleteOrganizationMutation,
  );

  // const rows = organisationsList?.map((organization, index) => (
  //   <Table.Tr key={`event-${index}-${organization.id}`}>
  //     <Table.Td>{organization.name}</Table.Td>
  //     <Table.Td>{organization.legalName}</Table.Td>
  //     <Table.Td>{organization.cin}</Table.Td>
  //     <Table.Td>{organization.vatin}</Table.Td>
  //     <Table.Td>
  //       <Flex direction="column" justify="start" align="start">
  //         <Text>{`${organization.address.street} ${organization.address.houseNumber}`}</Text>
  //         <Text>{`${organization.address.zip}, ${organization.address.city}`}</Text>
  //         <Text>{organization.address.country}</Text>
  //       </Flex>
  //     </Table.Td>
  //     {organization.manager ? (
  //       <>
  //         <Table.Td>{`${organization.manager.firstName} ${organization.manager.lastName}`}</Table.Td>
  //         <Table.Td>{organization.manager.username}</Table.Td>
  //       </>
  //     ) : (
  //       <>
  //         <Table.Td>N/A</Table.Td>
  //         <Table.Td>N/A</Table.Td>
  //       </>
  //     )}
  //     <Table.Td>
  //       <Flex justify="space-evenly" gap={16}>
  //         <Tooltip label="Organization Members">
  //           <ActionIcon
  //             component={Link}
  //             href={routes.ORGANISATION_MEMBERS({ id: organization.id })}
  //             variant="subtle"
  //             size={48}
  //             color="black"
  //           >
  //             <IconUsersGroup width={32} height={32} />
  //           </ActionIcon>
  //         </Tooltip>
  //         <Tooltip label="Edit Organization">
  //           <ActionIcon
  //             variant="subtle"
  //             size={48}
  //             color="blue"
  //             onClick={() => {
  //               setActiveOrganisation(organization);
  //               openUpdateOrganizationModal();
  //             }}
  //           >
  //             <IconEdit width={32} height={32} />
  //           </ActionIcon>
  //         </Tooltip>
  //         <Tooltip label="Delete Organization">
  //           <ActionIcon
  //             variant="subtle"
  //             size={48}
  //             color="red"
  //             onClick={() => handleDeleteOrganization(organization)}
  //             loading={deleteOrganizationMutation.isPending}
  //           >
  //             <IconTrash width={32} height={32} />
  //           </ActionIcon>
  //         </Tooltip>
  //       </Flex>
  //     </Table.Td>
  //   </Table.Tr>
  // ));

  return (
    <Container size="xl">
      <Stack>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          w="100%"
          gap={24}
        >
          <Title order={1}>Manage Organizations</Title>
          <Button onClick={openAddOrganizationModal} leftSection={<IconPlus />}>
            Add Organization
          </Button>
        </Flex>
        <ScrollArea w="100%">
          <DataTable
            columns={columns}
            data={organisations}
            emptyMessage="No Organizations..."
            // facetedFilters={facetedFilters}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </ScrollArea>
      </Stack>
      <CreateOrganizationModal
        handleSuccess={handleRefetch}
        isOpened={isCreateOrganizationModalOpen}
        closeModal={closeAddOrganizationModal}
      />
      {activeOrganisation && (
        <UpdateOrganisationModal
          activeOrganization={activeOrganisation}
          handleSuccess={handleRefetch}
          isOpened={isUpdateOrganizationModalOpen}
          closeModal={closeUpdateOrganizationModal}
        />
      )}
    </Container>
  );
};
export default ManageOrganisationsPage;
