import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  headerActions?: ReactNode;
};

export function Modal({ title, children, onClose, headerActions }: ModalProps) {
  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={`${styles.shell} surface`} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <div className={styles.headerActions}>
            {headerActions}
            <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
