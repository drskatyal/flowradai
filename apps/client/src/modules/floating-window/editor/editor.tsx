import { useRef, useState, useEffect, useCallback } from "react";
import { useMessageEditor } from "../../thread/thread-conversation/hooks";
import { RichTextEditor, RichTextEditorHandle } from "../rich-text-editor";
import BarsLoader from "./loader";
import { RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

const convertToCleanMarkdown = (html: string) => {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  let md = "";

  const processNode = (node: any) => {
    // TEXT NODES
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text) md += text + " ";
      return;
    }

    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();
    const isBold =
      tag === "strong" ||
      tag === "b" ||
      node.style?.fontWeight === "bold" ||
      node.classList?.contains("font-bold") ||
      node.classList?.contains("ProseMirror-selectednode");

    // TipTap headings appear as <p class="heading"> or <h1>
    const isHeading =
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      node.classList?.contains("heading");

    if (isHeading) {
      md += "\n\n" + node.textContent.trim().toUpperCase() + "\n\n";
      return;
    }

    // Bold subheading (Study:, Technique:, etc.)
    if (isBold) {
      md += `\n${node.textContent.trim()}: \n`;
      return;
    }

    if (tag === "p") {
      md += node.textContent.trim() + "\n\n";
      return;
    }

    if (tag === "br") {
      md += "\n";
      return;
    }

    // Process children
    node.childNodes.forEach((child: any) => processNode(child));
  };

  div.childNodes.forEach((child) => processNode(child));

  return md.replace(/\n{3,}/g, "\n\n").trim();
};


const MessageEditor = () => {
  const richTextEditorRef = useRef<HTMLDivElement>(null);
  const editorHandleRef = useRef<RichTextEditorHandle>(null);
  const { handleEditResponse, editedResponse, isRunning } = useMessageEditor();
  const { copyActionRef, downloadActionRef } = useVoiceCommandContext();

  const [hasSourceWindow, setHasSourceWindow] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceStatus, setReplaceStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isElectron, setIsElectron] = useState(false);

  const handleVoiceCopy = useCallback(() => {
    editorHandleRef.current?.copyContent();
  }, []);

  const handleVoiceDownload = useCallback(() => {
    editorHandleRef.current?.downloadContent();
  }, []);

  // Register with voice command context
  useEffect(() => {
    copyActionRef.current = handleVoiceCopy;
    downloadActionRef.current = handleVoiceDownload;

    return () => {
      if (copyActionRef.current === handleVoiceCopy) copyActionRef.current = null;
      if (downloadActionRef.current === handleVoiceDownload) downloadActionRef.current = null;
    };
  }, [copyActionRef, downloadActionRef, handleVoiceCopy, handleVoiceDownload]);

  useEffect(() => {
    const electronAvailable = typeof window !== 'undefined' &&
      window.electron !== undefined;

    setIsElectron(electronAvailable);

    if (electronAvailable && window.electron) {
      const unsubscribeWindowInfo = window.electron.onSourceWindowInfo((info: any) => {
        const hasWindow = !!info && (!!info.windowName || !!info.processId || !!info.processName);
        setHasSourceWindow(hasWindow);
      });

      const unsubscribeReplaceResult = window.electron.onReplaceResult((result: { success: boolean }) => {
        setIsReplacing(false);
        setReplaceStatus(result.success ? 'success' : 'error');

        setTimeout(() => {
          setReplaceStatus('idle');
        }, 3000);

        if (result.success) {
          setTimeout(() => {
            window.electron?.closeWindow();
          }, 1500);
        }
      });

      return () => {
        unsubscribeWindowInfo();
        unsubscribeReplaceResult();
      };
    }
  }, []);

  const handleReplace = () => {
    if (!editedResponse) return;

    setIsReplacing(true);
    setReplaceStatus("idle");

    const rawHtml = document.querySelector(".ProseMirror")?.innerHTML || editedResponse;
    const markdown = convertToCleanMarkdown(rawHtml);

    // Send both HTML and plain text for formatted paste
    window.electron?.replaceSelectedText(markdown, rawHtml);
  };

  const extractPlainText = (richText: string): string => {
    if (!richText) return '';

    if (!richText.includes('<') && !richText.includes('>')) {
      return richText;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = richText;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const getReplaceButtonContent = () => {
    if (replaceStatus === 'success') {
      return (
        <>
          <Check className="w-4 h-4" />
        </>
      );
    }
    if (replaceStatus === 'error') {
      return (
        <>
          <X className="w-4 h-4" />
        </>
      );
    }
    if (isReplacing) {
      return (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
        </>
      );
    }
    return (
      <>
        <RefreshCw className="w-4 h-4" />
      </>
    );
  };

  // ⭐ FIX: Show button in Electron regardless of source window
  const showReplaceButton = isElectron;

  return (
    <div className="space-y-2">
      <RichTextEditor
        ref={richTextEditorRef}
        imperativeRef={editorHandleRef}
        value={editedResponse}
        onChange={handleEditResponse}
        allowCopy
        allowMic
        allowExport
        isLoading={isRunning}
        loader={<BarsLoader />}
        disabled={false}
        customControls={
          showReplaceButton && (
            <Button
              onClick={handleReplace}
              size="sm"
              disabled={isReplacing || !editedResponse || isRunning}
              className={`
                flex items-center px-3 rounded-md bg-black font-medium transition-all duration-200 h-8
                ${replaceStatus === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : replaceStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : ''
                }
                ${(isReplacing || !editedResponse || isRunning) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={hasSourceWindow ? 'Replace text in the original document' : 'Copy text and manually paste in your document'}
            >
              {getReplaceButtonContent()}
            </Button>
          )
        }
      />
    </div>
  );
};

export default MessageEditor;