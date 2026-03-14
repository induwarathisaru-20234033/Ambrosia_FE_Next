import axiosAuth from "@/utils/AxiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { RefObject } from "react";

interface GetQueryOptions {
  enabled?: boolean;
  toastRef?: RefObject<any>;
  showErrorToast?: boolean;
}

export const useGetQuery = <TResponse, TParams>(
  queryKey: (string | number)[],
  url: string,
  params?: TParams,
  options?: GetQueryOptions | boolean,
) => {
  // Support backward compatibility: if options is boolean, treat it as 'enabled'
  const enabled =
    typeof options === "boolean" ? options : (options?.enabled ?? true);
  const toastRef = typeof options === "object" ? options.toastRef : undefined;
  const showErrorToast =
    typeof options === "object" ? (options.showErrorToast ?? true) : true;

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await axiosAuth.get(url, {
        params: params,
      });
      return data as TResponse;
    },
    enabled: enabled,
    retry: 1,
  });

  // Show error toast when query fails
  useEffect(() => {
    if (query.isError && showErrorToast && toastRef?.current) {
      const error = query.error as any;
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load data";

      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    }
  }, [query.isError, query.error, showErrorToast, toastRef]);

  return query;
};
