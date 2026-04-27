import { useEffect, useState, ReactElement, Dispatch, SetStateAction } from "react";
import { Dialog, DialogProps } from "@/components/customs/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateSpecialityData, Speciality } from "@/hooks";
import { useCreateSpeciality } from "./hooks/use-create-speciality";
import { Textarea } from "@/components/ui/textarea";
import StepWizard from "react-step-wizard";
import { Info, Save } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { SwitchToggle } from "@/components/ui/toggle";

export interface CreateUpdateFormSubmitArgs {
  formData: CreateSpecialityData;
  speciality?: Speciality | null;
  event: React.FormEvent;
}

interface CreateUpdateTemplateProps extends DialogProps {
  onSuccess?: () => void;
  speciality?: Speciality | null;
  isPending?: boolean;
  onCancel?: () => void;
  onSubmit?: (args: CreateUpdateFormSubmitArgs) => void;
}

interface BasicInfoStepProps {
  formData: CreateSpecialityData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setIsButton: Dispatch<SetStateAction<boolean>>,
  isButton: boolean;
  isElaborateButton: boolean;
  setIsElaborateButton: Dispatch<SetStateAction<boolean>>;
  currentStep: number;
  totalSteps: number;
  error?: string;
}

interface PromptStepProps {
  prompt: { name: string; label: string; placeholder?: string };
  formData: CreateSpecialityData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  currentStep: number;
  totalSteps: number;
}

const formDetails = {
  create: {
    title: "Create New Speciality",
    description: "Create a new speciality for your chat conversations",
    actionTitle: "Create Speciality",
  },
  update: {
    title: "Edit Speciality",
    description: "Make changes to your speciality below.",
    actionTitle: "Save Changes",
  },
};

const StepProgress: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
      <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

// Basic Info Step Component
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  handleChange,
  setIsButton,
  isButton,
  isElaborateButton,
  setIsElaborateButton,
  currentStep,
  totalSteps,
  error
}) => (
  <div className="flex flex-col h-full">
    <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="speciality" className="text-sm font-medium">
          Speciality Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="speciality"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter speciality name..."
          className={`w-full ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Speciality Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter speciality description..."
          className="min-h-[285px] resize-none w-full"
        />
      </div>
      <div className=" flex w-full items-center gap-3">
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="specialityButtonLabel" className="text-sm font-medium">
              Speciality Button Label
            </label>
            <SwitchToggle
              size="sm"
              id="isButton"
              name="isButton"
              pressed={isButton}
              onPressedChange={(value) => {
                setIsButton(value)
              }}
            />
            <Tooltip
              trigger={
                <Info size={12} className="cursor-pointer" />
              }
            >
              By default structure reporting button visible
            </Tooltip>
          </div>
          <Input
            id="specialityButtonLabel"
            name="specialityButtonLabel"
            value={formData.specialityButtonLabel}
            onChange={handleChange}
            placeholder="Enter button label..."
            className="w-full"
          />
        </div>
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="specialityButtonLabel" className="text-sm font-medium">
              Elaborate Button Label
            </label>
            <SwitchToggle
              size="sm"
              id="isElaborateButton"
              name="isElaborateButton"
              pressed={isElaborateButton}
              onPressedChange={(value) => {
                setIsElaborateButton(value)
              }}
            />
            <Tooltip
              trigger={
                <Info size={12} className="cursor-pointer" />
              }
            >
              By default Elaborate button visible
            </Tooltip>
          </div>
          <Input
            id="elaborateButtonLabel"
            name="elaborateButtonLabel"
            value={formData.elaborateButtonLabel}
            onChange={handleChange}
            placeholder="Enter button label..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
);

// Prompt Step Component
const PromptStep: React.FC<PromptStepProps> = ({
  prompt,
  formData,
  handleChange,
  currentStep,
  totalSteps
}) => (
  <div className="flex flex-col h-full 2xl:gap-5">
    <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
    <div className="space-y-2 flex-1">
      <label htmlFor={prompt.name} className="text-sm font-medium">
        {prompt.label}
      </label>
      <Textarea
        id={prompt.name}
        name={prompt.name}
        placeholder={prompt.placeholder || `Enter ${prompt.label.toLowerCase()}...`}
        value={formData[prompt.name as keyof typeof formData] as string}
        onChange={handleChange}
        className="h-[calc(100%-5rem)] min-h-[468px]  resize-none w-full"
      />
    </div>
  </div>
);

const CreateUpdateSpecialityDialog: React.FC<CreateUpdateTemplateProps> = ({
  onSuccess,
  speciality,
  onCancel,
  isPending,
  onSubmit,
  ...props
}) => {
  const { promptsKeys } = useCreateSpeciality({ onSuccess });
  const [instance, setInstance] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string>();
  const totalSteps = promptsKeys.length + 1; // Basic info + prompt steps
  const [isButton, setIsButton] = useState(true);
  const [isElaborateButton, setIsElaborateButton] = useState(true);

  const initialFormData: CreateSpecialityData = {
    name: "",
    description: "",
    specialityButtonLabel: "",
    isButton: true,
    elaborateButtonLabel: "",
    isElaborateButton: true,
    active: false,
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
  };

  const [formData, setFormData] = useState<CreateSpecialityData>(initialFormData);

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      setError('Speciality name is required');
      return;
    }
    setError('');
    instance?.nextStep();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'name' && error) {
      setError('');
    }
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, isButton: isButton }))
  }, [isButton]);

  const formDetail = speciality?._id ? formDetails?.update : formDetails?.create;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({ event, formData, speciality });
    // Clear form data after submission
    setFormData(initialFormData);
    // Reset to first step
    instance?.goToStep(1);
    setCurrentStep(1);
  };

  const handleCancel = () => {
    // Reset form data and step on cancel
    setFormData(initialFormData);
    setCurrentStep(1);
    setError('');
    if (instance) {
      instance.goToStep(1);
    }
    onCancel?.();
  };

  const handleStepChange = (stats: { activeStep: number }) => {
    setCurrentStep(stats.activeStep);
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (props.open) {
      setCurrentStep(1);
      setError('');
      if (instance) {
        instance.goToStep(1);
      }
    }
  }, [props.open, instance]);

  useEffect(() => {
    if (speciality) {
      setFormData({
        name: speciality?.name,
        description: speciality?.description,
        specialityButtonLabel: speciality?.specialityButtonLabel,
        isButton: speciality?.isButton,
        elaborateButtonLabel: speciality?.elaborateButtonLabel,
        isElaborateButton: speciality?.isElaborateButton,
        active: speciality?.active,
        elaborateInstruction: speciality?.prompt?.elaborateInstruction,
        structuredReportingApproachInstruction:
          speciality?.prompt?.structuredReportingApproachInstruction,
        regularInstruction: speciality?.prompt?.regularInstruction,
        defaultGrokInstructions: speciality?.prompt?.defaultGrokInstructions,
        defaultOpenaiInstructions: speciality?.prompt?.defaultOpenaiInstructions,
        defaultGeminiInstructions: speciality?.prompt?.defaultGeminiInstructions,
        reportModificationInstructions: speciality?.prompt?.reportModificationInstructions,
        templateRegularInstruction: speciality?.prompt?.templateRegularInstruction,
        textCorrectionInstruction: speciality?.prompt?.textCorrectionInstruction,
        refinementInstruction: speciality?.prompt?.refinementInstruction,
        disabledRefinementInstructions:
          speciality?.prompt?.disabledRefinementInstructions,
        actionModeRefinementInstruction:
          speciality?.prompt?.actionModeRefinementInstruction,
        wishperInstruction: speciality?.prompt?.wishperInstruction,
        reportErrorValidationInstruction: speciality?.prompt?.reportErrorValidationInstruction,
        reportGuidelineInstruction: speciality?.prompt?.reportGuidelineInstruction
      });
    } else {
      setFormData(initialFormData);
    }
  }, [speciality]);

  const renderSteps = (): ReactElement[] => {
    const steps: ReactElement[] = [
      <BasicInfoStep
        key="basic-info"
        formData={formData}
        handleChange={handleChange}
        setIsButton={setIsButton}
        isButton={isButton}
        isElaborateButton={isElaborateButton}
        setIsElaborateButton={setIsElaborateButton}
        currentStep={currentStep}
        totalSteps={totalSteps}
        error={error}
      />,
    ];

    promptsKeys.forEach((prompt, index) => {
      steps.push(
        <PromptStep
          key={prompt.name}
          prompt={prompt}
          formData={formData}
          handleChange={handleChange}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );
    });

    return steps;
  };

  return (
    <Dialog
      classNames={{
        content: "max-w-[80vw] max-h-[85vh] max-sm:p-3",
      }}
      headerTitle={formDetail?.title}
      headerDescription={formDetail?.description}
      contentProps={{
        onInteractOutside: (e) => e.preventDefault(),
      }}
      {...props}
    >
      <div className="flex flex-col h-[calc(85vh-7rem)]">
        <div className="flex-1 p-2 md:p-4 overflow-auto">
          <StepWizard
            instance={setInstance}
            onStepChange={handleStepChange}
            className="h-full"
            transitions={{}}
            isHashEnabled={false}
          >
            {renderSteps()}
          </StepWizard>
        </div>

        <div className="flex items-center justify-between w-full gap-2 py-3 px-4 mt-auto">
          <div className="flex gap-2">
            <Tooltip
              trigger={
                <Button variant="outline" disabled={isPending}
                  isLoading={isPending} onClick={handleSubmit}>
                  <Save className="w-4 h-4" />
                  <span className="hidden md:block">Save as Draft</span>
                </Button>
              }
            >
              Save as Draft
            </Tooltip>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={() => instance?.previousStep()}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                isLoading={isPending}
              >
                {formDetail?.actionTitle}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateUpdateSpecialityDialog;
