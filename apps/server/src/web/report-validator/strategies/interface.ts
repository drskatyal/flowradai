export interface IReportValidatorStrategy {
    checkReportErrors(
        report: string,
        findings: string,
        prompt: string,
        userId: string,
        threadId?: string,
    ): Promise<{
        validation: any;
        recommendation: string;
        corrected_report: string;
    }>;
}
