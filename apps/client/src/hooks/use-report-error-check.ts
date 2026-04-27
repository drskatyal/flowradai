import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";

interface ReportValidationInput {
  report: string;
  findings: string;
}

export const useReportErrorCheck = () => {
  const mutation = useMutation({
    mutationFn: async ({ report, findings }: ReportValidationInput) => {
      const { data } = await serverAxios.post("/report/validate", {
        report,
        findings,
      });
      return data;
    },

    onSuccess(data) {
      toast({
        title: "Validation Successful",
        description: "The report was validated successfully.",
        variant: "default",
      });
    },

    onError(error: any) {
      console.error("Validation failed:", error);
      toast({
        title: "Validation Failed",
        description:
          error?.response?.data?.message || "Something went wrong during validation.",
        variant: "destructive",
      });
    },
  });

  return {
    handleErrorCheck: mutation.mutate,
    error: mutation.error,
    reportErrors: mutation.data,
    isLoading: mutation.isPending,
  };
};
