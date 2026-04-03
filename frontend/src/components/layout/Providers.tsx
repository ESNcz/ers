"use client";

import { onSuccessNotification, showErrorNotification, showLoadingNotification } from "@/utils/notifications";
import { Notifications } from "@mantine/notifications";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnMount: "always",
          },
        },
        mutationCache: new MutationCache({
          onMutate: (_v, mutation) => {
            if (mutation.options.meta?.skipGlobalNotifications) return;
            showLoadingNotification();
          },
          onError: (error, _v, _c, mutation) => {
            if (mutation.options.meta?.skipGlobalNotifications) return;
            showErrorNotification(error);
          },
          onSuccess: (_d, _v, _c, mutation) => {
            if (mutation.options.meta?.skipGlobalNotifications) return;
            onSuccessNotification();
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Notifications />
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
