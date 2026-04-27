"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/customs/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSaveCustomProfile } from "./hooks/use-save-custom-profile";
import { useCustomProfile } from "./hooks/use-custom-profile";
import { useUser } from "@clerk/nextjs";

const CustomProfile = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
  const { user } = useUser();
  const { saveCustomProfile, isSaving } = useSaveCustomProfile();
  const { customProfile, refetchProfile } = useCustomProfile(user?.id || "");
  const [instructions, setInstructions] = useState<string>(customProfile?.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInstructions(customProfile?.content || "");

    // Delay to ensure value is set before focusing
    setTimeout(() => {
      if (textareaRef.current) {
        const el = textareaRef.current;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length); // Move cursor to end
      }
    }, 10);
  }, [customProfile]);

  const handleSave = () => {
    saveCustomProfile(instructions);
    setIsOpen(false);
    refetchProfile();
  };

  return (
    <Dialog
      open={isOpen}
      headerTitle="Custom Profile"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>Save</Button>
        </div>
      }
      onOpenChange={() => setIsOpen(false)}
      classNames={{ content: "max-w-[90vw] md:max-w-[40vw] max-md:p-3 max-h-[90vh] rounded-lg", headerTitle: "max-sm:text-sm" }}
    >
      <div className="space-y-4">
        <Textarea
          ref={textareaRef}
          id="instructions"
          placeholder="Enter your instructions..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[250px] max-h-[500px] lg:min-h-36 overflow-y-auto
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-thumb]:bg-gray-400
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-200"
        />
      </div>
    </Dialog>
  );
};

export default CustomProfile;
