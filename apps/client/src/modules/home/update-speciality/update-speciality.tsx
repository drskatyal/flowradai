"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/customs/dialog";
import Speciality from "./speciality";
import { useSpecialityUpdate } from "./hooks/use-speciality-update";
import { useStore } from "@/stores/use-store";
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UpdateSpecilaity = ({
  isOpen,
  setIsOpen,
  isNotSpeciality = false
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isNotSpeciality?: boolean
}) => {
  const authUser = useStore((state) => state.user);
  const userId = authUser?._id as string;
  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    specialityId,
    setSpecialityId,
    handleSpecialityChange,
    updateSpeciality,
    isSkipLoading,
  } = useSpecialityUpdate(userId, (state) => {
    setIsOpen(state);
    if (!state) {
      window.location.reload();
    }
  });

  useEffect(() => {
    setSpecialityId(authUser?.specialityId || '');
  }, [authUser]);

  const handleSave = () => {
    if (specialityId) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmSave = () => {
    updateSpeciality();
    setIsConfirmOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  }

  return (
    <>
      <Dialog
        open={isOpen}
        headerTitle={isNotSpeciality ? 'Please select speciality' : 'Update Speciality'}
        headerDescription={isNotSpeciality ? 'Please select your medical speciality (e.g., Radiology, Neurology) to generate accurate reports tailored to your clinical field.' : ''}
        allowInteractionOutside={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button disabled={!specialityId.length} isLoading={isSkipLoading} onClick={handleSave}>
              Save
            </Button>
          </div>
        }
        onOpenChange={handleCancel}
        classNames={{
          content: "max-w-[90vw] md:max-w-[40vw] max-md:p-3 max-h-[90vh] rounded-lg",
          headerTitle: "max-sm:text-sm",
        }}
      >
        <div className="space-y-4">
          <Speciality value={specialityId} onChange={handleSpecialityChange} />
        </div>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update your specialty? The page will reload to get the latest data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateSpecilaity;
