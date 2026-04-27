"use client";

import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { PanelRightOpen } from "lucide-react";
import { FC } from "react";
import ReportLeftPanel from "../chat/report-left-panel";

const ReportValidation: FC = () => {
    const { isSidebar, setIsSidebar } = useSidebar();

    const handleSectionClose = (): void => {
        setIsSidebar(false);
    };

    return (
        <div>
            <div className="flex justify-end p-4">
                {isSidebar && (
                    <Tooltip
                        trigger={
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleSectionClose}
                                className="p-0"
                            >
                                <PanelRightOpen className="!w-6 !h-6" />
                            </Button>
                        }
                    >
                        Close
                    </Tooltip>
                )}
            </div>
            <ReportLeftPanel />
        </div>
    );
};

export default ReportValidation;
