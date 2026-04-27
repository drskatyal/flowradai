import { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { serverAxios } from '@/lib/axios';

// Previous Implementation (Commented out as requested)
/*
export interface PortkeyModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export const usePortkeyModels = ({ slug, provider }: { slug: string, provider: string }) => {
  return useQuery({
    queryKey: ['portkey-models', slug, provider],
    queryFn: async () => {
      const response = await serverAxios.get(`/portkey/models/${slug}?provider=${provider}`);
      return response.data.data as PortkeyModel[];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
*/

// New Implementation based on provide code

export interface Model {
  id: string;
  slug: string;
  canonical_slug: string;
  object: string;
}

export interface PortkeyResponse {
  object: string;
  total: number;
  data: Model[];
}

export interface PortkeyFilters {
  provider: string;
  ai_service: string;
  limit: string;
}

const API_KEY = process.env.NEXT_PUBLIC_PORTKEY_API_KEY;

export const usePortkeyModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<PortkeyResponse | null>(null);
  const [filters, setFilters] = useState<PortkeyFilters>({
    provider: 'open-ai',
    ai_service: '',
    limit: '20',
  });

  const fetchModels = async (queryParams?: Partial<PortkeyFilters>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      const provider = queryParams?.provider || filters.provider;
      const ai_service = queryParams?.ai_service || filters.ai_service;
      const limit = queryParams?.limit || filters.limit;

      if (provider) params.append('provider', provider);
      if (ai_service) params.append('ai_service', ai_service);
      if (limit) params.append('limit', limit);

      const queryString = params.toString();
      const url = `https://api.portkey.ai/v1/models${queryString ? '?' + queryString : ''}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (API_KEY) {
        headers['x-portkey-api-key'] = API_KEY;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: PortkeyResponse = await response.json();
      setResponseData(data);
      setModels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchModels(filters);
  };

  const handleReset = () => {
    const defaultFilters: PortkeyFilters = { provider: '', ai_service: '', limit: '20' };
    setFilters(defaultFilters);
    fetchModels(defaultFilters);
  };

  return {
    models,
    loading,
    error,
    responseData,
    filters,
    handleFilterChange,
    handleApplyFilters,
    handleReset,
    fetchModels,
  };
};
