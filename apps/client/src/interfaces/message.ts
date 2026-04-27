export interface ContentText {
  type: "text";
  text: {
    value: string;
    annotations: any[]; // TODO: Adjust type if specifics for annotations
  };
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  object: "thread.message";
  created_at: number;
  assistant_id: string | null;
  thread_id: string;
  run_id: string | null;
  role: MessageRole;
  content: ContentText[];
  attachments: any[]; // TODO: Adjust type
  metadata: Record<string, any>; // TODO: Adjust type when metadata structure is known
}

export interface MyMessage {
  role: MessageRole;
  content: string;
  id?: string;
  isApplyChange?: boolean;
}

export interface AddMessage {
  role: MessageRole;
  content: string;
}
