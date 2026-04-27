import { Request, Response } from "express";
import WebSearchService from "./web-search-service";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import WebSearchModel from "./web-search-model";
import UserModel from "../user/user-model";
import { Document } from "flexsearch";

const webSearchService = new WebSearchService();

class WebSearchController {
    /** Resolve internal userId from session claims or DB fallback */
    private resolveUserId = async (req: Request): Promise<string | null> => {
        const authenticatedReq = req as unknown as AuthenticatedRequest;
        const authData = authenticatedReq.auth();
        let internalUserId = authData.sessionClaims?.internalId as
            | string
            | undefined;
        const clerkId = authData.userId;

        if (!internalUserId && clerkId) {
            const user = await UserModel.findOne({ clerkId });
            if (user) internalUserId = user.id;
        }
        return internalUserId || null;
    };

    getWebSearches = async (req: Request, res: Response) => {
        try {
            const userId = await this.resolveUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }

            const searches = await WebSearchModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50);

            return res.status(200).json({ success: true, data: searches });
        } catch (error) {
            logger.error("Error fetching web searches:", error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    };

    webSearch = async (req: Request, res: Response) => {
        try {
            const { query } = req.body;
            const userId = await this.resolveUserId(req);

            if (!query) {
                return res
                    .status(400)
                    .json({ success: false, message: "Query is required" });
            }

            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }

            // Fetch all searches for context
            const historyItems = await WebSearchModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const index = new Document({
                tokenize: "full",
                document: {
                    id: "id",
                    index: ["outputText", "inputText"],
                    store: true,
                },
            });

            // Index all historical output text
            historyItems.forEach((item, i) => {
                index.add({
                    id: i,
                    inputText: item.inputText,
                    outputText: item.outputText,
                });
            });

            // Perform the search according to the user's current input, by splitting into valid parts
            const queryParts = query
                .split(/\s+/)
                .filter((part: string) => part.length > 2);
            let searchResults: any[] = [];

            queryParts.forEach((part: string) => {
                const res = index.search(part, 5);
                if (res && res.length > 0) {
                    searchResults.push(...res);
                }
            });

            // Fallback if no parts found
            if (searchResults.length === 0) {
                searchResults = index.search(query, 5);
            }

            let contextHistory: { outputText: string }[] = [];

            // Only send the meaningful parts/documents
            if (searchResults.length > 0) {
                // Collect all matched IDs across all indexed fields (inputText, outputText)
                const matchedIdsSet = new Set<number>();
                searchResults.forEach((fieldResult: any) => {
                    fieldResult.result.forEach((resId: number) =>
                        matchedIdsSet.add(resId)
                    );
                });

                const matchedIds = Array.from(matchedIdsSet).sort((a, b) => a - b);

                const extractSnippet = (text: string, searchTerm: string) => {
                    if (!text) return "";
                    const paragraphs = text
                        .split(/\n+/)
                        .map((p) => p.trim())
                        .filter((p) => p.length > 0);
                    const terms = searchTerm
                        .toLowerCase()
                        .split(/\s+/)
                        .filter((t) => t.length > 2);

                    if (terms.length === 0) {
                        return paragraphs[0] || "";
                    }

                    const matchedParagraphs = paragraphs.filter((p) => {
                        const lowerP = p.toLowerCase();
                        return terms.some((term) => lowerP.includes(term));
                    });

                    if (matchedParagraphs.length > 0) {
                        return matchedParagraphs.join("\n\n");
                    }

                    return paragraphs[0] || "";
                };

                contextHistory = matchedIds.map((id) => {
                    const item = historyItems[id];
                    return {
                        outputText: extractSnippet(item.outputText, query),
                    };
                });
            }

            // Set headers for streaming
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            const stream = await webSearchService.webSearch(query, contextHistory);
            let fullResult = "";

            for await (const chunk of stream) {
                fullResult += chunk;
                res.write(chunk);
            }

            if (!fullResult.trim()) {
                fullResult = "No result generated.";
                res.write(fullResult);
            }

            // Save the search result to the database
            try {
                await WebSearchModel.create({
                    userId,
                    inputText: query,
                    outputText: fullResult,
                });
            } catch (dbError) {
                logger.error("Error saving web search result to database:", dbError);
            }

            res.end();
        } catch (error) {
            logger.error("Error in web search controller:", error);
            if (!res.headersSent) {
                return res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            } else {
                res.end();
            }
        }
    };

    deleteWebSearch = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = await this.resolveUserId(req);

            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }

            const result = await WebSearchModel.findOneAndDelete({ _id: id, userId });
            if (!result) {
                return res
                    .status(404)
                    .json({ success: false, message: "Search not found" });
            }

            return res.status(200).json({ success: true, message: "Search deleted" });
        } catch (error) {
            logger.error("Error deleting web search:", error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    };
}

export default new WebSearchController();