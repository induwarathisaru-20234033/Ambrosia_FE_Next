"use client";

import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";
import type { ReactNode, RefObject } from "react";

interface ToastContext {
  toastRef: RefObject<Toast | null>;
}

const ToastContext = createContext<ToastContext | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const toastRef = useRef<Toast | null>(null);

  return (
    <ToastContext.Provider value={{ toastRef }}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

function useToastRef() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastRef must be used within ToastProvider");
  }
  return context.toastRef;
}

export { ToastProvider, useToastRef };
