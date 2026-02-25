"use client";

import { useGetSettings, useUpdateSettings } from "@/utils/api";
import { Settings, SettingsDTO } from "@/utils/api.schemas";
import RichTextEditor from "@components/Richtext/RichTextEditor";
import { Button, Container, Grid, Group, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import React, { useEffect } from "react";

const SettingsPage = () => {
  const { data: settingsData, isFetchedAfterMount, refetch, isLoading } = useGetSettings();

  const form = useForm<SettingsDTO>({
    initialValues: {
      termsAndConditions: "",
      privacyPolicy: "",
      footerDescription: "",
    },
  });
  const isTouchedDirty = form.isTouched() && form.isDirty();

  const handleInitForm = (data: Settings) => {
    const initValues = {
      termsAndConditions: data.termsAndConditions ?? "",
      privacyPolicy: data.privacyPolicy ?? "",
      footerDescription: data.footerDescription ?? "",
    };
    form.setInitialValues(initValues);
    form.setValues(initValues);
    form.reset();
    form.resetTouched();
  };
  useEffect(() => {
    if (!settingsData) return;
    handleInitForm(settingsData);
  }, [settingsData, isFetchedAfterMount]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutationUpdateSettings = useUpdateSettings({
    mutation: {
      onSuccess: (data) => {
        handleInitForm(data);
      },
    },
  });

  const handleUpdateSettings = () => {
    mutationUpdateSettings.mutate({ data: form.values });
  };

  return (
    <Container size="sm" mt="lg">
      <Form form={form} onSubmit={handleUpdateSettings}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Terms and Conditions"
              key={form.key("termsAndConditions")}
              {...form.getInputProps("termsAndConditions")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Privacy Policy"
              key={form.key("privacyPolicy")}
              {...form.getInputProps("privacyPolicy")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <RichTextEditor
              label="Footer description"
              key={form.key("footerDescription")}
              {...form.getInputProps("footerDescription")}
            />
          </Grid.Col>
        </Grid>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={mutationUpdateSettings.isPending}>
            Save changes
          </Button>
        </Group>
      </Form>
    </Container>
  );
};
export default SettingsPage;
