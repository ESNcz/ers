import { Modal as MantineModal, ModalProps as MantineModalProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface ModalProps extends MantineModalProps {}
const Modal = ({ ...modalBaseProps }: ModalProps) => {
  const maxSM = useMediaQuery("(max-width: 48em)");
  return <MantineModal fullScreen={maxSM} {...modalBaseProps} />;
};

export default Modal;
