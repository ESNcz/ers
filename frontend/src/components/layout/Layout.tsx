import styles from "@components/layout/Layout.module.css";
import LayoutFooter from "@components/layout/LayoutFooter";
import LayoutHeader from "@components/layout/LayoutHeader";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <LayoutHeader />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <LayoutFooter />
    </div>
  );
};

export default Layout;
