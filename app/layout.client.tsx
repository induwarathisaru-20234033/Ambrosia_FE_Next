"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/contexts/ToastContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function LayoutClient({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

export default LayoutClient;
