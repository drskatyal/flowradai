import { useMutation } from "@tanstack/react-query";
import { serverAxios } from "@/lib/axios";
import { useToast } from "./use-toast";
import { useStore } from "@/stores";

export interface Findings {
    findings: string | null
}

export interface ResponseType {
    embedding: number[];
    matchingTemplates: any[];
    totalMatches: number
}

export const useCreateEmbeddings = () => {
    const { toast } = useToast();
    const user = useStore((state) => state.user);
    const mutation = useMutation<ResponseType, Error, Findings>({
        mutationFn: async (findings): Promise<ResponseType> => {
            const { data } = await serverAxios.post("/embedding/generate", { input: findings.findings, isTemplate: true });

            return data;
        },

        onSuccess: (data) => {
            if (data.matchingTemplates.length) {
                toast({
                    title: "Success",
                    description: `An auto-matched template ${data.matchingTemplates[0]?.template?.title} has been selected. If you prefer a different one, you can manually choose a template from the navbar.`,
                    duration: 10000,
                });
            } else {
                toast({
                    title: "Success",
                    description: "No matching template found. You can manually select one from the navbar if needed.",
                    duration: 10000,
                });
            }
        },

        onError: (error) => {
            toast({
                title: "Error",
                description: "Something went wrong, no template found",
                variant: "destructive",
            });
        }
    })

    return {
        generateEmbeddingVectors: mutation.mutate,
        embedingVectors: mutation.data,
        resetEmbeddings: mutation.reset // new: clears mutation state
    }
}