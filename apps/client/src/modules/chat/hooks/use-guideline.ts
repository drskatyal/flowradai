
import { useReportGuideline } from "@/hooks";

export interface ReportGuidelineType {
    findings: string;
}

export const useGuideline = ({ findings }: ReportGuidelineType) => {
    const { handleGuideline, streamGuideline, isStreamComplete ,isLoading } = useReportGuideline();
    const checkReportGuideline = ({ findings }: ReportGuidelineType) => {
        handleGuideline({ findings });
    }

    return {
        checkReportGuideline,
        streamGuideline,
        isStreamComplete,
        isGuidelieLoading: isLoading
    }
}