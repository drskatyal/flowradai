import { useEffect, useState } from "react";
import { useDbUser, useEditUser } from "@/hooks";
import { useStore } from "@/stores";
import { useQueryClient } from "@tanstack/react-query";

export const useSpecialityUpdate = (
  userId: string,
  setIsOpen: (isOpen: boolean) => void
) => {
  const [specialityId, setSpecialityId] = useState<string>("");
  const { refetch } = useDbUser(userId);
  const queryClient = useQueryClient();

  const { editUser, isLoading: isSkipLoading } = useEditUser(userId, () => {
    setIsOpen(false);
    refetch();
    // Invalidate templates cache to trigger smart refetch
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  });

  const handleSpecialityChange = (value: string) => {
    if (value && value.length) {
      setSpecialityId(value);
    }
  };

  const updateSpeciality = () => {
    editUser({ specialityId });
  };

  return {
    specialityId,
    isSkipLoading,
    setSpecialityId,
    updateSpeciality,
    handleSpecialityChange,
  };
};
