"use client";
import { useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { PricingPlan, PricingPlanInput } from "@/hooks/use-pricing-plans";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { serverAxios } from "@/lib/axios";

const planSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
    subscriptionType: z.enum(["regular", "monthly", "yearly"]),
    threadsQuantity: z.coerce.number().min(0, "Must be 0 or more (0 = unlimited)"),
    usdPrice: z.coerce.number().min(0, "Must be 0 or more"),
    inrPrice: z.coerce.number().min(0, "Must be 0 or more"),
    gstPercent: z.coerce.number().min(0).max(100),
    features: z
        .array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
        .min(1, "Add at least one feature"),
    highlighted: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().min(0),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
    initial?: PricingPlan;
    onSubmit: (data: PricingPlanInput) => void;
    isLoading: boolean;
    onCancel: () => void;
    onSetSlugError?: (fn: (msg: string) => void) => void;
}

const toFormValues = (plan?: PricingPlan): PlanFormValues => ({
    name: plan?.name ?? "",
    slug: plan?.slug ?? "",
    subscriptionType: plan?.subscriptionType ?? "regular",
    threadsQuantity: plan?.threadsQuantity ?? 50,
    usdPrice: plan?.usdPrice ?? 0,
    inrPrice: plan?.inrPrice ?? 0,
    gstPercent: plan?.gstPercent ?? 18,
    features: (plan?.features?.length ? plan.features : [""]).map((v) => ({ value: v })),
    highlighted: plan?.highlighted ?? false,
    isActive: plan?.isActive ?? true,
    sortOrder: plan?.sortOrder ?? 0,
});

export const PlanForm = ({ initial, onSubmit, isLoading, onCancel, onSetSlugError }: PlanFormProps) => {
    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: toFormValues(initial),
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "features",
    });

    // Reset form when switching between create/edit
    useEffect(() => {
        form.reset(toFormValues(initial));
    }, [initial]);

    // Expose setError for slug to parent so server errors can be surfaced
    useEffect(() => {
        onSetSlugError?.((msg: string) => {
            form.setError("slug", { type: "manual", message: msg });
        });
    }, [onSetSlugError]);

    // Debounce ref for slug check
    const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const checkSlugAvailability = (slug: string) => {
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;

        if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);

        slugDebounceRef.current = setTimeout(async () => {
            try {
                const params: Record<string, string> = { slug };
                // When editing, exclude the current plan's id so it doesn't flag itself
                if (initial?.id) params.excludeId = initial.id;

                const { data } = await serverAxios.get("/plans/check-slug", { params });

                if (!data.available) {
                    form.setError("slug", {
                        type: "manual",
                        message: "This slug is already taken by another plan",
                    });
                } else {
                    // Clear only the manual slug error if it was set by this check
                    if (form.formState.errors.slug?.type === "manual") {
                        form.clearErrors("slug");
                    }
                }
            } catch {
                // silently ignore network errors during check
            }
        }, 400);
    };

    const handleSubmit = (values: PlanFormValues) => {
        // Block submit if slug is still flagged as taken
        if (form.formState.errors.slug?.type === "manual") return;
        onSubmit({
            ...values,
            features: values.features.map((f) => f.value),
        });
    };

    // Auto-generate slug from name (only when creating)
    const handleNameChange = (value: string) => {
        form.setValue("name", value, { shouldValidate: true });
        if (!initial) {
            const generated = value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            form.setValue("slug", generated, { shouldValidate: true });
            checkSlugAvailability(generated);
        }
    };

    const handleSlugChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        form.setValue("slug", sanitized, { shouldValidate: true });
        checkSlugAvailability(sanitized);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                {/* Name + Slug */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan Name <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Basic Tier"
                                        {...field}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. basic-tier"
                                        {...field}
                                        onChange={(e) => handleSlugChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Subscription Type + Threads */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="subscriptionType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subscription Type <span className="text-destructive">*</span></FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="regular">Regular (credits)</SelectItem>
                                        <SelectItem value="monthly">Monthly Unlimited</SelectItem>
                                        <SelectItem value="yearly">Yearly Unlimited</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="threadsQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Threads Quantity <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} placeholder="0 = unlimited" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">For unlimited plans, set this value to 0</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="usdPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>USD Price ($) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="inrPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>INR Price (₹, excl. GST) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gstPercent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST %</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} max={100} placeholder="18" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Features */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <FormLabel>Features <span className="text-destructive">*</span></FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                            <PlusIcon className="w-3 h-3 mr-1" /> Add Feature
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <FormField
                                key={field.id}
                                control={form.control}
                                name={`features.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input placeholder={`Feature ${index + 1}`} {...field} />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                                className="shrink-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    {form.formState.errors.features?.root && (
                        <p className="text-sm text-destructive">{form.formState.errors.features.root.message}</p>
                    )}
                </div>

                {/* Sort Order + Toggles */}
                <div className="grid grid-cols-3 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="highlighted"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                                    <FormLabel className="cursor-pointer">Featured badge</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                                    <FormLabel className="cursor-pointer">Active</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isValid || Object.keys(form.formState.errors).length > 0}
                    >
                        {isLoading ? "Saving..." : "Save Plan"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
