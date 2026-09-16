import { Photo } from "@/utils/api.schemas";
import { BROWSER_API_URL } from "@/utils/customInstance";

export const apiImageURL = (photo: Photo | string | undefined | null) => {
  if (!photo) return "/imagePlaceholder.svg";
  if (typeof photo === "string") return `${BROWSER_API_URL}/photo/${photo}`;
  return `${BROWSER_API_URL}/photo/${photo.id}`;
};
