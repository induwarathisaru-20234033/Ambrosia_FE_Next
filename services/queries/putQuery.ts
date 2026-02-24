import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UsePutQueryProps {
  redirectPath?: string;
  successMessage?: string;
  toastRef: any; // replace with your actual ToastRef type
}

export const usePutQuery = ({ redirectPath, successMessage, toastRef }: UsePutQueryProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ url, body }: { url: string; body: any }) =>
      axios.put(url, body).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      if (successMessage) toastRef.current?.show({ severity: 'success', summary: successMessage });
      if (redirectPath) router.push(redirectPath);
    },
    onError: (error) => {
      toastRef.current?.show({ severity: 'error', summary: 'Update failed', detail: error.message });
    },
  });
};