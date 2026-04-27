import { AlertDialog, Dialog, Input } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "@/interfaces";
import { useUpdateUserCreditDialog } from "./hooks/use-update-user-credit-dialog";

interface UpdateUserCreditDialogProps {
  user: User | null;
  onClose: (isUpdated?: boolean) => void;
}

const UpdateUserCreditDialog = ({
  user: updatableUser,
  onClose,
}: UpdateUserCreditDialogProps) => {
  const {
    user,
    setUpdatableUserCredit,
    updatableUserCredit,
    handleClose,
    handleUpdateCredit,
    isUpdating,
  } = useUpdateUserCreditDialog(updatableUser, onClose);

  return (
    <Dialog
      headerTitle="Update User Credit"
      open={user !== null}
      onOpenChange={(open) => !open && handleClose()}
      classNames={{
        content: "w-[500px]",
      }}
      footer={
        <AlertDialog
          trigger={
            <Button
              isLoading={isUpdating}
              disabled={!updatableUserCredit || updatableUserCredit <= 0}
            >
              Update
            </Button>
          }
          dialogTitle="Confirm Changes"
          onConfirm={handleUpdateCredit}
        >
          Are you sure you want to update this user&apos;s credit? This action
          cannot be undone.
        </AlertDialog>
      }
    >
      <>
        <span className="text-sm">
          Current Available Credit: {user?.availableCredits}
        </span>
        <Label>Enter credits to add:</Label>
        <Input
          type="number"
          min={0}
          defaultValue={updatableUserCredit}
          onChange={(e) => setUpdatableUserCredit(Number(e.target.value))}
          placeholder="Enter additional credits to add"
        />
        {!!updatableUserCredit && updatableUserCredit <= 0 && (
          <span className="text-xs text-red-500">
            Credit cannot be negative
          </span>
        )}
        <span className="text-sm">
          Total Available Credit:{" "}
          {updatableUserCredit + (user?.availableCredits ?? 0)}
        </span>
      </>
    </Dialog>
  );
};

export default UpdateUserCreditDialog;
