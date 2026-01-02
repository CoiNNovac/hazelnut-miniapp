import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProfits() {
  return useQuery({
    queryKey: ['profits'],
    queryFn: async () => {
      const { profits } = await api.getProfits();
      return profits;
    },
  });
}

export function useClaimProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profitId: string) => {
      const { profit } = await api.claimProfit(profitId);
      return profit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profits'] });
    },
  });
}
