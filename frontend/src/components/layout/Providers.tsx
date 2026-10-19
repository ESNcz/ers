"use client";

import { onSuccessNotification, showErrorNotification, showLoadingNotification } from "@/utils/notifications";
import ThemeColorSync from "@components/layout/ThemeColorSync";
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
          onMutate: () => {
            showLoadingNotification();
          },
          onError: (error) => {
            showErrorNotification(error);
          },
          onSuccess: () => {
            onSuccessNotification();
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeColorSync />
      <Notifications layout={"stacked"} />
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
