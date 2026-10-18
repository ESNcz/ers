export function downloadFile(response: any, fileName = "data.xlsx") {
  const url = window.URL.createObjectURL(new Blob([response]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  link.click();
  window.URL.revokeObjectURL(url);
  return response;
}
