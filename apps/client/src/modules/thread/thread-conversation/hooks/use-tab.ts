import { MyMessage } from "@/interfaces";
import { useEffect, useState } from "react";

interface UseTab {
    messages: MyMessage[];
    threadId: string | null;
}

export const useTab = ({ messages, threadId }: UseTab) => {
    const [activeTab, setActiveTab] = useState<"history" | "current">("current");

    useEffect(() => {
        if (messages.length > 1) {
            setActiveTab("current");
        }
    }, [messages.length]);

    return {
        activeTab,
        setActiveTab,
    };
};