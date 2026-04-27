"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportGuidelineProps {
  guidelineEnabled?: boolean;
  isLoading?: boolean;
  streamGuideline: any;
  isStreamComplete: boolean;
  onToggleGuideline?: (enabled: boolean) => void;
  preferenceGuidelineEnable: boolean;
}

const ReportGuideline = ({
  guidelineEnabled = false,
  isLoading = false,
  streamGuideline,
  isStreamComplete,
  onToggleGuideline,
  preferenceGuidelineEnable
}: ReportGuidelineProps) => {
  // Auto-scroll when streaming guideline changes
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamGuideline]);
  return (
    <div ref={scrollRef} className="flex flex-col border rounded-xl shadow-sm bg-white h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky bg-white top-0 z-10">
        <Button
          className="bg-black text-white hover:bg-gray-800 px-4 py-1 text-sm"
          onClick={() => onToggleGuideline?.(true)}
          size="sm"
          disabled={preferenceGuidelineEnable}
        >
          Fetch Guideline
        </Button>
      </div>
      <div className="p-2 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 flex-1 shadow-sm h-full">
            <Loader2 className="w-5 h-5 text-black animate-spin" />
            <p className="text-black text-sm font-medium">
              Guideline your report...
            </p>
          </div>
        ) : (!guidelineEnabled && !preferenceGuidelineEnable && !streamGuideline) ? (
          <div className="items-center text-gray-400 italic">
            Guideline checking is currently disabled. You can enable it in <strong>Preferences</strong> to get guideline suggestions OR fetch manually.
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ node, ...props }) => <h2 className="mt-6 mb-3 text-lg font-semibold" {...props} />,
              h3: ({ node, ...props }) => <h3 className="mt-4 mb-2 text-md font-medium" {...props} />,
              p: ({ node, ...props }) => <p className="mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-4" {...props} />,
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800" />
              ),
            }}
          >
            {streamGuideline}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ReportGuideline;
