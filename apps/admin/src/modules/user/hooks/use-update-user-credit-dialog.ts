import { useEffect, useState } from "react";
import { useUpdateUser } from "@/hooks";
import { toast } from "@/hooks/use-toast";
import { User } from "@/interfaces";

export const useUpdateUserCreditDialog = (
  updatableUser: User | null,
  onClose: (isUpdated?: boolean) => void
) => {
  const [user, setUser] = useState<User | null>(null);
  const [updatableUserCredit, setUpdatableUserCredit] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    setUser(updatableUser);
    setUpdatableUserCredit(0);
  }, [updatableUser]);

  const handleClose = (isUpdated?: boolean) => {
    setUser(null);
    onClose(isUpdated);
  };

  const handleUpdateCredit = () => {
    if (!user) return;
    setIsUpdating(true);
    const updatedAvailableCredits = user.availableCredits + updatableUserCredit;
    const updatedTotalCredits = user.totalCredits + updatableUserCredit;
    updateUserMutation.mutate(
      {
        ...user,
        availableCredits: updatedAvailableCredits,
        totalCredits: updatedTotalCredits,
      },
      {
        onSuccess: () => {
          handleClose(true);
          setIsUpdating(false);
          toast({
            title: "User credit updated successfully",
          });
        },
        onError: () => {
          setIsUpdating(false);
          toast({
            title: "Error",
            description: "Failed to update user credit",
            variant: "destructive",
          });
        },
      }
    );
  };

  return {
    user,
    setUpdatableUserCredit,
    handleClose,
    handleUpdateCredit,
    updatableUserCredit,
    isUpdating,
  };
};
