"use client";

import ManagePeopleList from "@components/ManagePeopleList/ManagePeopleList";
import { Container } from "@mantine/core";

const ManagePeoplePage = () => {
  return (
    <Container size="xl">
      <ManagePeopleList />
    </Container>
  );
};

export default ManagePeoplePage;
