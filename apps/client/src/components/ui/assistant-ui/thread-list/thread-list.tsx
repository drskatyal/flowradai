import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditThread, useThreads } from "@/modules/thread/hooks";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import { EditIcon, Ellipsis, PanelLeft, Pencil } from "lucide-react";
import { forwardRef, useEffect, useRef, useState, type FC } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useThreadListItem } from "@assistant-ui/react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useSidebar } from "@/providers/sidebar-provider";
import { useStore } from "@/stores";
import { cn } from "@/lib/utils";
import { useDesktopView } from "@/hooks";

type ButtonWithTooltipProps = ButtonProps & {
  tooltip: string;
  side?: TooltipContentProps["side"];
};

// ✅ forwardRef so `ref` works
export const ButtonWithTooltip = forwardRef<HTMLButtonElement, ButtonWithTooltipProps>(
  ({ children, tooltip, side = "top", ...rest }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button ref={ref} {...rest}>
              {children}
              <span className="sr-only">{tooltip}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ButtonWithTooltip.displayName = "ButtonWithTooltip";

export const TopLeft: FC = () => {
  const { } = useThreads(); // To refetch threads properly on create new thread

  const { isSidebar, setIsSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  // ref for desktop "New Report"
  const newReportDesktopRef = useRef<HTMLButtonElement | null>(null);

  // 🔑 Shortcut only for desktop
  useHotkeys(
    "n",
    (e) => {
      // Don't trigger if user is typing in an input/textarea/contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      newReportDesktopRef.current?.click();
    },
    []
  );

  return (
    <div className={cn("md:flex flex-col w-full justify-between items-start md:pb-4 gap-2 p-4")}>
      <img src={"/Flowrad logo.png"} alt="flowrad-logo" className="w-8 h-8" />

      <ThreadListPrimitive.New asChild>
        <ButtonWithTooltip
          ref={newReportDesktopRef}
          variant="ghost"
          className="p-2 mt-2 w-full"
          tooltip="New Report"
          side="right"
        >
          <span className="flex items-center gap-2 w-full justify-between">
            New Report
            <EditIcon className="size-4" />
          </span>
        </ButtonWithTooltip>
      </ThreadListPrimitive.New>
    </div>
  );
};

export const ThreadListItem: FC = () => {
  const threadListItem = useThreadListItem()
  const threadId = threadListItem.id;
  const { isSidebar, setIsSidebar } = useSidebar();
  const { isDesktopView } = useDesktopView();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(threadListItem.title || "New Chat");
  const [isHovered, setIsHovered] = useState(false);

  // Sync title state when threadListItem.title changes (e.g., after AI name generation)
  useEffect(() => {
    if (threadListItem.title) {
      setTitle(threadListItem.title);
    }
  }, [threadListItem.title]);


  const thread = useStore((state) => state.thread);
  const setThread = useStore((state) => state.setThread);
  const threads = useStore((state) => state.threads);
  const setThreads = useStore((state) => state.setThreads);

  const handleEditSuccess = (data: { name: string }) => {
    if (!thread) return;

    setThread({ ...thread, name: data.name });
    setThreads(
      threads.map((thread) =>
        thread.threadId === threadId ? { ...thread, title: data.name } : thread
      )
    );
  };

  const { editThread } = useEditThread(threadId, handleEditSuccess);

  const handleSave = async () => {
    const currentTitle = threadListItem.title || "New Chat";

    if (title.trim() === currentTitle.trim()) {
      setIsEditing(false);
      return;
    }

    editThread({ name: title });
    setIsEditing(false);
  };

  const shouldShowMore = !isDesktopView || isHovered;

  return (
    <ThreadListItemPrimitive.Root className="hover:text-primary hover:bg-surface-primary data-[active]:bg-surface-primary data-[active]:text-primary flex items-center gap-2 rounded-lg transition-all text-sm font-normal">
      <ThreadListItemPrimitive.Trigger className="flex-grow text-start px-3 py-2 report-list">
        <div
          className="flex justify-between items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave} // Save when focus lost
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full px-2 py-1 text-sm border-none outline-none bg-transparent focus:ring-0"
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-grow truncate">
                    {(() => {
                      const originalTitle = threadListItem.title || "New Chat";
                      const words = originalTitle.split(" ");
                      if (words.length > 3) {
                        return words.slice(0, 3).join(" ") + "...";
                      }
                      return originalTitle;
                    })()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{threadListItem.title || "New Chat"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Wrap your button with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              {
                (shouldShowMore) &&
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center justify-center h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation() // prevent thread activation
                  }}
                >
                  <Ellipsis className="h-4 w-4" />
                </Button>
              }
            </PopoverTrigger>

            <PopoverContent align="end" className="w-40 p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </ThreadListItemPrimitive.Trigger>
    </ThreadListItemPrimitive.Root>
  )
}

export const MainLeft: FC = () => {
  const { isSidebar, setIsSidebar } = useSidebar();
  const { isDesktopView } = useDesktopView();

  useEffect(() => {
    if (!isDesktopView) {
      setIsSidebar(true);
    }
  }, [isDesktopView]);
  return (
    <nav className="flex flex-col items-stretch gap-1 text-sm font-medium overflow-y-auto grow px-4">
      <ThreadListPrimitive.Items components={{ ThreadListItem }} />
    </nav>
  );
};
