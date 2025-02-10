import { ReactNode } from "react";
import Modal from "react-modal";

interface ModalComponentProps extends ReactModal.Props {
  children: ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

Modal.setAppElement("#root");
const ModalComponent = (props: ModalComponentProps) => {
  function closeModal() {
    props.setIsOpen(false);
  }
  return (
    <>
      <Modal
        onRequestClose={closeModal}
        shouldCloseOnEsc={true}
        contentLabel="Example Modal"
        {...props}
      >
        {props.children}
      </Modal>
    </>
  );
};

export default ModalComponent;
