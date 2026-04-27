"use client";
import { Loader2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores";
import { ThreadPrimitive } from "@assistant-ui/react";
import MessageEditor from "./message-editor";
import MyAssistantMessage from "./my-assistant-message";
import MyEditComposer from "./my-edit-composer";
import MyThreadWelcome from "./my-thread-welcome";
import MyUserMessage from "./my-user-message";
import { useTab } from "./hooks";
import SelectTemplate from "@/modules/chat/select-template";
import { useThreadContext } from "@/providers/thread-provider";
import { studyTypes } from "@/constants/chat";
import { StudyTypes } from "@/interfaces";
import { usePrimitiveInput } from "@/modules/chat/hooks";
import { useFindingsEmbedding } from "../hooks";
import { Template } from "@/hooks";

const ThreadMessages = () => (
  <>
    <MyThreadWelcome />
    <ThreadPrimitive.Messages
      components={{
        UserMessage: MyUserMessage,
        EditComposer: MyEditComposer,
        AssistantMessage: MyAssistantMessage,
      }}
    />
  </>
);

const styles = {
  tab: {
    content: "mt-0 w-full",
  },
};

interface ChatProps {
  isMessageLoading?: boolean;
  isDesktopView?: boolean;
}

export const Chat: React.FC<ChatProps> = ({
  isMessageLoading,
  isDesktopView,
}) => {
  const { messages, threadId, thread } = useStore();
  const {
    setSelectedStudyType,
    templatesData,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    setIsCompareModalOpen,
    setPrimitiveInput,
    setLiveTranscript,
  } = useThreadContext();
  const { setEditedTemplate } = usePrimitiveInput(false);
  const { resetTemplate } = useFindingsEmbedding();
  const { activeTab, setActiveTab } = useTab({ messages, threadId });

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
      setPrimitiveInput((prevState) => ({
        ...prevState,
        studyName: template.title,
      }));
      setEditedTemplate(template);
      setIsCompareModalOpen(false);
    } else {
      if (!isTemplateDialogOpen) {
        setSelectedStudyType(studyTypes[StudyTypes.Default]);
        setPrimitiveInput({
          studyName: null,
          findings: null,
        });
        setEditedTemplate(null);
        resetTemplate();
      }
    }
  };

  return isDesktopView ? (
    <Tabs
      key={`${threadId}_${messages?.[0]?.id}`}
      className="mt-0 space-y-0 flex-1"
      value={activeTab} // Controlled value
      onValueChange={(val) => {
        setActiveTab(val as "history" | "current");
        setLiveTranscript("");
      }}
    >
      <ThreadPrimitive.Viewport
        role="log"
        className={`flex flex-col items-center overflow-y-auto scroll-smooth overscroll-contain bg-inherit px-4 w-full lg:h-[calc(100vh-56px)] relative`}
      >
        <div className="sticky top-0 w-full bg-background z-10 flex justify-end py-2">
          <TabsList className="current-tab-btn">
            <TabsTrigger value="history">History</TabsTrigger>

            <TabsTrigger value="current">Current</TabsTrigger>
          </TabsList>
        </div>
        <div className="grid grid-rows-1 grid-cols-1 w-full mt-6 lg:mt-0">
          <TabsContent
            value="history"
            className={cn(styles.tab.content, "flex flex-col items-center")}
          >
            {isMessageLoading ? (
              <div className="lg:flex hidden items-center justify-center w-full h-full">
                <Loader2Icon className="animate-spin" />
              </div>
            ) : (
              <ThreadMessages />
            )}
          </TabsContent>
          <TabsContent value="current" className={styles.tab.content}>
            <MessageEditor />
          </TabsContent>
        </div>
      </ThreadPrimitive.Viewport>
    </Tabs>
  ) : (
    <Tabs
      key={`${threadId}_${messages?.[0]?.id}`}
      className="h-full w-full"
      value={activeTab} // Controlled value
      onValueChange={(val) => setActiveTab(val as "history" | "current")}
    >
      <ThreadPrimitive.Viewport
        role="log"
        className={`h-full w-full grid grid-rows-[auto_1fr] relative`}
      >
        <div className="w-full sticky top-0 bg-background z-50">
          <div className="px-2 mt-1 flex justify-center">
            <SelectTemplate
              isDisabled={thread?.status === "regular"}
              templates={templatesData.templates}
              triggerClassName="2xl:w-1/2 xl:w-1/2 lg:w-4/6 md:w-5/6 sm:max-w-none grid grid-cols-1 gap-2 items-center py-0 min-h-9 "
              onTemplateSelect={handleTemplateSelect}
              listOpen={isTemplateDialogOpen}
              setListOpen={(value) => setIsTemplateDialogOpen(value)}
              isCustom={false}
            />
          </div>
          <div className="flex items-center justify-center py-1">
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>

              <TabsTrigger value="current">Current</TabsTrigger>
            </TabsList>
          </div>
        </div>
        {/* Tab Content Area */}
        <div className="flex-1 relative h-full w-full">
          {/* Scrollable History Tab */}
          <TabsContent
            value="history"
            className={cn(
              styles.tab.content,
              "absolute inset-0 overflow-y-auto px-2 pt-[40px] pb-4"
            )}
          >
            {isMessageLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2Icon className="animate-spin" />
              </div>
            ) : (
              <ThreadMessages />
            )}
          </TabsContent>

          {/* Non-scrollable Current Tab */}
          <TabsContent
            value="current"
            className={cn(styles.tab.content, "inset-0 px-2")}
          >
            <MessageEditor />
          </TabsContent>
        </div>
      </ThreadPrimitive.Viewport>
    </Tabs>
  );
};