import { useUpdateEventPhoto } from "@/utils/api";
import { Dropzone } from "@components/Dropzone/Dropzone";
import Modal from "@components/Modal/Modal";
import { Button, Center, Group, Image } from "@mantine/core";
import React, { useState } from "react";
import { FileWithPath } from "react-dropzone-esm";

interface MyModalProps {
  eventId: number;
  isOpened: boolean;
  closeModal: () => void;
  handleSuccess: () => void;
}

const UpdateEventPhotoModal: React.FC<MyModalProps> = ({ eventId, isOpened, closeModal, handleSuccess = () => {} }) => {
  const [file, setFile] = useState<FileWithPath | null>(null);

  const uploadEventPhoto = useUpdateEventPhoto({
    mutation: {
      onSuccess: () => {
        handleSuccess();
        setFile(null);
        closeModal();
      },
    },
  });

  const handleUpdateEvenPhoto = () => {
    if (!file) return;
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
      <Dropzone
        handleOnDrop={(files) => {
          setFile(files[0]);
        }}
        multiple={false}
        maxFiles={1}
      />
      {file && (
        <Center>
          <Image
            key="result-image-preview"
            src={URL.createObjectURL(file)}
            w="200px"
            h="200px"
            alt="User photo preview"
          />
        </Center>
      )}
      <Group justify="center" mt="lg">
        <Button onClick={handleUpdateEvenPhoto} disabled={!file} loading={uploadEventPhoto.isPending}>
          Upload Photo
        </Button>
      </Group>
    </Modal>
  );
};
export default UpdateEventPhotoModal;
