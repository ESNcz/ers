import { FormFieldDefinition } from "@/utils/api.schemas";
import { Stack, Text } from "@mantine/core";

import { type FormAnswers, formatAnswer } from "./eventFormUtils";

interface FormAnswersViewProps {
  fields: FormFieldDefinition[];
  answers: FormAnswers | undefined;
}

/** Read-only list of answers to the current fields */
const FormAnswersView = ({ fields, answers }: FormAnswersViewProps) => (
  <Stack gap="sm">
    {fields.map((field) => (
      <Stack key={field.id} gap={2}>
        <Text size="xs" c="dimmed" fw={500}>
          {field.label}
        </Text>
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {formatAnswer(answers?.[field.id]) || "—"}
        </Text>
      </Stack>
    ))}
  </Stack>
);

export default FormAnswersView;
