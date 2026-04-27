"use client";

import "./rich-text-editor.css";
import { Check, Copy, DownloadIcon, Loader2 } from "lucide-react";
import React, { useImperativeHandle, useRef } from "react";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Separator } from "@/components/ui/separator";
import { useReportExport } from "@/hooks";
import { cn } from "@/lib/utils";
import { mergeRefs } from "@/utils";
import { Editor, EditorContent, UseEditorOptions } from "@tiptap/react";
import RichTextEditorTranscription from "../../../components/customs/transcript/rich-text-editor-transcription";
import { useRichTextEditor } from "./hooks";
import Toolbar, { ToolbarStyles } from "./Toolbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHotkeys } from 'react-hotkeys-hook';
import { useThreadContext } from "@/providers/thread-provider";

export interface RichTextEditorHandle {
  copyContent: () => void;
  downloadContent: () => void;
}

export interface RichTextEditorStyles extends ToolbarStyles {
  editorContainer?: string;
  editor?: string;
  copyButtonContainer?: string;
  copyButton?: string;
  loaderContainer?: string;
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
  allowMic?: boolean;
  allowExport?: boolean;
  isLoading?: boolean;
  loader?: React.ReactNode;
  disabled?: boolean;
  customControls?: React.ReactNode;
  imperativeRef?: React.Ref<RichTextEditorHandle>;
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
      allowMic = false,
      allowExport = false,
      isLoading = false,
      loader,
      disabled = false,
      customControls,
      imperativeRef,
    },
    ref
  ) => {
    const richTextEditorRef = useRef<HTMLDivElement>(null);

    const { editor, handleCopyEditedText, isCopied, addLink, copyMode, setCopyMode } =
      useRichTextEditor({ value, onChange, editorOptions, disabled });
    const { mutate: reportExportMutation } = useReportExport();
    const { setLiveTranscript } = useThreadContext();

    useImperativeHandle(imperativeRef, () => ({
      copyContent: () => handleCopyEditedText(richTextEditorRef.current, copyMode === "plain"),
      downloadContent: () => reportExportMutation(richTextEditorRef),
    }), [handleCopyEditedText, copyMode, reportExportMutation]);

    useHotkeys('c', () => handleCopyEditedText(richTextEditorRef.current, copyMode === "plain"));

    // 🔑 NEW: Listen for Alt+C keyboard shortcut from Electron
    React.useEffect(() => {
      if (typeof window === "undefined") {
        return;
      }

      const electronApi = (window as any).electron;
      if (!electronApi?.onCopyReport) {
        return;
      }

      const unsubscribe = electronApi.onCopyReport(() => {
        handleCopyEditedText(richTextEditorRef.current, copyMode === "plain");
      });

      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }, [handleCopyEditedText, copyMode]);

    // Show loader when editor is not available
    if (!editor) {
      return (
        <div
          className={cn(
            "flex flex-col flex-1 h-full border rounded-md relative",
            classNames?.editorContainer
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center flex-1 p-4",
              classNames?.loaderContainer
            )}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading editor...</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col flex-1 min-h-[90px] rounded-md relative overflow-hidden resize-y max-h-[680px] widget-input-area",
          classNames?.editorContainer
        )}
      >
        <div className="flex items-center">
          {requireToolbar && (
            <Toolbar editor={editor} addLink={addLink} classNames={classNames} />
          )}
          {allowCopy && (
            <div
              className={cn(
                "p-2 pl-2 top-0 right-0 z-20 flex items-center gap-1",
                classNames?.toolbarToolsContainer,
                classNames?.copyButtonContainer
              )}
            >
              {allowMic && <RichTextEditorTranscription editor={editor} />}
              {allowExport && (
                <TooltipIconButton
                  data-voice-download
                  tooltip="Download"
                  variant={"outline"}
                  className="h-8 w-8 bg-transparent"
                  side="top"
                  onClick={() => reportExportMutation(richTextEditorRef)}
                >
                  <DownloadIcon />
                </TooltipIconButton>
              )}
              {customControls && (
                <>
                  <Separator orientation="vertical" className="h-8 mx-1" />
                  {customControls}
                </>
              )}
              <Separator orientation="vertical" className="h-8 ml-1" />
              <div className="flex items-center rounded-md px-1 bg-black">
                <Button
                  data-voice-copy
                  size="icon"
                  variant="ghost"
                  className={cn("h-8 px-2", classNames?.copyButton)}
                  onClick={() => {
                    handleCopyEditedText(richTextEditorRef.current, copyMode === "plain");
                  }}
                >
                  {isCopied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                </Button>
                <span
                  className="text-sm text-nowrap cursor-pointer hidden md:block"
                  onClick={() => {
                    handleCopyEditedText(richTextEditorRef.current, copyMode === "plain");
                  }}>
                  {copyMode === "plain" ? "Plain Text" : "Formatted"}
                </span>

                <Select value={copyMode} onValueChange={(val) => setCopyMode(val as "formatted" | "plain")}>
                  <SelectTrigger className="h-8 w-8 p-0 border-none focus:ring-0 focus:outline-none focus:border-none flex items-center justify-center">
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="formatted">Copy as Formatted</SelectItem>
                    <SelectItem value="plain">Copy as Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        {
          editor && !isLoading &&
          <EditorContent
            id={"markDownRichText"}
            ref={mergeRefs(richTextEditorRef, ref)}
            editor={editor}
            className={cn(
              "max-w-none flex-1 min-h-0 overflow-y-scroll p-3",
              "[&::-webkit-scrollbar]:w-2",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-transparent",
              classNames?.editor
            )}
          />
        }
        {/* Centered Loader */}
        {isLoading && (
          <div className="flex items-center justify-center absolute inset-0 z-30">
            {loader}
          </div>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;