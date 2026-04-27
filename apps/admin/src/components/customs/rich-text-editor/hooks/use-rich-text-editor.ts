import { useCallback, useState } from "react";
import { copyText } from "@/helpers";
import { toast } from "@/hooks";
import Link from "@tiptap/extension-link";
import { useEditor, UseEditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  editorJSONToMarkdown,
  markdownToEditorJSON,
} from "../convertRichTextDocToMarkdown";
import { RichTextEditorChangeHandlerArgs } from "../rich-text-editor";

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    orderedList: {
      keepMarks: true,
    },
    bulletList: {
      keepMarks: true,
    },
  }),
  Link.configure({
    openOnClick: true,
  }),
];

export interface Props {
  value: string;
  onChange?: (args: RichTextEditorChangeHandlerArgs) => void;
  editorOptions?: UseEditorOptions;
}

export const useRichTextEditor = ({
  value,
  onChange,
  editorOptions,
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const convertedValue = markdownToEditorJSON(value, extensions);
  const editor = useEditor({
    extensions,
    content: convertedValue,
    onTransaction: ({ editor }) => {
      const doc = editor.getJSON();
      const markdownText = editorJSONToMarkdown(doc, extensions);
      setIsCopied(false);
      onChange?.({ markdownText, editor });
    },
    ...editorOptions,
  });

  const handleCopyEditedText = (el: HTMLDivElement | null) => {
    if (el) {
      copyText(el, () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
      toast({
        title: "Copied to clipboard",
      });
    } else {
      toast({
        title: "Failed to copy text. please try again",
        variant: "destructive",
      });
    }
  };

  const addLink = useCallback(() => {
    const url = window.prompt("Enter the URL");
    if (url) {
      // editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return { editor, addLink, isCopied, handleCopyEditedText };
};
