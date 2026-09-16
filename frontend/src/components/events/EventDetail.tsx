"use client";

import {
  getGetCurrentUserQueryKey,
  getGetEventQueryKey,
  useDeleteEventApplication,
  useGetEvent,
  useGetUserApplicationForEvent,
  useUserOrganizationMemberships,
} from "@/utils/api";
import { hasEveryPermissions, hasSomePermissions, isUserManager } from "@/utils/checkPermissions";
import routes from "@/utils/routes";
import { dateWithTime, dayMonthYear } from "@/utils/time";
import ApiImage from "@components/ApiImage/ApiImage";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import EventEditModal from "@components/events/modals/EventEditModal";
import EventApplicationModal from "@components/modals/EventApplicationModal/EventApplicationModal";
import PriorityListModal from "@components/modals/PriorityListModal/PriorityListModal";
import UpdateEventPhotoModal from "@components/modals/UpdateEventPhotoModal/UpdateEventPhotoModal";
import { useCurrentUser } from "@components/providers/CurrentUserProvider";
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
import React from "react";

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

  const { data: eventDetail, refetch: refetchEvent } = useGetEvent(id);
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  // Only the current user's application - the full list is loaded by the priority list modal when needed
  const {
    data: userApplication,
    isPending: isUserApplicationPending,
    refetch: refetchUserApplication,
  } = useGetUserApplicationForEvent(id, currentUser.id);
  const { data: userOrganisationMemberships } = useUserOrganizationMemberships(currentUser?.id ?? "", {
    query: {
      enabled: !!currentUser?.id,
    },
  });

  const isPriorityListOpen = dayjs(eventDetail?.priorityListDeadline ?? eventDetail?.until).isAfter(dayjs());

  const deleteEventApplication = useDeleteEventApplication({
    mutation: {
      onSuccess: () => {
        handleRefetchDetail();
      },
    },
  });

  // API responds with an empty body when the user is not registered
  const isUserRegistered = !!userApplication?.id;

  const handleDeleteApplication = () => {
    if (!confirm("Do you really want to unregister from this event?")) return;
    if (userApplication?.id) {
      deleteEventApplication.mutate({ id: userApplication.id });
    }
  };

  const handleRefetchDetail = () => {
    queryClient.invalidateQueries({ queryKey: [getGetEventQueryKey(id)] });
    queryClient.invalidateQueries({ queryKey: [getGetCurrentUserQueryKey()] });
    refetchUserApplication();
    refetchEvent();
    refetchCurrentUser();
  };

  if (isUserApplicationPending || !eventDetail || !currentUser) {
    return (
      <Grid aria-busy="true" aria-label="Loading event">
        <Grid.Col span={{ base: 12, md: 9 }} order={{ base: 2, md: 1 }}>
          <Skeleton radius="lg" style={{ aspectRatio: "16 / 9" }} />
          <Skeleton height={36} width="55%" mt="lg" />
          <Skeleton height={16} width="30%" mt="md" />
          <Skeleton height={16} width="40%" mt="xs" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }} order={{ base: 1, md: 2 }}>
          <Skeleton height={36} />
          <Skeleton height={36} mt="md" />
        </Grid.Col>
      </Grid>
    );
  }

  const isRegisteredOrAdmin = isUserRegistered || hasSomePermissions(currentUser.role, ["event.reviewSugarCubes"]);

  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, md: 9 }} order={{ base: 2, md: 1 }}>
          <Flex direction="column" w="100%" gap={16}>
            <Flex direction="column" w="100%" gap={8}>
              {eventDetail.photo?.id ? (
                <Paper radius="lg" style={{ overflow: "hidden" }}>
                  <ApiImage src={eventDetail.photo.id} w="100%" h="100%" alt={`Cover photo for ${eventDetail.title}`} />
                </Paper>
              ) : null}
              <Title order={1} mt="sm">
                {eventDetail.title}
              </Title>
              <Flex justify="start" align="center" gap={8} wrap="wrap">
                <IconUsersGroup size={18} stroke={1.75} aria-hidden />
                <Text size="sm" c="dimmed" className="tabular-nums">
                  {"applications" in eventDetail ? `${eventDetail.applications} / ${eventDetail.capacity}` : null}
                </Text>
              </Flex>
              <Text>
                <Text span fw={600}>
                  Registration deadline:
                </Text>{" "}
                <Text span c="dimmed" className="tabular-nums">
                  {dateWithTime(eventDetail.registrationDeadline)}
                </Text>
              </Text>
              <Text>
                <Text span fw={600}>
                  Date:
                </Text>{" "}
                <Text span c="dimmed" className="tabular-nums">
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
                  Event applications
                </Button>

                <Button onClick={openModalPriorityList} color="darkBlue" disabled={!isPriorityListOpen}>
                  Priority list
                </Button>
              </>
            )}

            {isRegisteredOrAdmin && (
              <Button component={Link} href={routes.SUGAR_CUBES({ id: Number(id) })} color="darkBlue">
                Sugar cubes
              </Button>
            )}

            <Divider my={8} />

            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 1, xl: 1 }}>
              <Flex direction="column" gap={16}>
                {currentUser.personalAddress === null && (
                  <Blockquote color="orange" icon={<IconInfoCircle />} p={20} mt={16} radius="md">
                    Add your{" "}
                    <Anchor component={Link} href={routes.ACCOUNT}>
                      personal address
                    </Anchor>{" "}
                    to your account before registering.
                  </Blockquote>
                )}
                {isUserRegistered ? (
                  <Button
                    onClick={handleDeleteApplication}
                    color="red"
                    leftSection={<IconCancel />}
                    disabled={dayjs(eventDetail.registrationDeadline).diff(new Date()) <= 0}
                  >
                    Unregister from event
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
                    Register for event
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
                    Edit event
                  </Button>
                )}
                {hasEveryPermissions(currentUser.role, ["event.update"]) && (
                  <Button onClick={openModalUploadPhoto} leftSection={<IconPhoto />}>
                    Upload image
                  </Button>
                )}
                {hasEveryPermissions(currentUser.role, ["event.manageApplications"]) && (
                  <Button
                    component={Link}
                    href={routes.EVENT_APPLICATIONS_MANAGE({ id: id })}
                    leftSection={<IconUsersGroup />}
                  >
                    Manage applications
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
                      Show invoice
                    </Button>
                    <Button
                      component={Link}
                      href={routes.EVENT_APPLICATIONS_MANAGE({ id: id })}
                      leftSection={<IconCash />}
                      disabled
                    >
                      Upload payment
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
        closeModal={closeModalPriorityList}
        eventId={id}
        userOrganisationMemberships={userOrganisationMemberships ?? []}
        currentUser={currentUser}
        onSuccess={handleRefetchDetail}
      />
    </>
  );
};

export default EventDetail;
