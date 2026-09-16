import Layout from "@/components/layout/Layout";
import CurrentUserProvider from "@/components/providers/CurrentUserProvider";
import { getGetCurrentUserQueryKey } from "@/utils/api";
import { getServerCurrentUser } from "@/utils/getServerCurrentUser";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import React, { ReactNode } from "react";

interface AuthorizedLayoutProps {
  children: ReactNode;
}
const RootLayout = async ({ children }: AuthorizedLayoutProps) => {
  const currentUser = await getServerCurrentUser();

  const queryClient = new QueryClient();
  queryClient.setQueryData(getGetCurrentUserQueryKey(), currentUser);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CurrentUserProvider initialUser={currentUser}>
        <Layout>{children}</Layout>
      </CurrentUserProvider>
    </HydrationBoundary>
  );
};

export default RootLayout;
