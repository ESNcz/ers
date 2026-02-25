import styles from "@components/Dropzone/Dropzone.module.css";
import { Button, Group, Text } from "@mantine/core";
import {
  Dropzone as DropzoneMantine,
  FileWithPath,
  IMAGE_MIME_TYPE,
  DropzoneProps as MantineDropzoneProps,
} from "@mantine/dropzone";
import { IconCloudUpload, IconDownload, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";

interface DropzoneProps extends Partial<MantineDropzoneProps> {
  maxSize?: number;
  handleOnDrop: (files: FileWithPath[]) => void;
}

export function Dropzone({ handleOnDrop, maxSize, ...props }: DropzoneProps) {
  const openRef = useRef<() => void>(null);
  const [defaultSize] = useState<number>(maxSize ?? 5);

  return (
    <div className={styles.wrapper}>
      <DropzoneMantine
        openRef={openRef}
        onDrop={(files) => {
          handleOnDrop(files);
        }}
        onReject={(files) => console.warn("rejected files", files)}
        className={styles.dropzone}
        radius="md"
        accept={props.accept ?? IMAGE_MIME_TYPE}
        maxSize={defaultSize * 1024 ** 2}
        {...props}
      >
        <div style={{ pointerEvents: "none" }}>
          <Group justify="center">
            <DropzoneMantine.Accept>
              <IconDownload size={50} color="blue" stroke={1.5} />
            </DropzoneMantine.Accept>
            <DropzoneMantine.Reject>
              <IconX size={50} color="red" stroke={1.5} />
            </DropzoneMantine.Reject>
            <DropzoneMantine.Idle>
              <IconCloudUpload size={50} stroke={1.5} />
            </DropzoneMantine.Idle>
          </Group>

          <Text ta="center" fw={700} fz="lg" mt="xl">
            <DropzoneMantine.Accept>Drop files here</DropzoneMantine.Accept>
            <DropzoneMantine.Reject>File less than {defaultSize}MB</DropzoneMantine.Reject>
            <DropzoneMantine.Idle>Upload resume</DropzoneMantine.Idle>
          </Text>
          <Text ta="center" fz="sm" mt="xs" c="dimmed">
            Drag&apos;n&apos;drop files here to upload. We can accept only files that are less than {defaultSize}MB in
            size.
          </Text>
        </div>
      </DropzoneMantine>

      <Button className={styles.control} size="md" radius="xl" onClick={() => openRef.current?.()}>
        Select files
      </Button>
    </div>
  );
}
