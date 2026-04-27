"use client";

import "./rich-text-editor.css";
import { Check, Copy, DownloadIcon, Loader2, MessageSquareShare } from "lucide-react";
import React, { useRef } from "react";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useReportExport } from "@/hooks";
import { cn } from "@/lib/utils";
import { mergeRefs } from "@/utils";
import { Editor, EditorContent, UseEditorOptions } from "@tiptap/react";
import RichTextEditorTranscription from "../transcript/rich-text-editor-transcription";
import { useRichTextEditor, extensions } from "./hooks";
import Toolbar, { ToolbarStyles } from "./Toolbar";
import ShareEmailDialog from "./share-email-dialog";
import { useUserHandler } from "@/hooks/use-user-handler";
import { editorJSONToMarkdown } from "./convertRichTextDocToMarkdown";
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
  allowShare?: boolean;
  isLoading?: boolean;
  loader?: React.ReactNode;
  disabled?: boolean;
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
      allowShare = false,
      isLoading = false,
      loader,
      disabled = false,
    },
    ref
  ) => {
    const richTextEditorRef = useRef<HTMLDivElement>(null);

    const { editor, handleCopyEditedText, isCopied, addLink, copyMode, setCopyMode } =
      useRichTextEditor({ value, onChange, editorOptions, disabled });
    const { mutate: reportExportMutation } = useReportExport();
    const { setLiveTranscript } = useThreadContext();
    const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
    const { user } = useUserHandler();

    useHotkeys('c', () => handleCopyEditedText(richTextEditorRef.current, copyMode === "plain"));

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
          "flex flex-col flex-1 h-[300px] lg:h-full border rounded-md relative",
          classNames?.editorContainer
        )}
      >
        <div className="flex items-center border-b">
          {requireToolbar && (
            <Toolbar editor={editor} addLink={addLink} classNames={classNames} />
          )}
          {allowCopy && (
            <div
              className={cn(
                "p-2 pl-2 top-0 right-0  bg-background z-20 flex items-center gap-1",
                classNames?.toolbarToolsContainer,
                classNames?.copyButtonContainer
              )}
            >
              {allowMic && <RichTextEditorTranscription editor={editor} />}
              {allowShare && (
                <>
                  <TooltipIconButton
                    tooltip="Share via Email"
                    variant={"outline"}
                    className="h-8 w-8"
                    side="top"
                    onClick={() => setIsShareDialogOpen(true)}
                  >
                    <MessageSquareShare className="h-4 w-4" />
                  </TooltipIconButton>
                  <ShareEmailDialog
                    isOpen={isShareDialogOpen}
                    onClose={() => setIsShareDialogOpen(false)}
                    defaultMessage={editor ? editorJSONToMarkdown(editor.getJSON(), extensions) : ""}
                    defaultHtmlMessage={editor?.getHTML() || ""}
                    userEmail={user?.email || ""}
                    userReportEmail={user?.reportEmail || ""}
                  />
                </>
              )}
              {allowExport && (
                <TooltipIconButton
                  tooltip="Download"
                  variant={"outline"}
                  className="h-8 w-8"
                  side="top"
                  onClick={() => reportExportMutation(richTextEditorRef)}
                >
                  <DownloadIcon />
                </TooltipIconButton>
              )}
              <Separator orientation="vertical" className="h-8 ml-1" />
              <div className="flex items-center border px-1">
                <Button
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
              "prose max-w-none flex-1 overflow-y-auto p-4",
              classNames?.editor
            )}
          />
        }
        {isLoading && loader}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;