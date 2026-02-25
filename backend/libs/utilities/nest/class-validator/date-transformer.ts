import type { TransformFnParams } from "class-transformer";

export const DateTransform = ({ value }: TransformFnParams) => new Date(value);
