import axiosAuth from '@/utils/AxiosInstance';
import { useQuery } from '@tanstack/react-query';

export const useGetQuery = <TResponse, TParams>(
  queryKey: (string | number)[],
  url: string,
  params?: TParams,
  enabled: boolean = true,
) => {

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await axiosAuth.get(url, {
        params: params,
      });
      return data as TResponse;
    },
    enabled: enabled,
  });
};