import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { serverAxios } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "./rich-text-editor";

interface ShareEmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMessage: string;
    defaultHtmlMessage: string;
    userEmail: string;
    userReportEmail: string;
}

const ShareEmailDialog: React.FC<ShareEmailDialogProps> = ({
    isOpen,
    onClose,
    defaultMessage,
    defaultHtmlMessage,
    userEmail,
    userReportEmail,
}) => {
    const [toEmail, setToEmail] = useState(userReportEmail);
    const [message, setMessage] = useState(defaultMessage);
    const [subject, setSubject] = useState("");
    const [htmlMessage, setHtmlMessage] = useState(defaultHtmlMessage);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setMessage(defaultMessage);
            setHtmlMessage(defaultHtmlMessage);
        }
    }, [isOpen, defaultMessage, defaultHtmlMessage]);

    const handleSend = async () => {
        if (!toEmail || !htmlMessage) return;

        setIsLoading(true);
        try {
            await serverAxios.post("/share/email", {
                fromEmail: userEmail,
                toEmail,
                subject,
                message: htmlMessage,
            });
            toast({
                title: "Email sent",
                description: "Your message has been shared successfully.",
            });
            onClose();
            setToEmail("");
        } catch (error) {
            console.error("Failed to send email:", error);
            toast({
                title: "Error",
                description: "Failed to send email. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-w-[90vw] w-full max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle>Share via Email</DialogTitle>
                </DialogHeader>
                <div className="gap-4 py-4 px-1 overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor="from" className="text-right">
                            From
                        </Label>
                        <Input
                            id="from"
                            value={userEmail}
                            disabled
                            className="col-span-3"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="to" className="text-right">
                            To
                        </Label>
                        <Input
                            id="to"
                            value={toEmail}
                            onChange={(e) => setToEmail(e.target.value)}
                            placeholder="recipient@example.com"
                            className="col-span-3"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-right">
                            Subject
                        </Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brain MRI.."
                            className="col-span-3"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-right pt-2">
                            Message
                        </Label>
                        <div className="col-span-3">
                            <RichTextEditor
                                value={message}
                                onChange={({ markdownText, editor }) => {
                                    setMessage(markdownText);
                                    setHtmlMessage(editor.getHTML());
                                }}
                                classNames={{
                                    editorContainer: "!h-[200px] sm:!h-[300px]",
                                }}
                                requireToolbar={true}
                                allowShare={false}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-auto sm:mt-0">
                    <Button onClick={handleSend} disabled={isLoading || !toEmail || !htmlMessage || !subject} className="w-full sm:w-auto">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShareEmailDialog;
