"use client";

import React, { FC, useState } from "react";
import { Dialog } from "@/components/customs/dialog";
import CustomModal from "@/components/ui/customs/custom-modal";
import { useDesktopView } from "@/hooks";
import CompareFrom from "./compare-form";

export interface CompareData {
  date: string;
  description: string;
}

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: CompareData) => void;
  draggable?: boolean;
}

const CompareModal: FC<CompareModalProps> = ({
  isOpen,
  onClose,
  onSave,
  draggable = false,
}) => {
  const currentDate = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [description, setDescription] = useState<string>("");

  const handleClose = () => {
    setDescription("");
    setSelectedDate(currentDate);
    onClose();
  };

  const handleOk = () => {
    if (description.trim() && onSave) {
      onSave({
        date: selectedDate,
        description: description.trim(),
      });
      handleClose();
    }
  };
  const { isDesktopView } = useDesktopView();
  return isDesktopView ? (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Follow-Up"
      draggable={draggable}
      width="" // Use percentage for responsiveness
      className="w-[376px] lg:w-[500px] xl:w-[760px] 2xl:w-[896px] max-sm:translate-y-[-75%] md:translate-y-[-71%] lg:translate-y-[-48%] lg:translate-x-[-54%]"
    >
      <CompareFrom onClose={onClose}
        onSave={handleOk}
        setDescription={setDescription}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        description={description}/>
    </CustomModal>
  ) : (
    <Dialog
      onOpenChange={onClose}
      open={isOpen}
      draggable={draggable}
      classNames={{ content: "" }}
    >
       <CompareFrom onClose={onClose}
        onSave={handleOk}
        setDescription={setDescription}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        description={description}/>
    </Dialog>
  );
};

export default CompareModal;
