import { WebSearchPrompt } from "@/modules/web-search-prompt";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Web Search Prompt | Admin Panel",
    description: "Configure the prompt used for web search queries",
};

export default function WebSearchPromptPage() {
    return <WebSearchPrompt />;
}
