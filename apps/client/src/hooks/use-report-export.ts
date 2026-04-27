import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";

export const useReportExport = () =>
  useMutation({
    mutationFn: async (ref: React.RefObject<HTMLElement>) => {
      const body = JSON.stringify({
        element: { innerHTML: ref.current?.innerHTML },
      });
      const response = await serverAxios.post("/report-export", body, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });
      return response;
    },
    onSuccess: async (response) => {
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Report.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to export report",
        variant: "destructive",
      });
    },
  });
