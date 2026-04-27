import { useDbUser, useEditUser } from "@/hooks";
import { useStore } from "@/stores";
import { useState } from "react";

type Preferences = {
    autoTemplate: boolean;
    actionMode: boolean;
    defaultTranscriptionModel: "v2" | "v1" | "v0";
    isErrorCheck: boolean;
    isReportGuideline: boolean;
    reportEmail: string;
    isTextAutoCorrection: boolean;
    voiceCommandsEnabled: boolean;
};

export const usePreferences = () => {
    const user = useStore((state) => state.user);
    const { refetch } = useDbUser(user?._id ?? '');
    const { editUser, isLoading } = useEditUser(user?._id ?? '');

    const [preferences, setPreferences] = useState<Preferences>({
        autoTemplate: user?.autoTemplate ?? true,
        actionMode: user?.actionMode ?? false,
        defaultTranscriptionModel: user?.defaultTranscriptionModel ?? "v2",
        isErrorCheck: user?.isErrorCheck ?? false,
        isReportGuideline: user?.isReportGuideline ?? false,
        reportEmail: user?.reportEmail ?? "",
        isTextAutoCorrection: user?.isTextAutoCorrection ?? false,
        voiceCommandsEnabled: user?.voiceCommandsEnabled ?? false,
    });

    const handleTranscriptionModelChange = (model: "v2" | "v1" | "v0", val: boolean) => {
        setPreferences((prev) => {
            if (val) {
                return { ...prev, defaultTranscriptionModel: model };
            } else {
                return { ...prev };
            }
        });
    };

    const handleUpdatePreferences = (data: Preferences) => {
        editUser(data);
        setTimeout(() => {
            refetch();
        }, 1000);
    }
    return {
        isLoading,
        preferences,
        setPreferences,
        handleUpdatePreferences,
        handleTranscriptionModelChange,
    }
}
