"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/stores";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ValidationCoverage {
  finding: string | { text: string; location?: string };
  tick: string;
  covered: boolean;
  notes: string | { text: string; location?: string };
}

interface ReportValidation {
  coverage: ValidationCoverage[];
  numeric_laterality_check: {
    numbers_match: boolean;
    laterality_match: boolean;
    issues: string[] | Array<{ text: string; location?: string }>;
  };
  new_additions_positive_only: Array<string | { text: string; location?: string }>;
}

interface ErrorCheckerProps {
  errorEnabled: boolean;
  isLoading: boolean;
  reportErrors?: {
    success?: boolean;
    validation?: ReportValidation;
    recommendation?: string | { text: string; location?: string };
    corrected_report?: string;
  };
  handleApplyChanges: () => void;
  onToggleError?: (enabled: boolean) => void;
}

// Helper function to safely render text or object
const renderText = (value: string | { text: string; location?: string } | undefined): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "text" in value) return value.text;
  return String(value);
};

const ErrorChecker = ({
  errorEnabled,
  isLoading,
  reportErrors,
  handleApplyChanges,
  onToggleError,
}: ErrorCheckerProps) => {
  const { addMessage, messages } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const disableApply =
    !reportErrors?.validation ||
    !Array.isArray(reportErrors.validation.coverage) ||
    reportErrors.validation.coverage.length === 0 ||
    messages.length > 2;

  // Safe accessors with default values
  const coverage = Array.isArray(reportErrors?.validation?.coverage)
    ? reportErrors.validation.coverage
    : [];
  
  const numericCheck = reportErrors?.validation?.numeric_laterality_check ?? {
    numbers_match: false,
    laterality_match: false,
    issues: [],
  };
  
  const newAdditions = Array.isArray(reportErrors?.validation?.new_additions_positive_only)
    ? reportErrors.validation.new_additions_positive_only
    : [];

  return (
    <div className="shadow-lg rounded-xl border border-gray-200 h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky top-0 z-10">
        <Button
          className="bg-black text-white hover:bg-gray-800 px-4 py-1 text-sm"
          onClick={() => setIsDialogOpen(true)}
          size="sm"
          disabled={disableApply}
        >
          Apply Changes
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-3 gap-2">
          <DialogHeader>
            <DialogTitle>Confirm Apply Changes</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mt-2">
            Are you sure you want to apply these changes?.
          </p>
          <DialogFooter className="flex justify-end gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className=""
              onClick={() => {
                handleApplyChanges();
                setIsDialogOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="flex-1 min-h-0 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 flex-1 bg-red-50 border border-red-200 rounded-lg shadow-sm h-full">
            <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
            <p className="text-red-700 text-sm font-medium">
              Validating your report...
            </p>
          </div>
        ) : !errorEnabled ? (
          <div className="items-center text-gray-400 italic">
             Error checking is currently disabled. You can enable it in <strong>Preferences</strong> to start receiving suggestions.
          </div>
        ) : !reportErrors?.success ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No errors found in the report.
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3 overflow-y-auto">
            {/* Coverage Section */}
            {coverage.length > 0 && (
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <p className="font-semibold mb-2">Coverage Validation</p>
                <div className="space-y-2">
                  {coverage.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between border-b last:border-0 pb-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{renderText(item.finding)}</p>
                        <p className="text-xs text-gray-500">{renderText(item.notes)}</p>
                      </div>
                      <Badge
                        className={
                          item.covered
                            ? "bg-green-100 text-green-700 hover:text-green-700"
                            : "bg-red-100 text-red-700 hover:text-red-700"
                        }
                      >
                        {item.tick}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Numeric & Laterality Section */}
            <div className="p-3 bg-white border rounded-lg shadow-sm">
              <p className="font-semibold mb-2">Numeric & Laterality Check</p>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`flex items-center gap-1 ${
                    numericCheck.numbers_match
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {numericCheck.numbers_match ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Numbers Match
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    numericCheck.laterality_match
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {numericCheck.laterality_match ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Laterality Match
                </span>
              </div>
              {Array.isArray(numericCheck.issues) && numericCheck.issues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-600 mb-1">Issues:</p>
                  <ul className="list-disc list-inside text-xs text-red-600">
                    {numericCheck.issues.map((issue, idx) => (
                      <li key={idx}>{renderText(issue)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* New Additions Section */}
            <div className="p-3 bg-white border rounded-lg shadow-sm">
              <p className="font-semibold mb-2">New Additions</p>
              {newAdditions.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {newAdditions.map((item, idx) => (
                    <li key={idx}>{renderText(item)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No new positive additions found.
                </p>
              )}
            </div>

            {/* Correction Panel */}
            {reportErrors.recommendation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                <p className="font-semibold text-blue-700 mb-1">Recommendation</p>
                <p className="whitespace-pre-line text-sm">
                  {renderText(reportErrors.recommendation)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorChecker;