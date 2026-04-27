import { useState, useEffect } from "react";
import { useSpecialities } from "@/hooks";

export const useSpeciality = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [limit, setLimit] = useState(0);
  const [skip, setSkip] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<any>(null);

  const { data, isLoading, refetch } = useSpecialities(
    debouncedSearchQuery,
    limit,
    skip
  );

  const specialities = data?.specialities || [];
  const totalCount = data?.count || 0;

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSkip(0); // Reset pagination when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return {
    skip,
    limit,
    category,
    specialities,
    isLoading,
    description,
    searchQuery,
    debouncedSearchQuery,
  };
};
