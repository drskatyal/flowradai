import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type LoadingStatus = "analysing" | "processing" | "generating" | null;

const RichTextLoader = ({ classNames, isLoading, value, loadingStatus }: any) => {
    const [currentStep, setCurrentStep] = useState<LoadingStatus>("analysing");

    // Auto-progress through steps when loading and no specific status is provided
    useEffect(() => {
        if ((isLoading || !value) && !loadingStatus) {
            const steps: LoadingStatus[] = ["analysing", "processing", "generating"];
            let stepIndex = 0;

            const interval = setInterval(() => {
                setCurrentStep(steps[stepIndex]);
                stepIndex = (stepIndex + 1) % steps.length;
            }, 2000); // Change step every 2 seconds

            return () => clearInterval(interval);
        } else if (loadingStatus) {
            setCurrentStep(loadingStatus);
        }
    }, [isLoading, value, loadingStatus]);

    const getLoadingMessage = () => {
        switch (currentStep) {
            case "analysing":
                return "Analysing input";
            case "processing":
                return "Processing findings";
            case "generating":
                return "Generating report";
            default:
                return "Analysing input";
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center flex-1 p-4",
                classNames?.loaderContainer
            )}
        >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-2 transition-all duration-500 ease-in-out">
                    {getLoadingMessage()}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500 ease-in-out",
                            currentStep === "analysing" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                        )}></div>
                        <span className={cn(
                            "transition-all duration-500 ease-in-out",
                            currentStep === "analysing" ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                            Analysing input
                        </span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center space-x-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500 ease-in-out",
                            currentStep === "processing" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                        )}></div>
                        <span className={cn(
                            "transition-all duration-500 ease-in-out",
                            currentStep === "processing" ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                            Processing findings
                        </span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center space-x-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500 ease-in-out",
                            currentStep === "generating" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                        )}></div>
                        <span className={cn(
                            "transition-all duration-500 ease-in-out",
                            currentStep === "generating" ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                            Generating report
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RichTextLoader;