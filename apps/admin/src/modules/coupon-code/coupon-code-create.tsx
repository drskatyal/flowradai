import { useEffect, useState } from "react";
import { Dialog, DialogProps } from "@/components/customs/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserSelector } from "@/components/customs/user-selector";
import { CouponCodeFormData } from "./hooks/use-coupon-code-list";
import { CouponCode } from "@/hooks/use-coupon-code";
import { serverAxios } from "@/lib/axios";
import { Sparkles } from "lucide-react";

export interface CreateCouponCodeSubmitArgs {
    formData: CouponCodeFormData;
    event: React.FormEvent;
}

interface CreateCouponCodeDialogProps extends DialogProps {
    onSuccess?: () => void;
    coupon?: CouponCode | null;
    isPending?: boolean;
    onCancel?: () => void;
    onSubmit?: (formData: CouponCodeFormData & { id?: string }) => void;
}

const CreateCouponCodeDialog: React.FC<CreateCouponCodeDialogProps> = ({
    onSuccess,
    coupon,
    onCancel,
    isPending,
    onSubmit,
    ...props
}) => {
    const [formData, setFormData] = useState<CouponCodeFormData>({
        code: "",
        name: "",
        days: 30,
        allowedUsers: [],
        allowToAllUsers: false,
        isActive: true,
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        try {
            const response = await serverAxios.get("/coupon-code/generateCouponCode");
            setFormData((prev) => ({ ...prev, code: response.data.code }));
        } catch (error) {
            console.error("Failed to generate code", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const submitData = coupon ? { ...formData, id: coupon._id } : formData;
        onSubmit?.(submitData);
    };

    // Load coupon data when editing
    useEffect(() => {
        if (coupon) {
            // Extract user IDs from populated allowedUsers
            const allowedUserIds = coupon.allowedUsers.map(user => user._id);

            setFormData({
                code: coupon.code,
                name: coupon.name || "",
                days: coupon.days,
                allowedUsers: allowedUserIds,
                allowToAllUsers: coupon.allowToAllUsers || false,
                isActive: coupon.isActive,
            });
        } else {
            setFormData({
                code: "",
                name: "",
                days: 30,
                allowedUsers: [],
                allowToAllUsers: false,
                isActive: true,
            });
        }
    }, [coupon]);

    // Reset form when modal closes
    useEffect(() => {
        if (!props.open) {
            setFormData({
                code: "",
                name: "",
                days: 30,
                allowedUsers: [],
                allowToAllUsers: false,
                isActive: true,
            });
        }
    }, [props.open]);

    // Validation: Check if all required fields are filled
    const isFormValid = formData.code.trim() !== "" && formData.code.length === 8;

    const isEditMode = !!coupon;
    const dialogTitle = isEditMode
        ? "Edit Coupon Code"
        : "Create New Coupon Code";
    const dialogDescription = isEditMode
        ? "Update coupon code details and add more users"
        : "Create a new coupon code for discounts";
    const submitButtonText = isEditMode
        ? "Update Coupon Code"
        : "Create Coupon Code";

    return (
        <Dialog
            classNames={{ content: "max-w-[90vw] md:max-w-[50vw]" }}
            headerTitle={dialogTitle}
            headerDescription={dialogDescription}
            contentProps={{
                onInteractOutside: (e) => e.preventDefault(),
            }}
            {...props}
        >
            <form onSubmit={handleSubmit}>
                <div className="max-h-[70vh] lg:max-h-[60vh] max-w-[80vw] md:max-w-[50vw] flex flex-col w-full overflow-y-scroll px-1">
                    <div className="space-y-2">
                        <label htmlFor="code" className="text-sm font-medium">
                            Coupon Code <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="Enter 8-character code..."
                                    className="uppercase"
                                    maxLength={8}
                                    disabled={isEditMode}
                                    required
                                />
                            </div>
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGenerateCode}
                                    disabled={isGenerating}
                                    className="whitespace-nowrap"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {isGenerating ? "Generating..." : "Generate"}
                                </Button>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                                {isEditMode
                                    ? "Code cannot be changed after creation"
                                    : "Code must be exactly 8 characters (letters and numbers only)"}
                            </p>
                            {!isEditMode && (
                                <p
                                    className={`text-xs font-medium ${formData.code.length === 8
                                            ? "text-green-600"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {formData.code.length}/8
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <label htmlFor="name" className="text-sm font-medium">
                            Name (Optional)
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter coupon name..."
                        />
                    </div>

                    <div className="space-y-2 mt-4">
                        <label htmlFor="days" className="text-sm font-medium">
                            Validity Period <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.days.toString()}
                            onValueChange={(value) =>
                                setFormData({ ...formData, days: parseInt(value) })
                            }
                            disabled={isEditMode}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="60">60 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            {isEditMode
                                ? "Validity period cannot be changed after creation"
                                : "Coupon will be valid for the selected number of days"}
                        </p>
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="allowToAllUsers"
                                    className="text-sm font-medium leading-none"
                                >
                                    Allow to All Users
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.allowToAllUsers
                                        ? "This coupon code will be valid for all users"
                                        : "Only selected users can use this coupon code"}
                                </p>
                            </div>
                            <Switch
                                id="allowToAllUsers"
                                checked={formData.allowToAllUsers}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        allowToAllUsers: checked,
                                        allowedUsers: checked ? [] : formData.allowedUsers,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {!formData.allowToAllUsers && (
                        <div className="space-y-2 mt-4">
                            <label htmlFor="allowedUsers" className="text-sm font-medium">
                                Allowed Users
                            </label>
                            <UserSelector
                                value={
                                    Array.isArray(formData.allowedUsers)
                                        ? formData.allowedUsers
                                        : []
                                }
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        allowedUsers: Array.isArray(value) ? value : [],
                                    }))
                                }
                                allowMultiple={true}
                                lockedUsers={
                                    isEditMode && Array.isArray(coupon?.allowedUsers)
                                        ? coupon.allowedUsers.map(user => typeof user === 'string' ? user : user._id)
                                        : []
                                }
                            />
                            <p className="text-xs text-gray-500">
                                {isEditMode
                                    ? "You can add new users but cannot remove existing ones"
                                    : "Select users who can use this coupon code"}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 mb-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="isActive"
                                    className="text-sm font-medium leading-none"
                                >
                                    Activate Coupon Code
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.isActive
                                        ? "Coupon code will be active and usable immediately"
                                        : "Coupon code will be created but not active"}
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isActive: checked,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="flex item-center justify-end flex-wrap w-full gap-2 px-2 mt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isFormValid || isPending}
                        isLoading={isPending}
                    >
                        {submitButtonText}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
};

export default CreateCouponCodeDialog;