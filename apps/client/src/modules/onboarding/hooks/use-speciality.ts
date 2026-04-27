import { useSpecialityList } from "@/hooks/use-speciality";

export const useSpeciality = () => {
  const { data: specialityListData, isLoading, refetch: refetchSpecialityList } = useSpecialityList();
  const specialityList = specialityListData?.specialities || [];

  const specialities = specialityList || [];

  return {
    specialities,
    isLoading,
  };
};
