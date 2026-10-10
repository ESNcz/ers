import { Progress, Stack, Text } from "@mantine/core";

interface UploadProgressProps {
  progress: number;
  isPending: boolean;
}

const UploadProgress = ({ progress, isPending }: UploadProgressProps) => {
  if (!isPending) return null;

  // Upload is done, server is still processing the file
  const isProcessing = progress >= 100;

  return (
    <Stack gap={4} w="100%">
      <Progress value={progress} striped={isProcessing} animated={isProcessing} />
      <Text size="sm" c="dimmed" ta="center">
        {isProcessing ? "Processing…" : `Uploading ${progress}%`}
      </Text>
    </Stack>
  );
};

export default UploadProgress;
