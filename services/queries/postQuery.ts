import axiosAuth from "@/utils/AxiosInstance";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";

interface MutationVariables {
  url: string;
  body: any;
}

interface PostQueryOptions extends UseMutationOptions<
  AxiosResponse,
  unknown,
  MutationVariables,
  unknown
> {
  redirectPath?: string;
  successMessage?: string | null;
  invalidateKey?: (string | number)[];
  toastRef?: RefObject<{
    show: (options: {
      severity: string;
      summary: string;
      detail: string | null;
      life: number;
    }) => void;
  }>;
}

export const usePostQuery = ({
  redirectPath,
  invalidateKey,
  successMessage,
  toastRef,
}: PostQueryOptions = {}): UseMutationResult<
  AxiosResponse,
  unknown,
  MutationVariables,
  unknown
> => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, body }: MutationVariables) => axiosAuth.post(url, body),
    onSuccess: () => {
      if (invalidateKey) {
        if (Array.isArray(invalidateKey)) {
          invalidateKey.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
          );
        } else {
          queryClient.invalidateQueries({ queryKey: invalidateKey });
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
  });
};
