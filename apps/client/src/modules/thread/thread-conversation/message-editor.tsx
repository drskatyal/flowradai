import { useRef } from "react";
import RichTextEditor from "@/components/customs/rich-text-editor/rich-text-editor";
import { useMessageEditor } from "./hooks";
import RichTextLoader from "@/components/customs/rich-text-editor/rich-text-loader";

const MessageEditor = () => {
  const richTextEditorRef = useRef<HTMLDivElement>(null);
  const { handleEditResponse, editedResponse, isRunning } = useMessageEditor();

  return (
    <div className="grid grid-rows-[1fr_auto] grid-cols-1 justify-between w-full lg:h-[calc(100vh-110px)] gap-y-4">
      <div className="flex-1 h-auto overflow-y-scroll w-full">
        <RichTextEditor
          ref={richTextEditorRef}
          value={editedResponse}
          onChange={handleEditResponse}
          allowCopy
          allowMic
          allowExport
          allowShare
          isLoading={isRunning}
          loader={<RichTextLoader />}
          disabled={false}
        />
      </div>
    </div>
  );
};

export default MessageEditor;
