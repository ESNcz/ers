import { EventSimple, Organization } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { extractText } from "@/utils/table-helpers";
import ApiImage from "@components/ApiImage/ApiImage";
import { DataTableFacetedFilterConfig, createColumns } from "@components/data-table";
import { ActionIcon, Flex, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconEdit, IconEye, IconTrash, IconUsersGroup, IconX } from "@tabler/icons-react";
import Link from "next/link";

// export const facetedFilters: DataTableFacetedFilterConfig[] = [
//   {
//     columnId: "visible",
//     title: "Status",
//     options: [
//       { label: "Published", value: "true", icon: IconCheck },
//       { label: "Unpublished", value: "false", icon: IconX },
//     ],
//   },
// ];

export const OrganisationManagementColumns = (
  handleDeleteOrganization: (organization: Organization) => void,
  setActiveOrganisation: (organization: Organization) => void,
  openUpdateOrganizationModal: () => void,
  deleteOrganizationMutation: { isPending: boolean },
) =>
  createColumns<Organization>([
    {
      accessor: "name",
      id: "name",
      header: "Name",
      enableSorting: false,
      enableHiding: false,
      render: (event) => (
        <Text size="sm" lineClamp={2}>
          {event.name}
        </Text>
      ),
    },
    {
      accessor: "legalName",
      id: "legalName",
      header: "Legal Name",
      enableSorting: false,
      enableHiding: false,
      render: (event) => (
        <Text size="sm" lineClamp={2}>
          {event.legalName}
        </Text>
      ),
    },
    {
      accessor: "cin",
      id: "cin",
      header: "CIN",
      enableSorting: false,
      render: (event) => (
        <Text size="sm" lineClamp={2}>
          {event.cin}
        </Text>
      ),
    },
    {
      accessor: "vatin",
      id: "VATIN",
      header: "VATIN",
      enableSorting: false,
      render: (event) => (
        <Flex justify="center">
          <Text size="sm" lineClamp={2}>
            {event.vatin}
          </Text>
        </Flex>
      ),
    },
    {
      id: "Address",
      header: "Address",
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      render: (event) => (
        <Flex direction="column" justify="start" align="start">
          <Text>{`${event.address.street} ${event.address.houseNumber}`}</Text>
          <Text>{`${event.address.zip}, ${event.address.city}`}</Text>
          <Text>{event.address.country}</Text>
        </Flex>
      ),
    },
    {
      id: "ManagersName",
      header: "Manager's Name",

      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      render: (event) =>
        event.manager ? <Text>{`${event.manager.firstName} ${event.manager.lastName}`}</Text> : <Text>N/A</Text>,
    },
    {
      id: "ManagersUsername",
      header: "Manager's Username",

      render: (event) => (event.manager ? <Text>{`${event.manager.username}`}</Text> : <Text>N/A</Text>),
    },
    {
      id: "operations",
      header: "Operations",

      enableSorting: false,
      enableGlobalFilter: false,
      render: (event) => (
        <Flex justify="space-evenly" gap={16}>
          <Tooltip label="Organization Members">
            <ActionIcon
              component={Link}
              href={routes.ORGANISATION_MEMBERS({ id: event.id })}
              variant="subtle"
              size={48}
              color="black"
            >
              <IconUsersGroup width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit Organization">
            <ActionIcon
              variant="subtle"
              size={48}
              color="blue"
              onClick={() => {
                setActiveOrganisation(event);
                openUpdateOrganizationModal();
              }}
            >
              <IconEdit width={32} height={32} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Organization">
            <ActionIcon
              variant="subtle"
              size={48}
              color="red"
              onClick={() => handleDeleteOrganization(event)}
              loading={deleteOrganizationMutation.isPending}
            >
              <IconTrash width={32} height={32} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      ),
    },
  ]);
