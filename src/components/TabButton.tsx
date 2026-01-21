import type { ReactNode } from "react";

interface TabButtonProps {
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
  children: ReactNode;
}

export function TabButton({ id, isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      className={isActive ? "tab-button tab-button--active" : "tab-button"}
      role="tab"
      aria-selected={isActive}
      aria-controls={`${id}-panel`}
      id={`${id}-tab`}
      type="button"
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  );
}
