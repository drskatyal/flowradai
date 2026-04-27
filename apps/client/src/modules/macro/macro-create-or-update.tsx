import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/customs/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Macro } from "@/hooks/use-macro";
import Speciality from "@/modules/template/speciality/speciality";
import { MacroFormData } from "./hooks/use-macro-list";
import { useStore } from "@/stores";

interface CreateUpdateMacroDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    macro?: Macro | null;
    isPending?: boolean;
    onCancel?: () => void;
    onSubmit?: (formData: MacroFormData) => void;
}

const formDetails = {
    create: {
        title: "Create New Macro",
        description: "Create a new macro to streamline your workflow",
        actionTitle: "Create Macro",
    },
    update: {
        title: "Edit Macro",
        description: "Make changes to your macro below.",
        actionTitle: "Save Changes",
    },
};

const CreateUpdateMacroDialog: React.FC<CreateUpdateMacroDialogProps> = ({
    open,
    onOpenChange,
    macro,
    onCancel,
    isPending,
    onSubmit,
}) => {
    const user = useStore((state) => state.user);
    const [formData, setFormData] = useState<MacroFormData>({
        name: "",
        description: "",
        isActive: true,
        isPublic: false, // Default isPublic false for client
        specialityId: user?.specialityId || "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const formDetail = macro?._id ? formDetails?.update : formDetails?.create;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit?.(formData);
    };

    useEffect(() => {
        if (macro) {
            setFormData({
                name: macro.name,
                description: macro.description,
                isActive: macro.isActive,
                isPublic: macro.isPublic,
                specialityId: macro.specialityId?._id || "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                isActive: true,
                isPublic: false,
                specialityId: user?.specialityId || "",
            });
        }
    }, [macro, user?.specialityId]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setFormData({
                name: "",
                description: "",
                isActive: true,
                isPublic: false,
                specialityId: user?.specialityId || "",
            });
        }
    }, [open, user?.specialityId]);

    // Validation: Check if all required fields are filled
    const isFormValid =
        formData.name.trim() !== "" &&
        formData.description.trim() !== "";

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            classNames={{ content: "max-w-[90vw] md:max-w-[50vw]" }}
            headerTitle={formDetail?.title}
            headerDescription={formDetail?.description}
            contentProps={{
                onInteractOutside: (e: any) => e.preventDefault(),
            }}
            {...{} as any} // Temporary fix for type mismatch if strictly typed Dialog props differ
        >
            <form onSubmit={handleSubmit}>
                <div className="max-h-[70vh] lg:max-h-[60vh] max-w-[80vw] md:max-w-[50vw] flex flex-col w-full overflow-y-scroll px-1">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter macro name..."
                            required
                        />
                    </div>

                    <div className="space-y-2 mt-4">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter macro description..."
                            className="resize-none min-h-[150px]"
                            required
                        />
                    </div>

                    <div className="my-4">
                        <label className="text-sm font-medium block mb-2">
                            Speciality
                        </label>
                        <Speciality
                            value={formData.specialityId ?? ""}
                            isReadOnly={false}
                            onChange={(value: string) =>
                                setFormData({ ...formData, specialityId: value })
                            }
                        />
                    </div>


                    <div className="space-y-3 mb-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isActive: checked === true,
                                    })
                                }
                            />
                            <label
                                htmlFor="isActive"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isPublic"
                                checked={formData.isPublic}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isPublic: checked === true,
                                    })
                                }
                            />
                            <label
                                htmlFor="isPublic"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Public (Visible to all users)
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex item-center justify-end flex-wrap w-full gap-2 px-2 mt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isPending} isLoading={isPending}>
                        {formDetail?.actionTitle}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

export default CreateUpdateMacroDialog;
