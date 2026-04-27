import { useQuery } from '@tanstack/react-query';
import { serverAxios } from '@/lib/axios';

export interface PortkeyProvider {
  id: string;
  name: string;
  provider: string;
  status: string;
  slug: string;
  workspace_id: string;
}

export const usePortkeyProviders = () => {
  return useQuery({
    queryKey: ['portkey-providers'],
    queryFn: async () => {
      const response = await serverAxios.get('/portkey/providers');
      return response.data.data as PortkeyProvider[];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
