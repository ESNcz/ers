import LayoutFooter from "@components/layout/LayoutFooter";
import LayoutHeader from "@components/layout/LayoutHeader";
import { Box } from "@mantine/core";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box mih="100vh" h="100%">
      <LayoutHeader />
      {/* Height calculated from full height (100% - Header - Footer) */}
      <Box mih="calc(100vh - (84px + 50px + 56px))">{children}</Box>
      <LayoutFooter />
    </Box>
  );
};

export default Layout;
