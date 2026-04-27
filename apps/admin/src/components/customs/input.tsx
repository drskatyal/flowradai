import React from "react";
import { Input as UiInput } from "@/components/ui/input";

export interface InputStyles {
  inputContainer?: string;
  input?: string;
  inputPrefix?: string;
  inputSuffix?: string;
}

export interface InputProps extends React.ComponentProps<typeof UiInput> {
  inputSuffix?: React.ReactNode;
  inputPrefix?: React.ReactNode;
  classNames?: InputStyles;
  disabled?: boolean;
}

export const Input = ({
  inputSuffix,
  inputPrefix,
  classNames,
  disabled,
  ...props
}: InputProps) => (
  <div
    className={`
      flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring md:text-sm items-center justify-center gap-2
      ${disabled ? "cursor-not-allowed opacity-50" : ""}
      ${classNames?.inputContainer ?? ""}`}
  >
    {inputPrefix && (
      <span
        className={`flex items-center text-muted-foreground 
          ${disabled ? "cursor-not-allowed" : ""}
          ${classNames?.inputPrefix ?? ""}`}
      >
        {inputPrefix}
      </span>
    )}
    <UiInput
      {...props}
      disabled={disabled}
      className={`h-full w-full border-0 bg-transparent p-0
          focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none
          disabled:cursor-not-allowed min-w-2.5
          ${classNames?.input ?? ""}`}
    />
    {inputSuffix && (
      <span
        className={`flex items-center text-muted-foreground
          ${disabled ? "cursor-not-allowed" : ""}
          ${classNames?.inputSuffix ?? ""}`}
      >
        {inputSuffix}
      </span>
    )}
  </div>
);
