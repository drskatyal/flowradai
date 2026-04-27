import React, { useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";

export enum ProcessingStage {
    IDLE = 0,
    CREATING_ACCOUNT = 1,
    SAVING_SPECIALTY = 2,
    PREPARING_WORKSPACE = 3,
    ALMOST_DONE = 4,
    COMPLETED = 5,
}

interface ProcessingStepsProps {
    currentStage: ProcessingStage;
    onContinue: () => void;
}

const steps = [
    {
        stage: ProcessingStage.CREATING_ACCOUNT,
        label: "Creating your account",
        description: "Completed",
        image: "/onboarding/creating-acount-2.png",
    },
    {
        stage: ProcessingStage.SAVING_SPECIALTY,
        label: "Saving your specialty",
        description: "Completed",
        image: "/onboarding/saving-speciality-2.png",
    },
    {
        stage: ProcessingStage.PREPARING_WORKSPACE,
        label: "Preparing your workspace",
        description: "In Progress...",
        image: "/onboarding/preparing-workspace-2.png",
    },
    {
        stage: ProcessingStage.ALMOST_DONE,
        label: "Almost done",
        description: "Finalizing the setup...",
        image: "/onboarding/almost-done-2.png",
    },
];

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ currentStage, onContinue }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: false, duration: 25 },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    );

    // Sync stage with carousel slide
    useEffect(() => {
        if (emblaApi) {
            // Map stage (1-indexed) to slide index (0-indexed)
            // Stages: 1, 2, 3, 4, 5
            // Slides: 0, 1, 2, 3
            let slideIndex = 0;
            if (currentStage >= ProcessingStage.ALMOST_DONE) {
                slideIndex = 3;
            } else if (currentStage > 0) {
                slideIndex = currentStage - 1;
            }

            emblaApi.scrollTo(slideIndex);
        }
    }, [currentStage, emblaApi]);

    return (
        <div className="w-full bg-white rounded-lg shadow-lg border p-8 md:p-12 relative">
            <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                    {currentStage === ProcessingStage.COMPLETED ? "All Set!" : "Setting up your account"}
                </h1>
                <p className="text-slate-500">
                    {currentStage === ProcessingStage.COMPLETED
                        ? "Your workspace is ready."
                        : "Please hold on for a moment. We're getting everything ready for you."}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-between max-w-4xl mx-auto mb-8">
                {/* Left Side - Stepper */}
                <div className="flex-1 w-full md:max-w-md space-y-8">
                    {steps.map((step, index) => {
                        const isCompleted = currentStage > step.stage;
                        const isCurrent = currentStage === step.stage;
                        const isPending = currentStage < step.stage;

                        return (
                            <div key={index} className="flex items-start gap-4 relative">
                                {/* Vertical Line */}
                                {index !== steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "absolute left-[15px] top-[30px] bottom-[-30px] w-0.5",
                                            isCompleted ? "bg-green-500" : "bg-slate-200"
                                        )}
                                    />
                                )}

                                {/* Icon */}
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300",
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isCurrent
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-100 text-slate-300"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className="w-3 h-3 bg-slate-300 rounded-full" />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="pt-0.5">
                                    <h3
                                        className={cn(
                                            "font-semibold text-base transition-colors duration-300",
                                            isCompleted || isCurrent ? "text-slate-800" : "text-slate-400"
                                        )}
                                    >
                                        {step.label}
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-sm transition-colors duration-300",
                                            isCompleted
                                                ? "text-green-600"
                                                : isCurrent
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                        )}
                                    >
                                        {isCompleted ? "Completed" : isCurrent ? "In Progress..." : ""}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Side - Embla Carousel */}
                <div className="flex-1 w-full md:max-w-md hidden md:flex flex-col justify-center items-center gap-8">
                    <div className="overflow-hidden w-full max-w-[400px]" ref={emblaRef}>
                        <div className="flex">
                            {steps.map((step, idx) => (
                                <div
                                    className="flex-[0_0_100%] min-w-0 relative aspect-square flex items-center justify-center p-4"
                                    key={idx}
                                >
                                    <img
                                        src={step.image}
                                        alt={step.label}
                                        className="w-full h-auto object-contain rounded-xl"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slider dots */}
                    <div className="flex gap-2 justify-center mt-4">
                        {steps.map((_, idx) => {
                            // Determine "active" dot based on current stage logic
                            let activeIndex = 0;
                            if (currentStage >= ProcessingStage.ALMOST_DONE) activeIndex = 3;
                            else if (currentStage > 0) activeIndex = currentStage - 1;

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                        activeIndex === idx ? "bg-black w-6" : "bg-slate-200"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Continue Button Area */}
            {currentStage === ProcessingStage.COMPLETED && (
                <div className="flex justify-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button onClick={onContinue} className="w-full md:w-auto md:min-w-[200px]" size="lg">
                        Continue to Workspace
                    </Button>
                </div>
            )}

            {currentStage !== ProcessingStage.COMPLETED && (
                <div className="mt-12 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                        <p>We're setting things up for you.</p>
                        <p>This will just take a few seconds.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessingSteps;
