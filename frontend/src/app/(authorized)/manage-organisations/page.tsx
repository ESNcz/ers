"use client";

import { useAllOrganizations, useDeleteOrganization } from "@/utils/api";
import type { Organization } from "@/utils/api.schemas";
import { DataTable } from "@components/data-table";
import { organisationManagementColumns } from "@components/data-table/organisation-management-columns";
import CreateOrganizationModal from "@components/modals/CreateOrganizationModal/CreateOrganizationModal";
import UpdateOrganisationModal from "@components/modals/UpdateOrganizationModal/UpdateOrganisationModal";
import { Button, Container, Flex, ScrollArea, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";

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

  const handleDeleteOrganization = useCallback(
    (organization: Organization) => {
      if (!confirm(`Do you really want to delete organization ${organization.name}?`)) {
        return;
      }
      deleteOrganizationMutation.mutate({ id: organization.id });
    },
    [deleteOrganizationMutation],
  );

  const organisations = useMemo(() => organisationsList ?? [], [organisationsList]);

  const columns = useMemo(
    () =>
      organisationManagementColumns(
        handleDeleteOrganization,
        setActiveOrganisation,
        openUpdateOrganizationModal,
        deleteOrganizationMutation,
      ),
    [handleDeleteOrganization, setActiveOrganisation, openUpdateOrganizationModal, deleteOrganizationMutation],
  );

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
          <DataTable columns={columns} data={organisations} emptyMessage="No Organizations..." />
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
