import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { ReactNode } from "react";
import { Editor } from "@tiptap/react";

export type RichTextTool = {
  icon: ReactNode;
  action: () => void;
  isActive?: boolean;
};

export type RichTextToolGroup = {
  id: string;
  tools: RichTextTool[];
};

export const getRichTextTools = (
  editor: Editor,
  addLink: () => void
): RichTextToolGroup[] => [
  {
    id: "history",
    tools: [
      {
        icon: <Undo />,
        action: () => editor.chain().focus().undo().run(),
      },
      {
        icon: <Redo />,
        action: () => editor.chain().focus().redo().run(),
      },
    ],
  },
  {
    id: "headings",
    tools: [
      {
        icon: <Heading1 />,
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: <Heading2 />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: <Heading3 />,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
      },
    ],
  },
  {
    id: "formatting",
    tools: [
      {
        icon: <Bold />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        icon: <Italic />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
      },
      {
        icon: <Strikethrough />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
      },
    ],
  },
  {
    id: "lists",
    tools: [
      {
        icon: <List />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
      },
      {
        icon: <ListOrdered />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
      },
    ],
  },
];
