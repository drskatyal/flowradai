import { useEffect, useState, useRef } from "react";
import { markdownToEditorJSON } from "@/components/customs/rich-text-editor/convertRichTextDocToMarkdown";
import { extensions } from "@/components/customs/rich-text-editor/hooks/use-rich-text-editor";
import { Editor } from "@tiptap/react";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import { useThreadContext } from "@/providers/thread-provider";

export const useTranscription = ({ editor }: { editor: Editor }) => {
  const [autoRefine, setAutoRefine] = useState(true);
  const { liveTranscript, setLiveTranscript } = useThreadContext();
  
  // Track transcription to prevent duplication
  const lastProcessedTranscript = useRef<string>("");
  const transcriptionStartPos = useRef<number | null>(null);

  useEffect(() => {    
    if (liveTranscript.length > 0) {
      // Only process if transcript has actually changed
      if (liveTranscript !== lastProcessedTranscript.current) {
        handleLiveTranscription(liveTranscript);
        lastProcessedTranscript.current = liveTranscript;
      }
    } else if (lastProcessedTranscript.current) {
      // Reset when transcription ends
      lastProcessedTranscript.current = "";
      transcriptionStartPos.current = null;
    }
  }, [liveTranscript]);

  const handleLiveTranscription = (text: string) => {
    if (!editor) return;

    // Store start position on first transcription
    if (transcriptionStartPos.current === null) {
      transcriptionStartPos.current = editor.state.selection.from;
      
      // Insert the initial transcription content
      const editorJSON = markdownToEditorJSON(text, extensions);
      let contentToInsert = editorJSON;
      
      if (
        editorJSON.type === "doc" &&
        editorJSON.content?.length === 1 &&
        editorJSON.content[0].type === "paragraph"
      ) {
        contentToInsert = editorJSON.content[0].content || [];
      }

      editor.chain().focus().insertContent(contentToInsert).run();
    } else {
      // Calculate the end position of current transcription content
      const startPos = transcriptionStartPos.current;
      const lastTranscriptLength = lastProcessedTranscript.current.length;
      const endPos = startPos + lastTranscriptLength;
      
      const editorJSON = markdownToEditorJSON(text, extensions);
      let contentToInsert = editorJSON;
      
      if (
        editorJSON.type === "doc" &&
        editorJSON.content?.length === 1 &&
        editorJSON.content[0].type === "paragraph"
      ) {
        contentToInsert = editorJSON.content[0].content || [];
      }

      // Only replace the transcription content, not other existing content
      editor
        .chain()
        .focus()
        .setTextSelection({ from: startPos, to: endPos })
        .insertContent(contentToInsert)
        .run();
    }
  };

  const handleTranscriptionComplete = ({ text }: onTranscrptionArg) => {
    const editorJSON = markdownToEditorJSON(text, extensions);

    let contentToInsert = editorJSON;
    if (
      editorJSON.type === "doc" &&
      editorJSON.content?.length === 1 &&
      editorJSON.content[0].type === "paragraph"
    ) {
      contentToInsert = editorJSON.content[0].content || [];
    }

    editor.chain().focus().insertContent(contentToInsert).run();
  };

  const resetTranscription = () => {
    setLiveTranscript("");
    lastProcessedTranscript.current = "";
    transcriptionStartPos.current = null;
  };

  return {
    autoRefine,
    setAutoRefine,
    handleTranscriptionComplete,
    resetTranscription,
  };
};
