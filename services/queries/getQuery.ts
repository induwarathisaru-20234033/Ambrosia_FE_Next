import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UseGetQueryProps {
  url: string;
  key: string[];
}

export const useGetQuery = ({ url, key }: UseGetQueryProps) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await axios.get(url);
      return data;
    },
  });
};