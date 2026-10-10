import styles from "@components/layout/Layout.module.css";
import LayoutFooter from "@components/layout/LayoutFooter";
import LayoutHeader from "@components/layout/LayoutHeader";
import InstallAppBanner from "@components/pwa/InstallAppBanner";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.shell}>
      <LayoutHeader />
      <main className={styles.main}>{children}</main>
      <LayoutFooter />
      <InstallAppBanner />
    </div>
  );
};

export default Layout;
