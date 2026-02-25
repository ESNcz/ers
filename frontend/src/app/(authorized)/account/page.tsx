"use client";

import { useGetCurrentUser, useUpdateCurrentUser, useUpdateCurrentUserPhoto } from "@/utils/api";
import { CreateAddress, CreateUserGender, UpdateUser } from "@/utils/api.schemas";
import { apiImageURL } from "@/utils/apiImageURL";
import { Dropzone } from "@components/Dropzone/Dropzone";
import ImageEditor from "@components/ImageEditor/ImageEditor";
import getCroppedImg from "@components/ImageEditor/imageEdit";
import Select from "@components/primitives/Select";
import {
  Accordion,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Overlay,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Form, isNotEmpty, useForm } from "@mantine/form";
import { useHover } from "@mantine/hooks";
import { IconMoodEdit } from "@tabler/icons-react";
import CountryList from "country-list-with-dial-code-and-flag";
import React, { useEffect, useMemo, useState } from "react";
import { FileWithPath } from "react-dropzone-esm";
import { Area } from "react-easy-crop";

interface UpdateUserProps extends Partial<UpdateUser> {
  confirmPassword?: string;
}

const AccountPage = () => {
  const { hovered, ref: hoverRef } = useHover();

  const [croppedArea, setCroppedArea] = useState<{ croppedArea: Area; croppedAreaPixels: Area } | null>(null);
  const [newUserPhoto, setNewUserPhoto] = useState<FileWithPath | null>(null);
  const [isUpdatingUserPhoto, setUpdatingUserPhoto] = useState(false);

  const [imageURL, _photoPreview] = useMemo(() => {
    if (!newUserPhoto) return [undefined, undefined];
    const imageUrl = URL.createObjectURL(newUserPhoto);
    return [
      imageUrl,
      <Image
        key="image-preview"
        src={imageUrl}
        w="200px"
        h="200px"
        alt="User photo preview"
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />,
    ];
  }, [newUserPhoto]);

  const isPersonalAddress = (address: CreateAddress | undefined | null) => {
    return address ? Object.entries(address).some(([_key, value]) => (value as string)?.length > 0) : undefined;
  };
  const { data: currentUser, refetch: fetchCurrentUser, isFetchedAfterMount } = useGetCurrentUser();

  useEffect(() => {
    if (!currentUser) return;
    const userValues = {
      ...form.values,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      username: currentUser.username,
      gender: currentUser.gender,
      pronouns: currentUser.pronouns ?? undefined,
      phonePrefix: currentUser.phonePrefix,
      phoneNumber: currentUser.phoneNumber,
      personalAddress: currentUser.personalAddress ?? {
        street: "",
        houseNumber: "",
        zip: "",
        city: "",
        country: "",
      },
    };

    form.setInitialValues(userValues);
    form.setValues(userValues);
    form.reset();
    form.resetTouched();
  }, [currentUser, fetchCurrentUser, isFetchedAfterMount]); // eslint-disable-line react-hooks/exhaustive-deps

  const form = useForm<UpdateUserProps>({
    mode: "uncontrolled",
    initialValues: {
      firstName: undefined,
      lastName: undefined,
      username: undefined,
      gender: undefined,
      pronouns: undefined,
      password: undefined,
      confirmPassword: undefined,
      phonePrefix: undefined,
      phoneNumber: undefined,
      personalAddress: undefined,
    },
    validate: {
      firstName: isNotEmpty("This field cannot be empty"),
      lastName: isNotEmpty("This field cannot be empty"),
      confirmPassword: (value, values) => (values.password === value ? null : "Password does not match"),
      phonePrefix: isNotEmpty("This field cannot be empty"),
      phoneNumber: (value) =>
        value ? (value?.match(/^\d+?$/) ? null : "Phone number must be numeric.") : "Phone Number can not be empty.",
      personalAddress: {
        street: (value, values) => (values.personalAddress ? (value ? null : "This field should not be empty") : null),
        houseNumber: (zipValue, values) =>
          values.personalAddress
            ? zipValue
              ? /^(\d+)(\/\d+)?$/.test(zipValue)
                ? null
                : "Use number format"
              : "This field should not be empty"
            : null,
        zip: (value, values) => (values.personalAddress ? (value ? null : "This field should not be empty") : null),
        city: (value, values) => (values.personalAddress ? (value ? null : "This field should not be empty") : null),
        country: (value, values) => (values.personalAddress ? (value ? null : "This field should not be empty") : null),
      },
    },
    transformValues: (values) => {
      const isAddressActive = isPersonalAddress(values.personalAddress);

      const { personalAddress, ...restValues } = values;

      return {
        ...restValues,
        personalAddress: isAddressActive ? values.personalAddress : undefined,
      };
    },
  });

  const updateUserMutation = useUpdateCurrentUser({
    mutation: {
      onSuccess: (data) => {
        form.setInitialValues(data);
        form.setValues(data);
        form.resetDirty();
        form.resetTouched();
        fetchCurrentUser();
      },
    },
  });

  const handleUpdateUser = (values: UpdateUser) => {
    updateUserMutation.mutate({
      data: values,
    });
  };

  const isTouchedDirty = form.isTouched() && form.isDirty();

  const updateUserPhotoMutation = useUpdateCurrentUserPhoto({
    mutation: {
      onSuccess: () => {
        setCroppedArea(null);
        setNewUserPhoto(null);
        fetchCurrentUser();
      },
    },
  });

  const uploadNewUserImage = async () => {
    if (newUserPhoto && croppedArea) {
      const croppedImage = await getCroppedImg({
        imageSrc: URL.createObjectURL(newUserPhoto),
        pixelCrop: croppedArea.croppedAreaPixels,
        returnType: "Blob",
      });
      if (croppedImage instanceof Blob) {
        updateUserPhotoMutation.mutate({
          data: {
            file: croppedImage,
          },
        });
      }
    }
  };

  const cancelPhotoUpdate = () => {
    setCroppedArea(null);
    setNewUserPhoto(null);
  };

  return (
    <Container size="sm" mt="lg">
      <Flex direction="column" justify="center" align="center" gap={12}>
        <Text size="xl" ta="center">
          Account Page
        </Text>
        <Box pos="relative" w={100} h={100} ref={hoverRef}>
          <Avatar src={apiImageURL(currentUser?.photo)} alt="Avatar" radius="50%" size={100} />
          {hovered && (
            <Overlay radius="50%">
              <Button
                w="100%"
                h="100%"
                radius="50%"
                variant="transparent"
                size="xl"
                onClick={() => {
                  setNewUserPhoto(null);
                  setUpdatingUserPhoto(!isUpdatingUserPhoto);
                }}
              >
                <IconMoodEdit color="white" />
              </Button>
            </Overlay>
          )}
        </Box>
        <Group>
          {newUserPhoto && (
            <>
              <Box pos="relative" w="200px" h="200px">
                <ImageEditor
                  cropper={{
                    image: imageURL,
                    cropShape: "round",
                    onCropAreaChange: (croppedArea, croppedAreaPixels) =>
                      setCroppedArea({
                        croppedArea,
                        croppedAreaPixels,
                      }),
                  }}
                />
              </Box>
              <Stack>
                <Button onClick={uploadNewUserImage}>Update Image</Button>
                <Button onClick={cancelPhotoUpdate} color="red">
                  Cancel
                </Button>
              </Stack>
            </>
          )}

          {/*<Image*/}
          {/*  key="result-image-preview"*/}
          {/*  src={croppedImage}*/}
          {/*  w="200px"*/}
          {/*  h="200px"*/}
          {/*  alt="User photo preview"*/}
          {/*  onLoad={() => croppedImage && URL.revokeObjectURL(croppedImage)}*/}
          {/*/>*/}
        </Group>
        {isUpdatingUserPhoto && (
          <Dropzone
            handleOnDrop={(files) => {
              setNewUserPhoto(files[0]);
              setUpdatingUserPhoto(false);
            }}
            multiple={false}
            maxFiles={1}
          />
        )}
      </Flex>

      <Form form={form} onSubmit={handleUpdateUser}>
        <Flex direction="column" gap={12}>
          <SimpleGrid cols={2}>
            <TextInput label="First name" {...form.getInputProps("firstName")} />
            <TextInput label="Second name" {...form.getInputProps("lastName")} />
          </SimpleGrid>
          <SimpleGrid cols={3}>
            <TextInput label="Username" {...form.getInputProps("username")} />
            <Select
              label="Gender"
              data={Object.entries(CreateUserGender).map(([key, gender]) => {
                return {
                  label: gender, // (String(gender).charAt(0).toUpperCase() + String(gender).slice(1)).replaceAll("-", " "),
                  value: key,
                };
              })}
              {...form.getInputProps("gender")}
            />
            <TextInput label="Pronouns" {...form.getInputProps("pronouns")} />
          </SimpleGrid>
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Prefix"
                defaultValue={
                  form.values.phonePrefix
                    ? () => {
                        if (!form.values.phonePrefix) return null;
                        const country = CountryList.findOneByDialCode(form.values.phonePrefix);
                        return {
                          label: `${country?.flag} (${country?.countryCode}) ${country?.code}`,
                          value: country?.code,
                        };
                      }
                    : null
                }
                data={CountryList.getAll()
                  .filter(
                    (value, index, array) => index === array.findIndex((t) => t.countryCode === value.countryCode),
                  )
                  .map((country) => {
                    return {
                      label: `${country.flag} (${country.countryCode}) ${country.code}`,
                      value: country.countryCode,
                    };
                  })}
                {...form.getInputProps("phonePrefix")}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput label="Phone number" {...form.getInputProps("phoneNumber")} />
            </Grid.Col>
          </Grid>
          <SimpleGrid cols={2}>
            <PasswordInput
              label="Password"
              type="password"
              {...form.getInputProps("password")}
              onChange={(e) => {
                form.setFieldValue("password", e.currentTarget.value.length > 0 ? e.currentTarget.value : undefined);
              }}
            />
            <PasswordInput
              label="Confirm Password"
              type="password"
              {...form.getInputProps("confirmPassword")}
              onChange={(e) => {
                form.setFieldValue(
                  "confirmPassword",
                  e.currentTarget.value.length > 0 ? e.currentTarget.value : undefined,
                );
              }}
            />
          </SimpleGrid>
          <Accordion defaultValue="Apples">
            <Accordion.Item value="Personal Address">
              <Accordion.Control>
                <Flex direction="row" gap={8}>
                  <Text>
                    Personal Address{" "}
                    {currentUser && !currentUser?.personalAddress && (
                      <Text c="red" span>
                        (Missing information)
                      </Text>
                    )}
                  </Text>
                </Flex>
              </Accordion.Control>
              <Accordion.Panel>
                <Grid>
                  <Grid.Col span={8}>
                    <TextInput
                      label="Street"
                      key={form.key("personalAddress.street")}
                      {...form.getInputProps("personalAddress.street")}
                      required={isPersonalAddress(form.values.personalAddress)}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <TextInput
                      label="House Number"
                      key={form.key("personalAddress.houseNumber")}
                      {...form.getInputProps("personalAddress.houseNumber")}
                      required={isPersonalAddress(form.values.personalAddress)}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="ZIP code"
                      key={form.key("personalAddress.zip")}
                      {...form.getInputProps("personalAddress.zip")}
                      required={isPersonalAddress(form.values.personalAddress)}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="City"
                      key={form.key("personalAddress.city")}
                      {...form.getInputProps("personalAddress.city")}
                      required={isPersonalAddress(form.values.personalAddress)}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Country"
                      key={form.key("personalAddress.country")}
                      {...form.getInputProps("personalAddress.country")}
                      required={isPersonalAddress(form.values.personalAddress)}
                    />
                  </Grid.Col>
                </Grid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Flex>
        <Group justify="center" mt="lg">
          <Button type="submit" disabled={!isTouchedDirty} loading={updateUserMutation.isPending}>
            Save changes
          </Button>
        </Group>
      </Form>
    </Container>
  );
};
export default AccountPage;
