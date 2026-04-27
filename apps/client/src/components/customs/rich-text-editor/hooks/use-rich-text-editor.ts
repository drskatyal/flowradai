import { useCallback, useEffect, useRef, useState } from "react";
import { copyText, copyTextPlainOnly } from "@/helper/copy-text";
import { toast } from "@/hooks";
import Link from "@tiptap/extension-link";
import { useEditor, UseEditorOptions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  editorJSONToMarkdown,
  markdownToEditorJSON,
} from "../convertRichTextDocToMarkdown";
import { RichTextEditorChangeHandlerArgs } from "../rich-text-editor";
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Placeholder } from '@tiptap/extensions'

export const extensions = [
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
  Table.configure({
    resizable: true,
  }),
  TableCell,
  TableHeader,
  TableRow,
  Placeholder.configure({
    // Use a placeholder:
    placeholder: `To generate a report, you can upload a template and select it, or paste one here. Then enter the study name and findings in the smaller input box and click Use Template. Alternatively, you can skip templates entirely and click Smart Generation for an automatic report.

You can also download the final report as a document, or use the Copy/Email button above the report to copy it or send it directly via email, and then paste it into your PACS.`,
  }),
];

export interface Props {
  value: string;
  onChange?: (args: RichTextEditorChangeHandlerArgs) => void;
  editorOptions?: UseEditorOptions;
  disabled?: boolean;
}

const COPY_MODE_SESSION_KEY = "COPY_MODE_SESSION_KEY";

export const useRichTextEditor = ({
  value,
  onChange,
  editorOptions,
  disabled
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUpdatingFromProps = useRef(false);
  const lastValueRef = useRef<string>(value);

  // ⬇️ Read initial value from session storage
  const [copyMode, setCopyModeState] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(COPY_MODE_SESSION_KEY) || "formatted";
    }
    return "formatted";
  });

  const setCopyMode = (mode: string) => {
    setCopyModeState(mode);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(COPY_MODE_SESSION_KEY, mode);
    }
  };

  const convertedValue = markdownToEditorJSON(value, extensions);
  const editor = useEditor({
    extensions,
    content: convertedValue,
    // previouse we use onTranscription
    onUpdate: ({ editor }) => {
      // Prevent infinite loops when updating from props
      if (isUpdatingFromProps.current) {
        return;
      }

      const doc = editor.getJSON();
      const markdownText = editorJSONToMarkdown(doc, extensions);
      lastValueRef.current = markdownText;
      setIsCopied(false);
      onChange?.({ markdownText, editor });
    },
    ...editorOptions,
  });

  // Update content when value prop changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Only update if the value actually changed
    if (value !== lastValueRef.current) {
      isUpdatingFromProps.current = true;

      try {
        const newContent = markdownToEditorJSON(value, extensions);

        // Use transaction to update content without triggering onUpdate
        editor.commands.setContent(newContent, false, {
          preserveWhitespace: 'full'
        });

        lastValueRef.current = value;
      } catch (error) {
        console.error('Error updating editor content:', error);
      } finally {
        // Reset the flag after a brief delay to ensure the update is complete
        setTimeout(() => {
          isUpdatingFromProps.current = false;
        }, 0);
      }
    }
  }, [value, editor]);

  const handleCopyEditedText = (el: HTMLDivElement | null, isPlaintext: boolean) => {
    if (el) {
      // Use your copyText utility if it accepts strings
      if (isPlaintext) {
        copyTextPlainOnly(el, () => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        });
        toast({
          title: "Copied to clipboard",
        });
      } else {
        copyText(el, () => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        });
        toast({
          title: "Copied to clipboard",
        });
      }
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

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  return { editor, addLink, isCopied, handleCopyEditedText, copyMode, setCopyMode };
};
