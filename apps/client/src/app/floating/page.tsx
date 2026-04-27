"use client";
import { useEffect } from "react";
import { FloatingWindow } from "@/modules/floating-window/floating-window";
import { ThreadProvider, VoiceCommandProvider } from "@/providers";

export default function FloatingPage() {
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const appRoot = document.getElementById("__next");

    const previousHtmlBackground = htmlEl.style.backgroundColor;
    const previousBodyBackground = bodyEl.style.backgroundColor;
    const previousAppRootBackground = appRoot?.style.backgroundColor ?? "";
    const floatingBodyClass = "floating-body";

    htmlEl.style.backgroundColor = "transparent";
    bodyEl.style.backgroundColor = "transparent";
    bodyEl.classList.add(floatingBodyClass);
    if (appRoot) {
      appRoot.style.backgroundColor = "transparent";
    }

    return () => {
      htmlEl.style.backgroundColor = previousHtmlBackground;
      bodyEl.style.backgroundColor = previousBodyBackground;
      bodyEl.classList.remove(floatingBodyClass);
      if (appRoot) {
        appRoot.style.backgroundColor = previousAppRootBackground;
      }
    };
  }, []);

  return (
    <ThreadProvider>
      <VoiceCommandProvider>
        <FloatingWindow />
      </VoiceCommandProvider>
    </ThreadProvider>
  );
}
