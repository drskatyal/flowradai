import { serverAxios } from "@/lib/axios";

// Type definition for web search prompt
export interface WebSearchPrompt {
    id: string;
    prompt: string;
    createdAt: string;
    updatedAt: string;
}

// API response wrapper
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Function to fetch the active web search prompt
export const fetchActivePrompt = async (): Promise<WebSearchPrompt> => {
    const response = await serverAxios.get<ApiResponse<WebSearchPrompt>>("/web-search-prompt");
    return response.data.data;
};

// Function to update the web search prompt
export const updatePrompt = async (prompt: string): Promise<WebSearchPrompt> => {
    const response = await serverAxios.put<ApiResponse<WebSearchPrompt>>("/web-search-prompt", {
        prompt,
    });
    return response.data.data;
};


