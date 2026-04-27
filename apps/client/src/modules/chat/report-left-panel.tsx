"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ErrorChecker from "./left-panel-tabs/error-checker";
import ReportGuideline from "./left-panel-tabs/report-guideline";
import useAnalysis from "./hooks/use-analysis";

export default function ReportLeftPanel() {
  const {
    tabValue,
    setTabValue,
    errorEnabled,
    setErrorEnabled,
    guidelineEnabled,
    setGuidelineEnabled,
    reportErrors,
    handleApplyChanges,
    isLoading,
    guidelineLoading,
    streamGuideline,
    isStreamComplete,
    preferenceGuidelineEnable
  } = useAnalysis();

  return (
    <div className="w-full px-1 bg-white">
      <Tabs value={tabValue} onValueChange={(val) => setTabValue(val as "error" | "guideline")}>
        <TabsList className="block xl:flex">
          <TabsTrigger value="error" className="w-full">
            Validation
          </TabsTrigger>
          <TabsTrigger value="guideline" className="w-full">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="error" className="space-y-3 mt-8 xl:mt-3">
          <ErrorChecker
            errorEnabled={errorEnabled ?? false}
            reportErrors={reportErrors}
            handleApplyChanges={handleApplyChanges}
            onToggleError={setErrorEnabled}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="guideline" className="space-y-3 mt-8 xl:mt-3">
          <ReportGuideline
            guidelineEnabled={guidelineEnabled ?? false}
            streamGuideline={streamGuideline}
            isStreamComplete={isStreamComplete}
            onToggleGuideline={setGuidelineEnabled}
            isLoading={guidelineLoading}
            preferenceGuidelineEnable={preferenceGuidelineEnable ?? false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
