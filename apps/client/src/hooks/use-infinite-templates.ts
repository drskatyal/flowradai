import { serverAxios } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useInfiniteTemplates = (
  user: any,
  searchQuery = "",
  specialtyIds: string[] = [],
  categories: string[] = [],
  types: string[] = [],
  showMarketplace: boolean = false
) => {
  const query = useInfiniteQuery({
    queryKey: [
      "templates-infinite",
      user?.specialityId,
      searchQuery,
      specialtyIds,
      categories,
      types,
      showMarketplace,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const specialtyParam =
        specialtyIds.length > 0
          ? `&specialtyIds=${specialtyIds.join(",")}`
          : "";
      const categoryParam =
        categories.length > 0 ? `&categories=${categories.join(",")}` : "";
      const typeParam = types.length > 0 ? `&types=${types.join(",")}` : "";
      const response = await serverAxios.get(
        `/template?search=${searchQuery}&limit=10&skip=${pageParam}${specialtyParam}${categoryParam}${typeParam}&showMarketplace=${showMarketplace}&userSpecialityId=${user.specialityId}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.templates.length,
        0
      );
      return loadedCount < lastPage.count ? loadedCount : undefined;
    },
    initialPageParam: 0,
    enabled: !!user && !!user.specialityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Auto-fetch all pages progressively
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && query.data) {
      // Automatically fetch next page after a short delay
      const timer = setTimeout(() => {
        query.fetchNextPage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    query.hasNextPage,
    query.isFetchingNextPage,
    query.data,
    query.fetchNextPage,
  ]);

  return query;
};
