import { removeQuotedText } from "@/helper/remove-qoutes";
import { MyMessage } from "@/interfaces";
import { ThreadMessageLike } from "@assistant-ui/react";

export const convertMessage = (message: MyMessage): ThreadMessageLike => ({
  role: message.role,
  content: [{ type: "text", text: message.content }],
  id: message?.id,
});

export const transformMessages = (messages: any[]): MyMessage[] => {
  if (!messages || !Array.isArray(messages)) return [];

  return messages.map((message) => ({
    role: message?.role,
    content: removeQuotedText(message?.content),
    id: message?.id,
    isApplyChange: message?.isApplyChange
  }));
};
