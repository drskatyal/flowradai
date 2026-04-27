"use client";

import React from "react";
import Draggable from "react-draggable";
import {
  Dialog as UiDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DialogContentProps,
  DialogProps as UiDialogProps,
  DialogTriggerProps,
} from "@radix-ui/react-dialog";

interface DialogStyles {
  trigger?: string;
  content?: string;
  header?: string;
  headerTitle?: string;
  headerDescription?: string;
  footer?: string;
}

export interface DialogProps extends UiDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  headerTitle?: React.ReactNode;
  headerDescription?: React.ReactNode;
  footer?: React.ReactNode;
  classNames?: DialogStyles;
  triggerProps?: DialogTriggerProps;
  contentProps?: DialogContentProps;
  draggable?: boolean;
  dragHandleClassName?: string; // optional drag handle class
  allowInteractionOutside?: boolean;
}

export const Dialog = ({
  children,
  trigger,
  headerTitle,
  headerDescription,
  footer,
  classNames,
  triggerProps,
  contentProps,
  draggable = false,
  dragHandleClassName = ".dialog-drag-handle", // default handle,
  allowInteractionOutside,
  ...props
}: DialogProps) => {
  const dialogContent = (
    <DialogContent
      onInteractOutside={(e) => {
        allowInteractionOutside && e.preventDefault(); // Block outside click from closing the dialog
      }}
      className={cn("min-w-fit max-w-[95%] max-h-[99vh]", classNames?.content)}
      {...contentProps}
    >
      {(headerTitle || headerDescription) && (
        <DialogHeader className={classNames?.header}>
          {/* Drag handle only rendered when draggable is true */}
          {draggable && headerTitle && (
            <div
              className={`dialog-drag-handle cursor-move px-4 py-2 bg-muted text-muted-foreground font-medium rounded-t-md ${
                classNames?.headerTitle ?? ""
              }`}
            >
              {headerTitle}
            </div>
          )}
          {!draggable && headerTitle && (
            <DialogTitle className={classNames?.headerTitle}>
              {headerTitle}
            </DialogTitle>
          )}
          {headerDescription && (
            <DialogDescription className={classNames?.headerDescription}>
              {headerDescription}
            </DialogDescription>
          )}
        </DialogHeader>
      )}
      {children}
      {footer && (
        <DialogFooter className={classNames?.footer}>{footer}</DialogFooter>
      )}
    </DialogContent>
  );

  return (
    <UiDialog modal={allowInteractionOutside ? false : true} {...props}>
      {trigger && (
        <DialogTrigger
          asChild
          className={classNames?.trigger}
          {...triggerProps}
        >
          {trigger}
        </DialogTrigger>
      )}
      {draggable ? (
        <Draggable handle={dragHandleClassName}>
          <div>{dialogContent}</div>
        </Draggable>
      ) : (
        dialogContent
      )}
    </UiDialog>
  );
};
