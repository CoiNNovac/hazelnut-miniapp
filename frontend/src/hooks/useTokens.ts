import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const { tokens } = await api.getTokens();
      return tokens;
    },
  });
}

export function useToken(id: string) {
  return useQuery({
    queryKey: ['token', id],
    queryFn: async () => {
      const { token } = await api.getToken(id);
      return token;
    },
    enabled: !!id,
  });
}
