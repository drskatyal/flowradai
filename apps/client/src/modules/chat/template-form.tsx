import { Dialog, DialogProps } from "@/components/customs/dialog";
import { Template } from "@/hooks";
import { Button } from "@/components/ui/button";
import SelectTemplate from "./select-template";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useThreadContext } from "@/providers/thread-provider";
import { RichTextEditorChangeHandlerArgs } from "@/components/customs/rich-text-editor/rich-text-editor";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { EditorEvents } from "@tiptap/react";

interface TemplateFormProps {
  onClose: () => void;
  templates: Template[];
  onSave: (template: Template) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  onClose,
  templates,
  onSave,
}) => {
  const [editedTemplate, setEditedTemplate] = useState<Template | null>({
    _id: "",
    title: "",
    description: "",
  } as Template);
  const [descriptionCursorPosition, setDescriptionCursorPosition] = useState(0);
  const [transcriptText, setTranscriptText] = useState<string>();

  const { selectedTemplate, setSelectedTemplate } = useThreadContext();

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      setEditedTemplate({ ...template });
    } else {
      setEditedTemplate({
        _id: "",
        title: "",
        description: "",
      } as Template);
    }
  };

  const handleSave = () => {
    if (editedTemplate) {
      onSave(editedTemplate);
      setSelectedTemplate(selectedTemplate);
      onClose();
    }
  };

  const handleDescriptionChange = ({
    markdownText,
    editor,
  }: RichTextEditorChangeHandlerArgs) => {
    setEditedTemplate((prev) => prev && { ...prev, description: markdownText });
    setDescriptionCursorPosition(editor.state.selection.from);
  };

  const handleCursorPositionChange = ({
    editor,
  }: EditorEvents["selectionUpdate"]) => {
    const cursorPos = editor.state.selection.from - 1;
    setDescriptionCursorPosition(cursorPos >= 0 ? cursorPos : 0);
  };

  useEffect(() => {
    handleTemplateSelect(selectedTemplate);
  }, [selectedTemplate]);

  return (
    <form>
      <div className="max-h-[70vh] lg:max-h-[60vh] max-sm:max-w-[80vw] max-sm:m-auto h-screen flex flex-col w-full">
        <div className="space-y-2">
          {/* <SelectTemplate templates={templates} /> */}
        </div>
        <div className="space-y-2 pt-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={editedTemplate?.title || ""}
            onChange={(e) =>
              setEditedTemplate(
                (prev) => prev && { ...prev, title: e.target.value }
              )
            }
          />
        </div>
        <div className="pt-2 mb-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
        </div>
        <div className="flex-1 overflow-hidden">
          <RichTextEditor
            key={`${editedTemplate?.title}_${transcriptText?.length}`}
            value={editedTemplate?.description}
            onChange={handleDescriptionChange}
            editorOptions={{
              onSelectionUpdate: handleCursorPositionChange,
            }}
            allowCopy={true}
            allowMic={true}
          />
        </div>
        <div className="flex item-center justify-end flex-wrap w-full gap-2 mt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TemplateForm;
