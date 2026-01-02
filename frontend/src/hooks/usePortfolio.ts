import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { portfolio } = await api.getPortfolio();
      return portfolio;
    },
  });
}
