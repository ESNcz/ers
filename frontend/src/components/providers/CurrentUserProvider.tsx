"use client";

import { useGetCurrentUser } from "@/utils/api";
import { User } from "@/utils/api.schemas";
import { ReactNode, createContext, useContext } from "react";

interface CurrentUserContextValue {
  currentUser: User;
  refetch: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

interface CurrentUserProviderProps {
  initialUser: User;
  children: ReactNode;
}

const CurrentUserProvider = ({ initialUser, children }: CurrentUserProviderProps) => {
  // Single observer for the whole authorized tree. Cache is seeded on the server via HydrationBoundary,
  // so no request on mount; invalidating the query key still refetches through this observer.
  const { data, refetch } = useGetCurrentUser({
    query: {
      refetchOnMount: false,
    },
  });

  return (
    <CurrentUserContext.Provider value={{ currentUser: data ?? initialUser, refetch }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return context;
};

export default CurrentUserProvider;
