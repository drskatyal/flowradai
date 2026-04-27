import { useSaveCustomProfile as useSaveCustomProfileHook } from "@/hooks/use-custom-profile-handler";

export const useSaveCustomProfile = () => {
  const { saveCustomProfile, isSaving, isSuccess, isError } =
    useSaveCustomProfileHook();

  return {
    saveCustomProfile,
    isSaving,
    isSuccess,
    isError,
  };
};
