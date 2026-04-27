import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStore } from "@/stores/use-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEqual } from "lodash";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEditThread } from "../thread/hooks/use-edit-thread";
import { reportSchema } from "./schema";

const ReportIdForm = () => {
  const threadId = useStore((state) => state?.threadId) || "";
  const thread = useStore((state) => state.thread);
  const threadName = useStore((state) => state.thread?.name) || "";
  const setThread = useStore((state) => state.setThread);
  const threads = useStore((state) => state.threads);
  const setThreads = useStore((state) => state.setThreads);

  const handleEditSuccess = (data: { name: string }) => {
    if (!thread) return;

    setThread({ ...thread, name: data.name });
    setThreads(
      threads.map((thread) =>
        thread.threadId === threadId ? { ...thread, title: data.name } : thread
      )
    );
  };

  const { editThread, isLoading } = useEditThread(threadId, handleEditSuccess);

  const defaultValues = {
    reportId: threadName,
  };

  useEffect(() => {
    if (!isEqual(form?.formState?.defaultValues, defaultValues))
      form.reset(defaultValues);
  }, [defaultValues]);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof reportSchema>) => {
    editThread({ name: data?.reportId });
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-1 p-4 xl:p-6"
      >
        <FormField
          control={form.control}
          name="reportId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Report ID"
                    disabled={isLoading || !threadId}
                    {...field}
                  />
                  <Button
                    variant="ghost"
                    className="px-1"
                    disabled={isLoading || !threadId}
                  >
                    <Save height={20} width={20} />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ReportIdForm;
