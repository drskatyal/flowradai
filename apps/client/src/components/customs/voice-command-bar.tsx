"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import Draggable from "react-draggable";

interface VoiceCommandBarProps {
  browserSupportsSpeechRecognition: boolean;
  enabled: boolean;
  isMicrophoneAvailable: boolean;
  lastMatchedCommand: string | null;
  liveDetectedCommand: string | null;
  listening: boolean;
  transcript: string;
}

const COMMAND_GROUPS = [
  {
    group: "Microphone",
    color: "text-violet-400",
    dot: "bg-violet-400",
    commands: [
      { say: "Start mic", desc: "Start recording" },
      { say: "Stop mic", desc: "Stop recording" },
      { say: "Turn on mic", desc: "Start recording" },
      { say: "Turn off mic", desc: "Stop recording" },
    ],
  },
  {
    group: "Report",
    color: "text-sky-400",
    dot: "bg-sky-400",
    commands: [
      { say: "Copy report", desc: "Copy using current mode" },
      { say: "Copy report as formatted", desc: "Copy with rich formatting" },
      { say: "Copy report as plain", desc: "Copy as plain text" },
      { say: "Download report", desc: "Export as .docx" },
      { say: "Save report", desc: "Export as .docx" },
    ],
  },
  {
    group: "Session",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    commands: [
      { say: "New report", desc: "Start a new session" },
      { say: "New session", desc: "Start a new session" },
    ],
  },
];

const VoiceCommandBar = ({
  browserSupportsSpeechRecognition,
  enabled,
  isMicrophoneAvailable,
  lastMatchedCommand,
  liveDetectedCommand,
  listening,
  transcript,
}: VoiceCommandBarProps) => {
  const [showCommands, setShowCommands] = useState(false);

  if (!enabled) return null;

  const hasError = !browserSupportsSpeechRecognition || !isMicrophoneAvailable;

  return (
    <Draggable bounds="parent" handle=".drag-handle">
      <div className="fixed right-4 top-4 z-[9999] w-[min(20rem,calc(100vw-2rem))] select-none cursor-default">
        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 60%, #16213e 100%)",
            border: "1px solid rgba(139,92,246,0.25)",
            boxShadow: "0 0 0 1px rgba(139,92,246,0.1), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.08)",
          }}
        >
          {/* Header — drag handle */}
          <div className="drag-handle cursor-grab active:cursor-grabbing px-4 pt-3 pb-2 flex items-center gap-3">
            {/* Animated mic orb */}
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: listening
                    ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: listening
                    ? "0 0 16px rgba(124,58,237,0.6), 0 0 32px rgba(124,58,237,0.2)"
                    : "none",
                }}
              >
                {listening ? (
                  <Mic className="h-4 w-4 text-white" />
                ) : (
                  <MicOff className="h-4 w-4 text-slate-500" />
                )}
              </div>
              {listening && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(124,58,237,0.3)" }}
                />
              )}
            </div>

            {/* Status text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-white tracking-wide truncate">
                  AI Voice Commands
                </span>
              </div>
              <p className="text-[10px] mt-0.5 truncate"
                style={{ color: listening ? "#a78bfa" : "#64748b" }}>
                {listening ? "Listening…" : "Paused — mic not active"}
              </p>
            </div>

            {/* Commands toggle */}
            <button
              onClick={() => setShowCommands((v) => !v)}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: showCommands
                  ? "rgba(139,92,246,0.2)"
                  : "rgba(255,255,255,0.05)",
                color: showCommands ? "#a78bfa" : "#64748b",
                border: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              Commands
              {showCommands ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Filtered Live Command */}
          {liveDetectedCommand && !lastMatchedCommand && (
            <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg flex items-center gap-2"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
              <p className="text-xs font-medium text-violet-300 truncate italic">
                "{liveDetectedCommand}" detected...
              </p>
            </div>
          )}

          {/* Last matched command */}
          {lastMatchedCommand && (
            <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg flex items-center gap-2"
              style={{
                background: "linear-gradient(90deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
                border: "1px solid rgba(16,185,129,0.2)",
              }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <p className="text-xs font-medium text-emerald-300 truncate">
                ✓ "{lastMatchedCommand}" executed
              </p>
            </div>
          )}

          {/* Error states */}
          {hasError && (
            <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg flex items-center gap-2"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <TriangleAlert className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-300">
                {!browserSupportsSpeechRecognition
                  ? "Browser doesn't support speech recognition."
                  : "Microphone access unavailable."}
              </p>
            </div>
          )}

          {/* Waveform bar — only when listening */}
          {listening && (
            <div className="px-4 pb-3 flex items-end gap-[3px] h-6">
              {[3, 5, 8, 5, 10, 6, 4, 9, 5, 7, 4, 6, 8, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${h}px`,
                    background: "linear-gradient(to top, #7c3aed, #a78bfa)",
                    opacity: 0.7,
                    animation: `voiceWave ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}

          {!listening && !transcript && !lastMatchedCommand && !hasError && (
            <div className="pb-3" />
          )}

          {/* Command list — collapsible */}
          {showCommands && (
            <div
              className="border-t mx-0 px-3 pt-3 pb-3 space-y-3 max-h-72 overflow-y-auto"
              style={{ borderColor: "rgba(139,92,246,0.12)" }}
            >
              {COMMAND_GROUPS.map((group) => (
                <div key={group.group}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${group.color}`}>
                      {group.group}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.commands.map((cmd) => (
                      <div
                        key={cmd.say}
                        className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <span
                          className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(139,92,246,0.15)",
                            color: "#c4b5fd",
                            border: "1px solid rgba(139,92,246,0.2)",
                          }}
                        >
                          "{cmd.say}"
                        </span>
                        <span className="text-[10px] text-slate-500 text-right flex-shrink-0">
                          {cmd.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keyframe styles injected inline */}
        <style>{`
          @keyframes voiceWave {
            from { transform: scaleY(0.4); }
            to   { transform: scaleY(1.4); }
          }
        `}</style>
      </div>
    </Draggable>
  );
};

export default VoiceCommandBar;
