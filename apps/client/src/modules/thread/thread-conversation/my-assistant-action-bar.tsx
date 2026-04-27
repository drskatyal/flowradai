import { FC, MouseEvent, MouseEventHandler, useEffect, useRef } from "react";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { ActionBarPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { CheckIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

interface MyAssistantActionBarProps {
  messageId: string;
  onCopy?: MouseEventHandler<HTMLButtonElement>;
  onDownload?: MouseEventHandler<HTMLButtonElement>;
}

const MyAssistantActionBar: FC<MyAssistantActionBarProps> = ({
  onCopy,
  onDownload,
}) => {
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);
  const downloadButtonRef = useRef<HTMLButtonElement | null>(null);
  const { copyActionRef, copyRef, downloadActionRef, downloadRef } =
    useVoiceCommandContext();

  useEffect(() => {
    const copyAction = onCopy
      ? () => onCopy({} as MouseEvent<HTMLButtonElement>)
      : null;
    const downloadAction = onDownload
      ? () => onDownload({} as MouseEvent<HTMLButtonElement>)
      : null;

    copyRef.current = copyButtonRef.current;
    downloadRef.current = downloadButtonRef.current;
    copyActionRef.current = copyAction;
    downloadActionRef.current = downloadAction;

    return () => {
      if (copyRef.current === copyButtonRef.current) {
        copyRef.current = null;
      }

      if (downloadRef.current === downloadButtonRef.current) {
        downloadRef.current = null;
      }

      if (copyActionRef.current === copyAction) {
        copyActionRef.current = null;
      }

      if (downloadActionRef.current === downloadAction) {
        downloadActionRef.current = null;
      }
    };
  }, [copyActionRef, copyRef, downloadActionRef, downloadRef, onCopy, onDownload]);

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground data-[floating]:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild onClick={onCopy}>
        <TooltipIconButton ref={copyButtonRef} tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <TooltipIconButton
        ref={downloadButtonRef}
        tooltip="Download"
        onClick={onDownload}
      >
        <DownloadIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.Root>
  );
};

export default MyAssistantActionBar;
