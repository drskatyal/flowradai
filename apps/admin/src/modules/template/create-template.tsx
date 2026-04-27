"use client";

import { Loader2, Plus } from "lucide-react";
import { Dialog } from "@/components/customs/dialog";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Category from "./category/category";
import { useCreateTemp } from "./hooks/use-create-template";

export const CreateTemplate = ({ onSuccess }: { onSuccess?: () => void }) => {
  const {
    handleChange,
    handleSubmit,
    isOpen,
    setIsOpen,
    category,
    setCategory,
    formData,
    setFormData,
    createMutation,
  } = useCreateTemp({ onSuccess });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      }
      classNames={{ content: "max-w-[90vw] md:max-w-[60vw]" }}
      headerTitle={"Create New Template"}
      headerDescription={"Create a new template for your chat conversations"}
      contentProps={{
        onInteractOutside: (e) => e.preventDefault(),
      }}
    >
      <form onSubmit={handleSubmit} className="">
        <div className="max-h-[50vh] lg:max-h-[60vh] h-screen flex flex-col w-full">
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
          <div className="flex-1 overflow-hidden">
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
          <div className="my-4">
            <Category
              value={category}
              onChange={(value) => setCategory(value)}
            />
          </div>
          <div className="flex item-center justify-end flex-wrap w-full gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Create Template
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateTemplate;
