import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AIServiceSettings,
  fetchAIServiceSettings,
  updateAIServiceSettings,
  LLMType
} from "./settings-api";
import { useToast } from "@/hooks/use-toast";

import { useUpdatePortkeyConfig } from "@/hooks/use-update-portkey-config";
import { useUpdateRefinePortkeyConfig } from "@/hooks/use-update-refine-portkey-config";
import { useUpdateValidatorPortkeyConfig } from "@/hooks/use-update-validator-portkey-config";

export const useAIServiceSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<AIServiceSettings | null>(null);
  const { mutate: updatePortkeyConfig } = useUpdatePortkeyConfig();
  const { mutate: updateRefinePortkeyConfig } = useUpdateRefinePortkeyConfig();
  const { mutate: updateValidatorPortkeyConfig } = useUpdateValidatorPortkeyConfig();

  // Query to fetch AI service settings
  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ["settings", "ai-service"],
    queryFn: fetchAIServiceSettings,
  });

  // Sync local settings with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Mutation to update AI service settings
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: (newSettings: AIServiceSettings) => {
      return updateAIServiceSettings(newSettings);
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with the new settings
      queryClient.setQueryData(["settings", "ai-service"], updatedSettings);

      // Update Portkey config if necessary
      if (updatedSettings.defaultService) {
        updatePortkeyConfig(updatedSettings.defaultService as LLMType);
      }

      if (updatedSettings.refinement?.defaultService) {
        updateRefinePortkeyConfig(updatedSettings.refinement.defaultService);
      }

      if (updatedSettings.validation?.defaultService) {
        updateValidatorPortkeyConfig(updatedSettings.validation.defaultService);
      }

      toast({
        title: "Settings updated",
        description: "AI service settings have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error updating settings",
        description: "Failed to update AI service settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdateLocalSettings = (path: string, value: any) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings };
    const keys = path.split('.');
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    if (localSettings) {
      updateSettings(localSettings);
    }
  };

  return {
    settings: localSettings,
    isLoading,
    error,
    updateLocalSettings: handleUpdateLocalSettings,
    saveSettings: handleSave,
    isUpdating,
  };
}; 