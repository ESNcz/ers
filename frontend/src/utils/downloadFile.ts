export function downloadFile(response: any) {
  const url = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data.xlsx");
  link.click();
  window.URL.revokeObjectURL(url);
  return response;
}
