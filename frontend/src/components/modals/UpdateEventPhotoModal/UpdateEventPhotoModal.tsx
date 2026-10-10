import { useUpdateEventPhoto } from "@/utils/api";
import { useUploadProgress } from "@/utils/useUploadProgress";
import { Dropzone } from "@components/Dropzone/Dropzone";
import Modal from "@components/Modal/Modal";
import UploadProgress from "@components/UploadProgress/UploadProgress";
import { Button, Group, Image, Stack, Text } from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { FileWithPath } from "react-dropzone-esm";

interface MyModalProps {
  eventId: number;
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess: () => void;
}

const UpdateEventPhotoModal: React.FC<MyModalProps> = ({ eventId, isOpened, closeModal, handleSuccess = () => {} }) => {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const { progress, onUploadProgress, resetProgress } = useUploadProgress();

  // Create preview URL once per file - creating it in render reloads the image on every progress update
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const uploadEventPhoto = useUpdateEventPhoto({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        setFile(null);
        closeModal();
      },
    },
    request: { onUploadProgress },
  });

  const handleUpdateEvenPhoto = () => {
    if (!file) return;
    resetProgress();
    uploadEventPhoto.mutate({
      eventId: eventId,
      data: {
        file: file,
      },
    });
  };

  return (
    <Modal
      size="xl"
      opened={isOpened}
      onClose={() => {
        setFile(null);
        closeModal();
      }}
      title="Update Event Photo"
    >
      <Stack gap="md">
        {!uploadEventPhoto.isPending && (
          <Dropzone
            handleOnDrop={(files) => {
              setFile(files[0]);
            }}
            multiple={false}
            maxFiles={1}
          />
        )}
        {file && previewUrl && (
          <Stack gap={4} align="center">
            <Image src={previewUrl} w="100%" mah={360} fit="contain" radius="md" alt="Event photo preview" />
            <Text size="sm" c="dimmed">
              {file.name} · {(file.size / 1024 ** 2).toFixed(1)} MB
            </Text>
          </Stack>
        )}
        {uploadEventPhoto.isPending ? (
          <UploadProgress progress={progress} isPending={uploadEventPhoto.isPending} />
        ) : (
          <Group justify="center">
            <Button onClick={handleUpdateEvenPhoto} disabled={!file}>
              Upload Photo
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
};
export default UpdateEventPhotoModal;
