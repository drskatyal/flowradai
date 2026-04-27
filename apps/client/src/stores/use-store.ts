import { create } from "zustand";
import { DBUser } from "@/hooks";
import { MyMessage } from "@/interfaces";
import { ThreadResponse } from "@/modules/thread/hooks";

export enum CommandType {
  ELABORATE = "ELABORATE",
  STRUCTURED_REPORTING = "STRUCTURED_REPORTING",
  REGULAR = "REGULAR",
}

export type Thread = {
  threadId: string;
  state: "archived" | "regular" | "new" | "deleted";
  title: string;
};

interface StoreState {
  user: DBUser | null;
  setUser: (userUpdate: DBUser | Partial<DBUser> | null) => void;
  isUserLoading: boolean;
  setIsUserLoading: (isUserLoading: boolean) => void;
  threadId: string | null;
  thread: ThreadResponse | null;
  threads: Thread[];
  messages: MyMessage[];
  isRunning: boolean;
  isMessageLoading: boolean;
  messagesError: boolean;

  setThreadId: (id: string | null) => void;
  setThread: (thread: ThreadResponse | null) => void;
  setThreads: (threads: Thread[] | ((prev: Thread[]) => Thread[])) => void;
  addMessage: (message: MyMessage) => void;
  setMessages: (
    messages: MyMessage[] | ((prev: MyMessage[]) => MyMessage[])
  ) => void;
  setIsRunning: (isRunning: boolean) => void;
  setIsMessageLoading: (isMessageLoading: boolean) => void;
  setMessagesError: (messagesError: boolean) => void;
  resetStore: () => void; // Added resetStore function here
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  setUser: (userUpdate) =>
    set((state) => ({
      user:
        userUpdate === null
          ? null
          : state.user
          ? { ...state.user, ...userUpdate }
          : (userUpdate as DBUser),
    })),
  isUserLoading: false,
  setIsUserLoading: (isUserLoading) => set({ isUserLoading }),
  threadId: null,
  threads: [],
  messages: [],
  isRunning: false,
  isMessageLoading: false,
  thread: null,
  messagesError: false,

  setThreadId: (id) => set({ threadId: id }),
  setThread: (thread) => set({ thread }),
  setThreads: (threads) =>
    set((state) => ({
      threads: typeof threads === "function" ? threads(state.threads) : threads,
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsMessageLoading: (isMessageLoading) => set({ isMessageLoading }),
  setMessagesError: (messagesError) => set({ messagesError }),

  // Reset Zustand Store on Logout
  resetStore: () =>
    set({
      user: null,
      isUserLoading: false,
      threadId: null,
      threads: [],
      messages: [],
      isRunning: false,
      isMessageLoading: false,
      thread: null,
      messagesError: false,
    }),
}));
