export function extractText(input: string | Record<string, unknown>): string {
  if (!input) return "";
  const node = typeof input === "string" ? JSON.parse(input) : input;
  if (node.type === "text") return (node.text as string) ?? "";
  if (Array.isArray(node.content))
    return node.content.map((child: Record<string, unknown>) => extractText(child)).join("");
  return "";
}
