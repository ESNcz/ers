import { Grid, GridCol, Skeleton } from "@mantine/core";

const EventDetailSkeleton = () => (
  <Grid aria-busy="true" aria-label="Loading event">
    <GridCol span={{ base: 12, md: 9 }} order={{ base: 2, md: 1 }}>
      <Skeleton radius="lg" style={{ aspectRatio: "16 / 9" }} />
      <Skeleton height={36} width="55%" mt="lg" />
      <Skeleton height={16} width="30%" mt="md" />
      <Skeleton height={16} width="40%" mt="xs" />
    </GridCol>
    <GridCol span={{ base: 12, md: 3 }} order={{ base: 1, md: 2 }}>
      <Skeleton height={36} />
      <Skeleton height={36} mt="md" />
    </GridCol>
  </Grid>
);

export default EventDetailSkeleton;
