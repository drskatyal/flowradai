"use client";

import React, { FC, ReactNode, useRef } from "react";
import Draggable from "react-draggable";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  draggable?: boolean;
  width?: string; // e.g. "600px"
  className?: string;
}

const CustomModal: FC<CustomModalProps> = ({
  isOpen,
  title = "Modal",
  children,
  onClose,
  draggable = false,
  width = "600px",
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const content = (
    <div
      ref={modalRef}
      className={cn(
        "z-50 bg-background rounded-lg shadow-lg border",
        draggable
          ? "fixed top-32 left-32"
          : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        `w-[${width}]`,
        className
      )}
      style={{ width }}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b flex items-center justify-between",
          draggable && "cursor-move drag-handle"
        )}
      >
        <h2 className="font-semibold text-sm md:text-lg">{title}</h2>
        <button
          onClick={onClose}
          className="h-6 w-6 rounded-full inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">{children}</div>
    </div>
  );

  return draggable ? (
    <Draggable handle=".drag-handle" nodeRef={modalRef}>
      {content}
    </Draggable>
  ) : (
    content
  );
};

export default CustomModal;
