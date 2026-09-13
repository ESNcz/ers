import { ErrorType } from "@/utils/customInstance";
import { notifications } from "@mantine/notifications";

export const updateErrorNotification = () => {
  notifications.hide("loading");
  notifications.update({
    title: "Request failed",
    message: "Check the entered information and try again.",
    color: "red",
    loading: false,
    autoClose: true,
  });
};

export const showErrorNotification = (errorResponse: ErrorType | Error) => {
  // @ts-ignore
  const { message, error, statusCode } = errorResponse.response?.data;

  updateErrorNotification();

  if (typeof message === "object") {
    message.forEach((err: string) => {
      notifications.show({
        title: `${statusCode} - ${error}`,
        message: err,
        color: "red",
      });
    });
    return;
  }
  notifications.show({
    title: `${statusCode} - ${error}`,
    message: message ?? error,
    color: "red",
  });
};

export const showLoadingNotification = () => {
  notifications.show({
    id: "loading",
    title: "Saving",
    message: "Processing your request…",
    loading: true,
    autoClose: true,
  });
};

export const onSuccessNotification = () => {
  notifications.hide("loading");
  notifications.show({
    title: "Done",
    message: "Your changes were saved.",
    loading: false,
    autoClose: true,
    color: "green",
  });
};
