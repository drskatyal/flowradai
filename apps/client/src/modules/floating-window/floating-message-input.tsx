"use client";
import { useStore } from "@/stores/use-store";
import FloatingComposer from "./floating-composer";
import { FloatingInput } from "./floating-input";
import { ThreadPrimitive } from "@assistant-ui/react";
import { useEffect, useMemo } from "react";
import { useThreadContext } from "@/providers/thread-provider";

type SelectedTextPayload = {
  text?: string;
};

export const FloatingMessageInput = () => {
  const {
    thread,
    messagesError,
    isRunning,
    threadId,
  } = useStore();
  const { setMessageText, setPrimitiveInput } = useThreadContext();

  const isThreadRegular = useMemo(() => thread?.status === "regular", [thread?.status]);
  const isSendMessageDisabled = !threadId || messagesError || isRunning;
  const size = 40;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const electronApi = (window as any).electron;
    if (!electronApi?.onSelectedText) {
      return;
    }

    const unsubscribe = electronApi.onSelectedText((payload: SelectedTextPayload | string) => {
      const incomingText = typeof payload === "string" ? payload : payload?.text;
      if (!incomingText || !incomingText.trim()) {
        return;
      }

      if (isThreadRegular) {
        setMessageText(incomingText);
        requestAnimationFrame(() => {
          const textarea = document.querySelector(
            "textarea.composer-input"
          ) as HTMLTextAreaElement | null;
          if (textarea) {
            const caret = incomingText.length;
            textarea.focus();
            textarea.setSelectionRange(caret, caret);
          }
        });
      } else {
        setPrimitiveInput((prev) => {
          const base = prev || { studyName: null, findings: null };
          return {
            ...base,
            findings: incomingText,
          };
        });
        requestAnimationFrame(() => {
          const textarea = document.getElementById("findings") as HTMLTextAreaElement | null;
          if (textarea) {
            const caret = incomingText.length;
            textarea.focus();
            textarea.setSelectionRange(caret, caret);
          }
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isThreadRegular, setMessageText, setPrimitiveInput]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const electronApi = (window as any).electron;
    if (!electronApi?.onClearSelectedText) {
      return;
    }

    const unsubscribe = electronApi.onClearSelectedText(() => {
      setMessageText("");
      setPrimitiveInput((prev) => {
        const base = prev || { studyName: null, findings: null };
        return {
          ...base,
          findings: null,
        };
      });
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [setMessageText, setPrimitiveInput]);

  return (
    <ThreadPrimitive.If running={isRunning}>
      {isThreadRegular && threadId ? (
        <FloatingComposer
          isSendMessageDisabled={isSendMessageDisabled}
          size={size}
        />
      ) : (
        <FloatingInput />
      )}
    </ThreadPrimitive.If>
  );
};

export default FloatingMessageInput;

