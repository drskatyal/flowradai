import React from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { getRichTextTools } from "./constant/editor-tools";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";

export interface ToolbarStyles {
  toolbarSeparator?: string;
  toolbarToggleButton?: string;
  toolbarToolsContainer?: string;
}

interface ToolbarProps {
  editor: Editor;
  addLink: () => void;
  classNames?: ToolbarStyles;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, addLink, classNames }) => {
  if (!editor) return null;

  const richTextTools = getRichTextTools(editor, addLink);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-1 sticky top-0 w-full overflow-x-auto z-10 dark-scrollbar",
        classNames?.toolbarToolsContainer
      )}
    >
      {richTextTools.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {group.tools.map((item, i) => (
            <Toggle
              key={`${group.id}-${i}`}
              variant="outline"
              pressed={item?.isActive}
              onPressedChange={item?.action}
              className={cn("h-8 min-w-8", classNames?.toolbarToggleButton)}
              aria-label="Toggle formatting"
            >
              {item?.icon}
            </Toggle>
          ))}
          {groupIndex < richTextTools.length - 1 && (
            <Separator
              orientation="vertical"
              className={cn("h-full", classNames?.toolbarSeparator)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Toolbar;
