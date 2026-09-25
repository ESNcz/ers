import Layout from "@/components/layout/Layout";
import CurrentUserProvider, { CurrentUserGate } from "@/components/providers/CurrentUserProvider";
import React, { ReactNode } from "react";

interface AuthorizedLayoutProps {
  children: ReactNode;
}

// No cookie access here, so this shell stays static and child routes pick their own rendering strategy.
// The auth gate lives in the proxy (see `proxy.ts`), which redirects to login before any of this renders.
const RootLayout = ({ children }: AuthorizedLayoutProps) => {
  return (
    <CurrentUserProvider>
      <Layout>
        {/* Header renders outside the gate so the chrome paints while the user is still loading */}
        <CurrentUserGate>{children}</CurrentUserGate>
      </Layout>
    </CurrentUserProvider>
  );
};

export default RootLayout;
