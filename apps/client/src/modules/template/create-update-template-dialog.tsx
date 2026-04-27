import { useEffect, useState } from "react";
import { Dialog, DialogProps } from "@/components/customs/dialog";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateTemplateData, Template } from "@/hooks";
import Category from "./category/category";
import Speciality from "./speciality/speciality";
import { useStore } from "@/stores";
import { Textarea } from "@/components/ui/textarea";

export interface CreateUpdateFormSubmitArgs {
  formData: CreateTemplateData;
  template?: Template | null;
  event: React.FormEvent;
}

interface CreateUpdateTemplateProps extends DialogProps {
  onSuccess?: () => void;
  template?: Template | null;
  isPending?: boolean;
  onCancel?: () => void;
  onSubmit?: (args: CreateUpdateFormSubmitArgs) => void;
}

const formDetails = {
  create: {
    title: "Create New Template",
    description: "Create a new template for your chat conversations",
    actionTitle: "Create Template",
  },
  update: {
    title: "Edit Template",
    description: "Make changes to your template below.",
    actionTitle: "Save Changes",
  },
};

const CreateUpdateTemplateDialog: React.FC<CreateUpdateTemplateProps> = ({
  onSuccess,
  template,
  onCancel,
  isPending,
  onSubmit,
  ...props
}) => {
  const user = useStore((state) => state.user);
  const [formData, setFormData] = useState<CreateTemplateData>({
    title: "",
    description: "",
    type: "public",
    category: "",
    specialityId: template?.specialityId || "",
    prompt: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formDetail = template?._id ? formDetails?.update : formDetails?.create;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    const finalFormData = {
      ...formData,
    };

    onSubmit?.({ event, formData: finalFormData, template });
  };

  useEffect(() => {
    if (template) {
      setFormData({
        title: template?.title,
        description: template?.description,
        type: "public",
        category: template?.category,
        specialityId: template?.specialityId || "",
        prompt: template?.prompt
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "public",
        category: "",
        specialityId: user?.specialityId || "",
        prompt: ""
      });
    }
  }, [template, user?.specialityId]); // Added user?.specialityId to dependency array

  return (
    <Dialog
      classNames={{ content: "max-w-[90vw] md:max-w-[60vw]" }}
      headerTitle={formDetail?.title}
      headerDescription={formDetail?.description}
      contentProps={{
        onInteractOutside: (e) => e.preventDefault(),
      }}
      {...props}
    >
      <form onSubmit={handleSubmit} className="">
        <div className="max-h-[70vh] lg:max-h-[60vh] max-w-[80vw] md:max-w-[60vw] h-screen flex flex-col w-full overflow-y-scroll">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mt-4 mb-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
          </div>
          <div className="flex-1 overflow-hidden min-h-[50%]">
            <RichTextEditor
              value={formData.description}
              onChange={({ markdownText }) =>
                setFormData((prev) => ({
                  ...prev,
                  description: markdownText,
                }))
              }
            />
          </div>
          <div className="my-4 flex w-full gap-2">
            <Category
              value={formData?.category || ''}
              onChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            />
            <Speciality
              value={formData.specialityId}
              onChange={(value) =>
                setFormData({ ...formData, specialityId: value })
              }
              isReadOnly={false}
            />
          </div>
          <div className="space-y-2 mb-3">
            <label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </label>
            <Textarea
              name="prompt"
              id="speciality-prompt"
              placeholder="Please enter prompt.."
              value={formData?.prompt}
              onChange={handleChange}
              className="resize-none min-h-[200px]"
            />
          </div>
        </div>
        <div className="flex item-center justify-end flex-wrap w-full gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} isLoading={isPending}>
            {formDetail?.actionTitle}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateUpdateTemplateDialog;