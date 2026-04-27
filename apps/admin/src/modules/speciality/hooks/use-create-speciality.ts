import { useState } from "react";
import {
  CreateSpecialityData,
  useCreateSpeciality as createSpeciality,
} from "@/hooks";

export const useCreateSpeciality = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize formData with all prompt fields
  const [formData, setFormData] = useState<CreateSpecialityData>({
    name: "",
    description: "",
    specialityButtonLabel: "",
    elaborateButtonLabel: "",
    elaborateInstruction: "",
    structuredReportingApproachInstruction: "",
    regularInstruction: "",
    defaultGrokInstructions: "",
    defaultOpenaiInstructions: "",
    defaultGeminiInstructions: "",
    reportModificationInstructions: "",
    templateRegularInstruction: "",
    textCorrectionInstruction: "",
    refinementInstruction: "",
    disabledRefinementInstructions: "",
    actionModeRefinementInstruction: "",
    wishperInstruction: "",
    reportErrorValidationInstruction: "",
    reportGuidelineInstruction: ""
  });

  const promptsKeys = [
    {
      label: "Elaborate Instruction",
      name: "elaborateInstruction",
      placeholder: "Enter detailed elaborate instructions...",
    },
    {
      label: "Structured Reporting Approach Instruction",
      name: "structuredReportingApproachInstruction",
      placeholder: "Enter structured reporting approach instructions...",
    },
    {
      label: "Regular Instruction",
      name: "regularInstruction",
      placeholder: "Enter regular instructions...",
    },
    {
      label: "Default Grok Instructions",
      name: "defaultGrokInstructions",
      placeholder: "Enter default Grok instructions...",
    },
    {
      label: "Default OpenAI Instructions",
      name: "defaultOpenaiInstructions",
      placeholder: "Enter default OpenAI instructions...",
    },
    {
      label: "Default Gemini Instructions",
      name: "defaultGeminiInstructions",
      placeholder: "Enter default Gemini instructions...",
    },
    {
      label: 'Report Modification Instructions',
      name: 'reportModificationInstructions',
      placeholder: 'Enter report modification intrsuctions...',
    },
    {
      label: "Template Structured Reporting Approach Instruction",
      name: "templateStructuredReportingApproachInstruction",
      placeholder: "Enter template structured reporting approach instructions...",
    },
    {
      label: "Template Regular Instruction",
      name: "templateRegularInstruction",
      placeholder: "Enter template regular instructions...",
    },
    {
      label: "Text Correction Instruction",
      name: "textCorrectionInstruction",
      placeholder: "Enter text correction instructions...",
    },
    {
      label: "Refinement Instruction",
      name: "refinementInstruction",
      placeholder: "Enter refinement instructions...",
    },
    {
      label: "Disabled Refinement Instructions",
      name: "disabledRefinementInstructions",
      placeholder: "Enter disabled refinement instructions...",
    },
    {
      label: "Action Mode Refinement Instruction",
      name: "actionModeRefinementInstruction",
      placeholder: "Enter action mode refinement instructions...",
    },
    {
      label: "Whisper Instruction",
      name: "wishperInstruction",
      placeholder: "Enter whisper instructions...",
    },
    {
      label: "Report Validation Instruction",
      name: "reportErrorValidationInstruction",
      placeholder: "Enter report validation instructions...",
    },
    {
      label: "Report Insights Instruction",
      name: "reportGuidelineInstruction",
      placeholder: "Enter report insights instructions...",
    },
  ];

  const createMutation = createSpeciality();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const specialityData = {
      ...formData,
    };

    // Uncomment when ready to submit
    createMutation.mutate(specialityData, {
      onSuccess: () => {
        setIsOpen(false);
        // Reset form to initial state
        setFormData({
          name: "",
          description: "",
          specialityButtonLabel: "",
          elaborateButtonLabel: "",
          elaborateInstruction: "",
          structuredReportingApproachInstruction: "",
          regularInstruction: "",
          defaultGrokInstructions: "",
          defaultOpenaiInstructions: "",
          defaultGeminiInstructions: "",
          reportModificationInstructions: "",
          templateRegularInstruction: "",
          textCorrectionInstruction: "",
          refinementInstruction: "",
          disabledRefinementInstructions: "",
          actionModeRefinementInstruction: "",
          wishperInstruction: "",
          reportErrorValidationInstruction: "",
          reportGuidelineInstruction: ""
        });
        if (onSuccess) onSuccess();
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    handleChange,
    handleSubmit,
    isOpen,
    setIsOpen,
    formData,
    setFormData,
    createMutation,
    promptsKeys,
  };
};