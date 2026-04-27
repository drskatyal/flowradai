import { useRef, useEffect } from "react";
import { ThreadListPrimitive } from "@assistant-ui/react";
import { ButtonWithTooltip } from "@/components/ui/assistant-ui/thread-list/thread-list";
import { useHotkeys } from "react-hotkeys-hook";
import { EditIcon } from "lucide-react";
import { useThreadContext } from "@/providers/thread-provider";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

const FloatingNewSession = () => {

    const {
        setPrimitiveInput
    } = useThreadContext();
    const { newSessionRef } = useVoiceCommandContext();
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
            setPrimitiveInput({ studyName: "", findings: "" });
        },
        []
    );

    // 🔑 NEW: Listen for Alt+X keyboard shortcut from Electron
    useEffect(() => {
        newSessionRef.current = newReportDesktopRef.current;

        return () => {
            if (newSessionRef.current === newReportDesktopRef.current) {
                newSessionRef.current = null;
            }
        };
    }, [newSessionRef]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const electronApi = (window as Window & {
            electron?: {
                onNewSession?: (callback: () => void) => (() => void) | void;
            };
        }).electron;
        if (!electronApi?.onNewSession) {
            return;
        }

        const unsubscribe = electronApi.onNewSession(() => {
            newReportDesktopRef.current?.click();
            setPrimitiveInput({ studyName: "", findings: "" });
        });

        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [setPrimitiveInput]);

    return (
        <ThreadListPrimitive.New asChild>
            <ButtonWithTooltip
                ref={newReportDesktopRef}
                variant="default"
                size={"sm"}
                tooltip="New Session"
                side="left"
                className="p-2"
                onClick={() => {
                    setPrimitiveInput({ studyName: "", findings: "" });
                }}
            >
                <span>
                    <EditIcon className="size-3" />
                </span>
            </ButtonWithTooltip>
        </ThreadListPrimitive.New>
    )
}

export default FloatingNewSession;
