"use client";

import React, {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useThreadContext } from "@/providers/thread-provider";
import VoiceCommandBar from "@/components/customs/voice-command-bar";
import { useStore } from "@/stores";
import { serverAxios } from "@/lib/axios";
import { marked } from "marked";
import { toast } from "@/hooks/use-toast";

interface VoiceCommandContextValue {
  copyRef: MutableRefObject<HTMLButtonElement | null>;
  downloadRef: MutableRefObject<HTMLButtonElement | null>;
  copyActionRef: MutableRefObject<(() => void) | null>;
  downloadActionRef: MutableRefObject<(() => void) | null>;
  micStartRef: MutableRefObject<(() => void) | null>;
  micStopRef: MutableRefObject<(() => void) | null>;
  newSessionRef: MutableRefObject<HTMLButtonElement | null>;
}

const VoiceCommandContext = createContext<VoiceCommandContextValue | null>(null);

const normalizeVoiceCommandText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\bmike\b/g, "mic")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasPhrase = (value: string, phrases: string[]) =>
  phrases.some((phrase) => value.includes(phrase));

const hasAllWords = (value: string, words: string[]) =>
  words.every((word) => value.includes(word));

export const VoiceCommandProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { voiceCommandsEnabled } = useThreadContext();
  const { messages } = useStore();
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const micStartRef = useRef<(() => void) | null>(null);
  const micStopRef = useRef<(() => void) | null>(null);
  const newSessionRef = useRef<HTMLButtonElement | null>(null);
  const copyRef = useRef<HTMLButtonElement | null>(null);
  const downloadRef = useRef<HTMLButtonElement | null>(null);
  const copyActionRef = useRef<(() => void) | null>(null);
  const downloadActionRef = useRef<(() => void) | null>(null);
  const lastFinalTranscriptRef = useRef<string>("");
  const [lastMatchedCommand, setLastMatchedCommand] = useState<string | null>(null);
  const [liveDetectedCommand, setLiveDetectedCommand] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Read copy mode preference from sessionStorage (same key used by useRichTextEditor)
  const getCopyMode = (): "formatted" | "plain" => {
    if (typeof window === "undefined") return "formatted";
    return (sessionStorage.getItem("COPY_MODE_SESSION_KEY") as "formatted" | "plain") || "formatted";
  };

  // Get last assistant message markdown content from store
  const getLastAssistantContent = (): string => {
    const msgs = messagesRef.current;
    const last = msgs[msgs.length - 1];
    return last?.role === "assistant" ? (last.content || "") : "";
  };

  const handleVoiceCopyReport = (mode?: "formatted" | "plain") => {
    const content = getLastAssistantContent();
    if (!content) {
      toast({ title: "No report to copy", variant: "destructive" });
      return;
    }

    const copyMode = mode ?? getCopyMode();
    const html = marked.parse(content, { async: false }) as string;

    // Normalise dash characters (same as copy-text helper)
    const normaliseDashes = (s: string) =>
      s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");

    if (copyMode === "plain") {
      // Strip HTML tags to get plain text
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const plain = normaliseDashes(tempDiv.textContent || tempDiv.innerText || "");
      navigator.clipboard
        .write([new ClipboardItem({ "text/plain": new Blob([plain], { type: "text/plain" }) })])
        .then(() => toast({ title: "Report copied to clipboard (plain text)" }))
        .catch(() => toast({ title: "Failed to copy report", variant: "destructive" }));
    } else {
      const normHtml = normaliseDashes(html);
      // Extract plain text from the HTML for the text/plain entry
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const plain = normaliseDashes(tempDiv.textContent || tempDiv.innerText || "");
      navigator.clipboard
        .write([
          new ClipboardItem({
            "text/html": new Blob([normHtml], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ])
        .then(() => toast({ title: "Report copied to clipboard" }))
        .catch(() => toast({ title: "Failed to copy report", variant: "destructive" }));
    }
  };

  const handleVoiceDownloadReport = async () => {
    const content = getLastAssistantContent();
    if (!content) {
      toast({ title: "No report to download", variant: "destructive" });
      return;
    }
    const html = marked.parse(content, { async: false }) as string;
    try {
      const response = await serverAxios.post(
        "/report-export",
        JSON.stringify({ element: { innerHTML: html } }),
        { headers: { "Content-Type": "application/json" }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Report.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download report", variant: "destructive" });
    }
  };

  const runCommand = (label: string, callback: () => void) => {
    setLastMatchedCommand(label);
    callback();
  };

  useEffect(() => {
    if (!lastMatchedCommand) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLastMatchedCommand((current) =>
        current === lastMatchedCommand ? null : current
      );
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lastMatchedCommand]);

  useEffect(() => {
    // Request microphone permission on mount
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.warn("Microphone permission denied or error:", error);
      }
    };

    requestMicPermission();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
    resetTranscript,
    transcript,
    finalTranscript,
  } = useVoiceCommands([], voiceCommandsEnabled && !isMobileView);

  // Track the last finalTranscript we processed so we don't double-fire
  useEffect(() => {
    if (!voiceCommandsEnabled || !finalTranscript) {
      return;
    }

    const normalizedTranscript = normalizeVoiceCommandText(finalTranscript);

    // Skip if we already processed this exact final transcript
    if (lastFinalTranscriptRef.current === normalizedTranscript) {
      return;
    }
    lastFinalTranscriptRef.current = normalizedTranscript;

    const getCommandMatchers = (text: string) => [
      {
        label: "start mic",
        isMatch: () =>
          hasPhrase(text, [
            "start mic",
            "turn on mic",
            "begin mic",
            "enable mic",
          ]) ||
          (hasAllWords(text, ["start", "mic"]) &&
            !text.includes("stop")) ||
          hasAllWords(text, ["turn", "on", "mic"]),
        run: () => micStartRef.current?.(),
      },
      {
        label: "stop mic",
        isMatch: () =>
          hasPhrase(text, [
            "stop mic",
            "turn off mic",
            "pause mic",
            "disable mic",
          ]) ||
          hasAllWords(text, ["stop", "mic"]) ||
          hasAllWords(text, ["turn", "off", "mic"]),
        run: () => micStopRef.current?.(),
      },
      {
        label: "new session",
        isMatch: () => {
          if (
            text.includes("copy") ||
            text.includes("download") ||
            text.includes("save") ||
            text.includes("export")
          ) {
            return false;
          }
          return (
            hasPhrase(text, [
              "new session",
              "new report",
              "new study",
              "create new session",
              "create new report",
              "start new session",
              "start new report",
              "open new session",
              "open new report",
            ]) ||
            (text.includes("new") &&
              (text.includes("session") ||
                text.includes("report") ||
                text.includes("study")))
          );
        },
        run: () => newSessionRef.current?.click(),
      },
      {
        label: "copy report formatted",
        isMatch: () =>
          hasPhrase(text, [
            "copy report as formatted",
            "copy as formatted",
            "copy formatted",
            "copy report formatted",
          ]),
        run: () => {
          if (copyActionRef.current) { copyActionRef.current(); return; }
          handleVoiceCopyReport("formatted");
        },
      },
      {
        label: "copy report plain",
        isMatch: () =>
          hasPhrase(text, [
            "copy report as plain",
            "copy as plain",
            "copy plain",
            "copy report plain",
            "copy plain text",
            "copy report as plain text",
          ]),
        run: () => handleVoiceCopyReport("plain"),
      },
      {
        label: "copy report",
        isMatch: () =>
          hasPhrase(text, [
            "copy report",
            "copy this report",
            "copy the report",
            "copy it",
          ]) ||
          text === "copy" ||
          (text.includes("copy") &&
            (text.includes("report") ||
              text.includes("result"))),
        run: () => {
          if (copyActionRef.current) {
            copyActionRef.current();
            return;
          }
          // Use current copy mode preference
          handleVoiceCopyReport();
        },
      },
      {
        label: "download report",
        isMatch: () =>
          hasPhrase(text, [
            "download report",
            "download this report",
            "download the report",
            "save report",
            "export report",
          ]) ||
          text === "download" ||
          (text.includes("download") &&
            (text.includes("report") ||
              text.includes("result"))),
        run: () => {
          // Try registered action ref first
          if (downloadActionRef.current) {
            downloadActionRef.current();
            return;
          }
          // Fallback: read directly from store — always works regardless of what's mounted
          void handleVoiceDownloadReport();
        },
      },
    ];

    const commandMatchers = getCommandMatchers(normalizedTranscript);

    const matchedCommand = commandMatchers.find((cmd) => cmd.isMatch());

    if (!matchedCommand) {
      return;
    }

    // Reset immediately so the next spoken phrase starts fresh
    resetTranscript();
    lastFinalTranscriptRef.current = "";

    runCommand(matchedCommand.label, matchedCommand.run);
  }, [
    finalTranscript,
    resetTranscript,
    voiceCommandsEnabled,
  ]);

  // Handle live detected command from transcript (interim results)
  useEffect(() => {
    if (!voiceCommandsEnabled || !transcript) {
      setLiveDetectedCommand(null);
      return;
    }

    const normalizedLive = normalizeVoiceCommandText(transcript);

    // Reuse the same logic but don't run anything
    const matchers = [
      { label: "start mic", keywords: ["start mic", "turn on mic", "begin mic", "enable mic"] },
      { label: "stop mic", keywords: ["stop mic", "turn off mic", "pause mic", "disable mic"] },
      { label: "new session", keywords: ["new session", "new report", "new study"] },
      { label: "copy report formatted", keywords: ["copy report as formatted", "copy formatted"] },
      { label: "copy report plain", keywords: ["copy report as plain", "copy plain text"] },
      { label: "copy report", keywords: ["copy report", "copy this report"] },
      { label: "download report", keywords: ["download report", "save report", "export report"] },
    ];

    const matched = matchers.find(m => m.keywords.some(k => normalizedLive.includes(k)));
    setLiveDetectedCommand(matched ? matched.label : null);
  }, [transcript, voiceCommandsEnabled]);

  const value = useMemo(
    () => ({
      copyRef,
      copyActionRef,
      downloadRef,
      downloadActionRef,
      micStartRef,
      micStopRef,
      newSessionRef,
    }),
    []
  );

  return (
    <VoiceCommandContext.Provider value={value}>
      {children}
      <VoiceCommandBar
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        enabled={voiceCommandsEnabled && !isMobileView}
        isMicrophoneAvailable={isMicrophoneAvailable}
        lastMatchedCommand={lastMatchedCommand}
        liveDetectedCommand={liveDetectedCommand}
        listening={listening}
        transcript={transcript}
      />
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommandContext = () => {
  const context = useContext(VoiceCommandContext);

  if (!context) {
    throw new Error("useVoiceCommandContext must be used within VoiceCommandProvider");
  }

  return context;
};

export default VoiceCommandProvider;
