"use client";

import { Dialog } from "@/components/customs/dialog";
import CustomModal from "@/components/ui/customs/custom-modal";
import { useDesktopView } from "@/hooks";
import { Template } from "@/hooks/use-template-handler";
import TemplateForm from "./template-form";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSave: (template: Template) => void;
}

const TemplateDialog = ({
  isOpen,
  onClose,
  templates,
  onSave,
}: TemplateDialogProps) => {
  const { isDesktopView } = useDesktopView();
  return isDesktopView ? (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Template"
      width=""
      className="w-[376px] lg:w-[500px] xl:w-[760px] 2xl:w-[896px] max-md:translate-y-[-75%] md:translate-y-[-71%] lg:translate-y-[-48%] lg:translate-x-[-65%]"
    >
      <TemplateForm
        templates={templates}
        onClose={onClose}
        onSave={onSave}
      />
    </CustomModal>
  ) : (
    <Dialog
      onOpenChange={onClose}
      open={isOpen}
      classNames={{ content: "" }}

      headerTitle="Select Template"
    >
      <TemplateForm 
        templates={templates}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
};

export default TemplateDialog;
