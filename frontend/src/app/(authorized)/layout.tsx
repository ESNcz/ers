import Layout from "@/components/layout/Layout";
import React, { ReactNode } from "react";

interface AuthorizedLayoutProps {
  children: ReactNode;
}
const RootLayout = ({ children }: AuthorizedLayoutProps) => {
  return <Layout>{children}</Layout>;
};

export default RootLayout;
