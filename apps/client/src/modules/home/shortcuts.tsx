import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { shortcutKeys } from "@/constants";
import { BookOpen } from "lucide-react";
import { FC } from "react";
import InstructionsList from "./instructions-list";
import { useDesktopView } from "@/hooks";

interface InstructionsProps {
    variant?: "sidebar" | "navbar";
}

const Shortcuts: FC<InstructionsProps> = ({ variant = "navbar" }) => {
    const { isDesktopView } = useDesktopView();
    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    {variant === "navbar" ? (
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="w-full xs:w-fit">
                                    Shortcuts
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                    ) : (
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm space-x-2 hover:bg-surface-primary p-0 font-normal h-fit gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Shortcuts
                            </Button>
                        </DialogTrigger>
                    )}
                    <TooltipContent side="right">
                        <p>Shortcuts to use this app</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent
                className="max-w-[90%] md:max-w-xl max-h-[80vh] flex flex-col p-0"
                onCloseAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader className="text-left p-6 bg-background border-b rounded">
                    <DialogTitle className="text-primary">
                        Shortcuts for Using Flowrad.AI
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 md:px-6">
                    <DialogDescription className="space-y-2">
                        <InstructionsList data={shortcutKeys} />
                    </DialogDescription>
                </div>

                <DialogFooter className="p-6 bg-background border-t rounded">
                    <DialogClose asChild>
                        <Button>Get Started</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Shortcuts;
