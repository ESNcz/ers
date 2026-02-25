"use client";

import {
  getGetCurrentUserQueryKey,
  getGetEventApplicationsQueryKey,
  getGetEventQueryKey,
  useDeleteEventApplication,
  useGetCurrentUser,
  useGetEvent,
  useGetEventApplications,
  useUserOrganizationMemberships,
} from "@/utils/api";
import { hasEveryPermissions, hasSomePermissions, isUserAdmin, isUserManager } from "@/utils/checkPermissions";
import routes from "@/utils/routes";
import { dateWithTime, dayMonthYear } from "@/utils/time";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import EventEditModal from "@components/events/modals/EventEditModal";
import EventApplicationModal from "@components/modals/EventApplicationModal/EventApplicationModal";
import PriorityListModal from "@components/modals/PriorityListModal/PriorityListModal";
import UpdateEventPhotoModal from "@components/modals/UpdateEventPhotoModal/UpdateEventPhotoModal";
import {
  Anchor,
  Blockquote,
  Button,
  Collapse,
  Divider,
  Flex,
  Grid,
  Paper,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconCancel,
  IconCash,
  IconChevronDown,
  IconEdit,
  IconInfoCircle,
  IconInvoice,
  IconPhoto,
  IconUsersGroup,
  IconWritingSign,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useMemo } from "react";

interface EventDetailProps {
  id: number;
}

const EventDetail = ({ id }: EventDetailProps) => {
  const queryClient = useQueryClient();
  const isPhone = useMediaQuery("(min-width: 62em)");
  const [opened, { toggle }] = useDisclosure(isPhone);

  const [isModalEditOpen, { open: openModalEdit, close: closeModalEdit }] = useDisclosure(false);
  const [isModalUploadPhotoOpen, { open: openModalUploadPhoto, close: closeModalUploadPhoto }] = useDisclosure(false);
  const [isModalJoinEventOpen, { open: openModalJoinEvent, close: closeModalJoinEvent }] = useDisclosure(false);
  const [isModalPriorityListOpen, { open: openModalPriorityList, close: closeModalPriorityList }] =
    useDisclosure(false);

  const { data: eventApplications, refetch: refetchEventApplications } = useGetEventApplications(id);
  const { data: eventDetail, refetch: refetchEvent } = useGetEvent(id);
  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUser();
  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "", {
    query: {
      enabled: !!currentUser?.id,
    },
  });

  const isRegistrationOpen = dayjs(eventDetail?.registrationDeadline).isAfter(dayjs());

  const deleteEventApplication = useDeleteEventApplication({
    mutation: {
      onSuccess: () => {
        handleRefetchDetail();
      },
    },
  });

  const isUserRegistered = useMemo(() => {
    return eventApplications?.some((f) => f.user.id === currentUser?.id);
  }, [eventApplications, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteApplication = () => {
    if (!confirm("Do you really want to unregister from this event?")) return;
    const eventApplicationId = eventApplications?.find((f) => f.user.id === currentUser?.id)?.id;
    if (eventApplicationId) {
      deleteEventApplication.mutate({ id: eventApplicationId });
    }
  };

  const handleRefetchDetail = () => {
    queryClient.invalidateQueries({ queryKey: [getGetEventApplicationsQueryKey(id)] });
    queryClient.invalidateQueries({ queryKey: [getGetEventQueryKey(id)] });
    queryClient.invalidateQueries({ queryKey: [getGetCurrentUserQueryKey()] });
    refetchEventApplications();
    refetchEvent();
    refetchCurrentUser();
  };

  if (!eventApplications || !eventDetail || !currentUser) {
    return null;
  }

  return eventDetail ? (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, md: 9 }} order={{ base: 2, md: 1 }}>
          <Flex direction="column" w="100%" gap={16}>
            <Flex direction="column" w="100%" gap={8}>
              <Paper radius="md" style={{ overflow: "hidden" }}>
                {eventDetail.photo?.id ? <ApiImage src={eventDetail.photo.id} w="100%" h="100%" /> : null}
              </Paper>
              <Title order={1}>{eventDetail.title}</Title>
              <Flex justify="start" align="center" gap={8} wrap="wrap">
                <IconUsersGroup />
                <Text size="sm">
                  <Text c="dimmed" span>
                    {"applications" in eventDetail ? `${eventDetail.applications} / ${eventDetail.capacity}` : null}
                  </Text>
                </Text>
              </Flex>
              <Text>
                <Text span fw="bold">
                  Registration Deadline:
                </Text>{" "}
                <Text span c="dark">
                  {dateWithTime(eventDetail.registrationDeadline)}
                </Text>
              </Text>
              <Text>
                <Text span fw="bold">
                  Date:
                </Text>{" "}
                <Text span c="dark">
                  {dayMonthYear(eventDetail.since)} - {dayMonthYear(eventDetail.until)}
                </Text>
              </Text>
            </Flex>
            <RichTextRenderer content={eventDetail.longDescription} />
          </Flex>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }} order={{ base: 1, md: 2 }}>
          <Flex direction="column" gap={16}>
            {eventDetail.links.length > 0 && (
              <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 1, xl: 1 }}>
                {eventDetail.links.map((link, index) => (
                  <Button
                    key={`link-tree-${link.id}-${index}`}
                    component={Link}
                    href={link.link}
                    target="_blank"
                    color="magenta"
                  >
                    {link.name}
                  </Button>
                ))}
              </SimpleGrid>
            )}
            {isUserManager(currentUser, userOrganisationMemberships) && (
              <>
                <Divider my={8} />

                <Button component={Link} href={routes.EVENT_APPLICATIONS({ id })} color="darkBlue">
                  Event Applications
                </Button>

                <Button
                  onClick={openModalPriorityList}
                  color="darkBlue"
                  disabled={!(isUserAdmin(currentUser.role) || isRegistrationOpen)}
                >
                  Priority list
                </Button>

                <Button component={Link} href={routes.SUGAR_CUBES({ id: Number(id) })} color="darkBlue">
                  Sugar Cubes
                </Button>
              </>
            )}

            <Divider my={8} />

            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 1, xl: 1 }}>
              <Flex direction="column" gap={16}>
                {currentUser.personalAddress === null && (
                  <Blockquote color="red" icon={<IconInfoCircle />} p={20} mt={16}>
                    Fill your <Anchor href={routes.ACCOUNT}>personal address</Anchor> on your account profile before
                    registration.
                  </Blockquote>
                )}
                {isUserRegistered ? (
                  <Button
                    onClick={handleDeleteApplication}
                    color="red"
                    leftSection={<IconCancel />}
                    disabled={dayjs(eventDetail.registrationDeadline).diff(new Date()) <= 0}
                  >
                    Unregister from Event
                  </Button>
                ) : (
                  <Button
                    onClick={openModalJoinEvent}
                    color="green"
                    leftSection={<IconWritingSign />}
                    disabled={
                      currentUser.personalAddress === null ||
                      dayjs(eventDetail.registrationDeadline).diff(new Date()) <= 0
                    }
                  >
                    Register to Event
                  </Button>
                )}
              </Flex>
            </SimpleGrid>
            {hasSomePermissions(currentUser.role, ["event.update", "event.manageApplications"]) && (
              <Button
                mb={8}
                variant="outline"
                color="cyan"
                onClick={toggle}
                justify="space-between"
                rightSection={
                  <IconChevronDown
                    style={{ rotate: (isPhone ? !opened : opened) ? "0deg" : "180deg", transition: "rotate 300ms" }}
                  />
                }
                size="compact"
              >
                Show management options
              </Button>
            )}
            <Collapse in={isPhone ? !opened : opened}>
              <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 1, xl: 1 }}>
                {hasEveryPermissions(currentUser.role, ["event.update"]) && (
                  <Button onClick={openModalEdit} leftSection={<IconEdit />}>
                    Edit Event
                  </Button>
                )}
                {hasEveryPermissions(currentUser.role, ["event.update"]) && (
                  <Button onClick={openModalUploadPhoto} leftSection={<IconPhoto />}>
                    Upload Image
                  </Button>
                )}
                {hasEveryPermissions(currentUser.role, ["event.manageApplications"]) && (
                  <Button
                    component={Link}
                    href={routes.EVENT_APPLICATIONS_MANAGE({ id: id })}
                    leftSection={<IconUsersGroup />}
                  >
                    Manage Applications
                  </Button>
                )}
              </SimpleGrid>

              {isUserRegistered && (
                <VisuallyHidden>
                  <Divider my={16} />
                  <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 1, xl: 1 }}>
                    <Button
                      component={Link}
                      href={routes.EVENT_APPLICATIONS_MANAGE({ id: id })}
                      leftSection={<IconInvoice />}
                      disabled
                    >
                      Show Invoice
                    </Button>
                    <Button
                      component={Link}
                      href={routes.EVENT_APPLICATIONS_MANAGE({ id: id })}
                      leftSection={<IconCash />}
                      disabled
                    >
                      Upload Payment
                    </Button>
                  </SimpleGrid>
                </VisuallyHidden>
              )}
            </Collapse>
          </Flex>
        </Grid.Col>
      </Grid>
      <UpdateEventPhotoModal
        eventId={eventDetail.id}
        handleSuccess={handleRefetchDetail}
        isOpened={isModalUploadPhotoOpen}
        closeModal={closeModalUploadPhoto}
      />
      <EventEditModal
        eventDetail={eventDetail}
        handleSuccess={handleRefetchDetail}
        isOpened={isModalEditOpen}
        close={closeModalEdit}
      />
      {!!currentUser ? (
        <EventApplicationModal
          currentUser={currentUser}
          eventDetail={eventDetail}
          handleSuccess={handleRefetchDetail}
          isOpened={isModalJoinEventOpen}
          closeModal={() => {
            closeModalJoinEvent();
          }}
        />
      ) : null}
      <PriorityListModal
        isOpened={isModalPriorityListOpen}
        closeModal={() => {
          refetchEventApplications();
          closeModalPriorityList();
        }}
        eventApplications={eventApplications}
        userOrganisationMemberships={userOrganisationMemberships ?? []}
        currentUser={currentUser}
        onSuccess={handleRefetchDetail}
      />
    </>
  ) : (
    <Grid>
      <Grid.Col span={{ base: 12, md: 9 }} order={{ base: 2, md: 1 }}>
        <Skeleton height={500} radius="md" animate={true} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 3 }} order={{ base: 1, md: 2 }}>
        <Skeleton height={500} radius="md" animate={true} />
      </Grid.Col>
    </Grid>
  );
};

export default EventDetail;
