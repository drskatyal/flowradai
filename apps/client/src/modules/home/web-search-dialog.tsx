import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import { useDesktopView } from "@/hooks";
import { BotMessageSquare, Search } from "lucide-react";
import { FC } from "react";
import { WebAssist } from "../web-search";

interface WebSearchDialogProps {
    variant?: "sidebar" | "navbar";
}

const WebSearchDialog: FC<WebSearchDialogProps> = ({ variant = "navbar" }) => {
    const { isDesktopView } = useDesktopView();

    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    {variant === "navbar" ? (
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant={isDesktopView ? "secondary" : "outline"}>
                                    {isDesktopView ? "Web Assist" : <BotMessageSquare />}
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                    ) : (
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm space-x-2 hover:bg-surface-primary p-0 font-normal h-fit gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Web Assist
                            </Button>
                        </DialogTrigger>
                    )}
                    {!isDesktopView && (
                        <TooltipContent side="right">
                            <p>Web Search and Assist</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            <DialogContent
                className="max-w-[85vw] w-[85vw] h-[90vh] flex flex-col p-0"
                onCloseAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader className="text-left p-6 bg-background border-b rounded">
                    <DialogTitle className="text-primary flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Web Assist
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <WebAssist />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WebSearchDialog;