"use client";

import { useGetCurrentUser } from "@/utils/api";
import { User } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { Center, Loader } from "@mantine/core";
import { isAxiosError } from "axios";
import { ReactNode, createContext, useContext, useEffect } from "react";

interface CurrentUserContextValue {
  // Undefined until the first fetch resolves - read it through `useCurrentUser` from inside `CurrentUserGate`,
  // which waits for it, or through `useOptionalCurrentUser` when the component renders outside the gate.
  currentUser: User | undefined;
  isLoading: boolean;
  refetch: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

interface CurrentUserProviderProps {
  children: ReactNode;
}

const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
  // Single observer for the whole authorized tree. `staleTime` overrides the global `refetchOnMount: "always"`
  // default, so navigating between authorized routes reuses the cached user instead of refetching.
  const { data, isLoading, error, refetch } = useGetCurrentUser({
    query: {
      staleTime: 5 * 60 * 1000,
      refetchOnMount: true,
      retry: false,
    },
  });

  // Token revoked, user deleted or signature invalid. Full navigation so the query cache of this user is dropped.
  useEffect(() => {
    if (isAxiosError(error) && error.response?.status === 401) window.location.assign(routes.LOGOUT);
  }, [error]);

  return (
    <CurrentUserContext.Provider value={{ currentUser: data, isLoading, refetch }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

const useCurrentUserContext = () => {
  const context = useContext(CurrentUserContext);
  if (!context) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return context;
};

/** Holds page content back until the user is loaded, so everything below can treat it as always present. */
export const CurrentUserGate = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useCurrentUserContext();

  if (!currentUser)
    return (
      <Center h="50vh">
        <Loader />
      </Center>
    );

  return <>{children}</>;
};

/** The user, guaranteed present. Only valid below `CurrentUserGate`. */
export const useCurrentUser = () => {
  const { currentUser, refetch } = useCurrentUserContext();
  if (!currentUser) throw new Error("useCurrentUser must be used within CurrentUserGate - use useOptionalCurrentUser");
  return { currentUser, refetch };
};

/** For chrome that renders alongside the gate (the header) and so paints before the user arrives. */
export const useOptionalCurrentUser = () => useCurrentUserContext();

export default CurrentUserProvider;
