import { FormFieldDefinition, FormFieldType } from "@/utils/api.schemas";
import { Checkbox, MultiSelect, NumberInput, Select, TextInput, Textarea } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import type { FormInputValue } from "./eventFormUtils";

interface FormFieldInputProps {
  field: FormFieldDefinition;
  form: UseFormReturnType<Record<string, FormInputValue>>;
}

/** One additional-form field rendered as the matching Mantine input */
const FormFieldInput = ({ field, form }: FormFieldInputProps) => {
  const common = { label: field.label, description: field.description, withAsterisk: field.required };

  switch (field.type) {
    case FormFieldType.shortText:
      return <TextInput {...common} maxLength={5000} {...form.getInputProps(field.id)} />;
    case FormFieldType.longText:
      return <Textarea {...common} autosize minRows={3} maxLength={5000} {...form.getInputProps(field.id)} />;
    case FormFieldType.number:
      return <NumberInput {...common} {...form.getInputProps(field.id)} />;
    case FormFieldType.singleSelect:
      return <Select {...common} data={field.options ?? []} clearable {...form.getInputProps(field.id)} />;
    case FormFieldType.multiSelect:
      return <MultiSelect {...common} data={field.options ?? []} clearable {...form.getInputProps(field.id)} />;
    case FormFieldType.checkbox:
      return (
        <Checkbox
          label={field.required ? `${field.label} *` : field.label}
          description={field.description}
          {...form.getInputProps(field.id, { type: "checkbox" })}
        />
      );
    default:
      return null;
  }
};

export default FormFieldInput;
