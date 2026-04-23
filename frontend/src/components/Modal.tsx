import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={`${styles.shell} surface`} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
