import axiosAuth from "@/utils/AxiosInstance";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

interface MutationVariables {
  url: string;
  body?: any;
  invalidateKey?: (string | number)[];
}

interface DeleteQueryOptions extends UseMutationOptions<
  AxiosResponse,
  unknown,
  MutationVariables,
  unknown
> {
  redirectPath?: string;
  successMessage?: string | null;
  invalidateKey?: (string | number)[];
  toastRef?: React.RefObject<any>;
}

export const useDeleteQuery = ({
  redirectPath,
  invalidateKey,
  successMessage = "Deleted successfully!",
  toastRef,
}: DeleteQueryOptions = {}): UseMutationResult<
  AxiosResponse,
  unknown,
  MutationVariables,
  unknown
> => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, body }: MutationVariables) =>
      axiosAuth.delete(url, { data: body }),
    onSuccess: () => {
      if (invalidateKey) {
        if (Array.isArray(invalidateKey)) {
          invalidateKey.forEach((key) =>
            queryClient.invalidateQueries({
              queryKey: [key],
              refetchType: "active",
            }),
          );
        } else {
          queryClient.invalidateQueries({
            queryKey: invalidateKey,
            refetchType: "active",
          });
        }
      }

      successMessage &&
        toastRef?.current?.show({
          severity: "success",
          summary: "Success",
          detail: successMessage,
          life: 3000,
        });
      redirectPath && router.push(redirectPath);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred while deleting";

      toastRef?.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    },
  });
};
