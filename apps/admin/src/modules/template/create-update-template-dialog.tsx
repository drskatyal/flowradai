import { useEffect, useState } from "react";
import { Dialog, DialogProps } from "@/components/customs/dialog";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateTemplateData, Template } from "@/hooks";
import Category from "./category/category";
import Speciality from "./speciality/speciality";
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
  const [formData, setFormData] = useState<CreateTemplateData>({
    title: "",
    description: "",
    type: "private",
    category: "",
    specialityId: "",
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
    onSubmit?.({ event, formData, template });
  };

  useEffect(() => {
    if (template) {
      setFormData({
        title: template?.title,
        description: template?.description,
        type: "private",
        category: template?.category,
        specialityId: template?.specialityId,
        prompt: template?.prompt,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "private",
        category: "",
        specialityId: "",
        prompt: ""
      });
    }
  }, [template]);

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
      <form onSubmit={handleSubmit}>
        <div className="max-h-[70vh] lg:max-h-[60vh] max-w-[80vw] md:max-w-[60vw] h-screen flex flex-col w-full overflow-y-scroll px-1">
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
              value={formData?.category}
              onChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            />
            <Speciality
              value={formData.specialityId}
              onChange={(value) =>
                setFormData({ ...formData, specialityId: value })
              }
            />
          </div>
          <div className="space-y-2 mb-3">
            <label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </label>
            <Textarea
              id="speciality-prompt"
              name="prompt"
              value={formData?.prompt}
              onChange={handleChange}
              placeholder="Please enter prompt.."
              className="resize-none min-h-[200px]"
            />
          </div>
        </div>
        <div className="flex item-center justify-end flex-wrap w-full gap-2 px-2">
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
