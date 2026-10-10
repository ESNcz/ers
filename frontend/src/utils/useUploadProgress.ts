import { AxiosProgressEvent } from "axios";
import { useCallback, useState } from "react";

/**
 * Track upload progress of a request, pass `onUploadProgress` to the generated mutation `request` options
 */
export const useUploadProgress = () => {
  const [progress, setProgress] = useState(0);

  const onUploadProgress = useCallback((event: AxiosProgressEvent) => {
    if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
  }, []);

  const resetProgress = useCallback(() => setProgress(0), []);

  return { progress, onUploadProgress, resetProgress };
};
