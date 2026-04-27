"use client";

import './rich-text-editor.css';
import { Check, Copy } from 'lucide-react';
import React, { useRef } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { Editor, EditorContent, UseEditorOptions } from '@tiptap/react';
import { useRichTextEditor } from './hooks';
import Toolbar, { ToolbarStyles } from './Toolbar';

export interface RichTextEditorStyles extends ToolbarStyles {
  editorContainer?: string;
  editor?: string;
  copyButtonContainer?: string;
  copyButton?: string;
}

export interface RichTextEditorChangeHandlerArgs {
  markdownText: string;
  editor: Editor;
}

interface RichTextEditorProps {
  classNames?: RichTextEditorStyles;
  value?: string;
  onChange?: (args: RichTextEditorChangeHandlerArgs) => void;
  allowCopy?: boolean;
  editorOptions?: UseEditorOptions;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onSelect?: React.ReactEventHandler<HTMLDivElement>;
  id?: string;
  name?: string;
  requireToolbar?: boolean;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      onChange,
      value = "",
      allowCopy,
      editorOptions,
      id,
      onBlur,
      onFocus,
      onSelect,
      classNames,
      requireToolbar = true,
    },
    ref
  ) => {
    const richTextEditorRef = useRef<HTMLDivElement>(null);

    const { editor, handleCopyEditedText, isCopied, addLink } =
      useRichTextEditor({ value, onChange, editorOptions });

    if (!editor) return null;

    return (
      <div
        className={cn(
          "flex flex-col flex-1 h-full border rounded-md relative",
          classNames?.editorContainer
        )}
      >
        {allowCopy && (
          <div
            className={cn(
              "p-1 absolute top-0 right-0  bg-background z-20 border-l",
              classNames?.toolbarToolsContainer,
              classNames?.copyButtonContainer
            )}
          >
            <Toggle
              variant={"default"}
              onPressedChange={() =>
                handleCopyEditedText(richTextEditorRef?.current)
              }
              pressed={isCopied}
              className={cn(
                "h-8 min-w-8",
                classNames?.toolbarToggleButton,
                classNames?.copyButton
              )}
            >
              {isCopied ? <Check /> : <Copy />}
            </Toggle>
          </div>
        )}
        {requireToolbar && (
          <Toolbar editor={editor} addLink={addLink} classNames={classNames} />
        )}
        <EditorContent
          id="markDownRichText"
          ref={allowCopy ? richTextEditorRef : ref}
          editor={editor}
          className={cn(
            "prose max-w-none flex-1 overflow-y-auto p-4",
            classNames?.editor
          )}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
