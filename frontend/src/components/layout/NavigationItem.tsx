import { MainLink } from "@components/layout/LayoutHeader";
import styles from "@components/layout/LayoutHeader.module.css";
import { Anchor, AnchorProps } from "@mantine/core";
import Link from "next/link";
import { forwardRef } from "react";

interface AnchorLinkProps extends AnchorProps {
  item: MainLink;
  closeDrawer: () => void;
}

const NavigationItem = forwardRef<HTMLAnchorElement, AnchorLinkProps>(({ item, closeDrawer, ...props }, ref) => (
  <Anchor
    href={item.link}
    component={Link}
    className={styles.mainLink}
    onClick={() => {
      closeDrawer();
    }}
    {...props}
    ref={ref}
  >
    {item.label}
  </Anchor>
));

NavigationItem.displayName = "NavigationItem";

export default NavigationItem;
