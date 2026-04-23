import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types";
import styles from "./CategoryPicker.module.css";

type CategoryPickerProps = {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  placeholder = "Выберите категорию",
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedCategory = categories.find((category) => category.id === value) ?? null;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        className={`${styles.trigger} surface`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.triggerContent}>
          {selectedCategory ? (
            <>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: selectedCategory.color }}
                aria-hidden="true"
              />
              <span className={styles.selectedLabel}>{selectedCategory.name}</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={`${styles.dropdown} surface`} role="listbox">
          {categories.length ? (
            categories.map((category) => {
              const isSelected = category.id === value;

              return (
                <button
                  key={category.id}
                  className={isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(category.id);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.optionMeta}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span>{category.name}</span>
                  </span>
                  {isSelected ? <span className={styles.checkmark}>•</span> : null}
                </button>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              Нет категорий этого типа. Сначала создайте их на странице категорий.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
