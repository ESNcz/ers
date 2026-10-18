import { EventFormStatus } from "@/utils/api.schemas";
import { Badge, Group } from "@mantine/core";

interface FormStatusBadgeProps {
  status: EventFormStatus;
  required: boolean;
  isClosed?: boolean;
}

const FormStatusBadge = ({ status, required, isClosed }: FormStatusBadgeProps) => (
  <Group gap={4}>
    {status === EventFormStatus.complete && <Badge color="green">Complete</Badge>}
    {status === EventFormStatus.incomplete && <Badge color="yellow">Incomplete</Badge>}
    {status === EventFormStatus.missing && <Badge color={required ? "red" : "gray"}>Not filled</Badge>}
    {isClosed && (
      <Badge color="gray" variant="outline">
        Closed
      </Badge>
    )}
  </Group>
);

export default FormStatusBadge;
