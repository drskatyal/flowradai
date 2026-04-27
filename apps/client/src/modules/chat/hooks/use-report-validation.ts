
import { useReportErrorCheck } from "@/hooks/use-report-error-check";

export interface ReportValidationType {
    findings: string;
    report: string;
}

export const useReportValidation = ({ findings, report }: ReportValidationType) => {
    const { handleErrorCheck, reportErrors, isLoading } = useReportErrorCheck();

    const checkReportErrors = ({ findings, report }: ReportValidationType) => {
        handleErrorCheck({ report, findings });
    }

    return {
        checkReportErrors,
        reportErrors,
        isLoading
    }
}