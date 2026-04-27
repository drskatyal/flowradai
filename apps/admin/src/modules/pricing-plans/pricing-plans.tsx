"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/customs";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
    usePricingPlans,
    useCreatePricingPlan,
    useUpdatePricingPlan,
    useDeletePricingPlan,
    PricingPlan,
    PricingPlanInput,
} from "@/hooks/use-pricing-plans";
import { PlanForm } from "./plan-form";

const PricingPlans = () => {
    const { data: plans = [], isLoading } = usePricingPlans();
    const { mutate: createPlan, isPending: creating } = useCreatePricingPlan();
    const { mutate: updatePlan, isPending: updating } = useUpdatePricingPlan();
    const { mutate: deletePlan } = useDeletePricingPlan();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<PricingPlan | undefined>();
    const setSlugErrorRef = useRef<((msg: string) => void) | null>(null);

    const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
    const openEdit = (plan: PricingPlan) => { setEditing(plan); setDialogOpen(true); };

    const handleSubmit = (data: PricingPlanInput) => {
        const onError = (err: any) => {
            const msg = err?.response?.data?.message || "";
            if (msg.toLowerCase().includes("slug") && setSlugErrorRef.current) {
                setSlugErrorRef.current(msg);
            }
        };

        if (editing) {
            updatePlan({ id: editing.id, data }, { onSuccess: () => setDialogOpen(false), onError });
        } else {
            createPlan(data, { onSuccess: () => setDialogOpen(false), onError });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pricing Plans</h1>
                    <p className="text-muted-foreground mt-1">Manage all pricing plans shown to users</p>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Plan
                </Button>
            </div>

            {isLoading ? (
                <p className="text-muted-foreground">Loading plans...</p>
            ) : plans.length === 0 ? (
                <p className="text-muted-foreground">No plans yet. Create one to get started.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                                    <div className="flex gap-1">
                                        {plan.highlighted && <Badge variant="secondary">Featured</Badge>}
                                        <Badge variant={plan.isActive ? "default" : "outline"}>
                                            {plan.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono">{plan.slug}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">USD:</span> ${plan.usdPrice}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">INR:</span> ₹{plan.inrPrice} + {plan.gstPercent}% GST
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Threads:</span>{" "}
                                        {plan.threadsQuantity === 0 ? "Unlimited" : plan.threadsQuantity}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Type:</span> {plan.subscriptionType}
                                    </div>
                                </div>
                                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                    {plan.features.slice(0, 2).map((f, i) => <li key={i}>{f}</li>)}
                                    {plan.features.length > 2 && <li>+{plan.features.length - 2} more</li>}
                                </ul>
                                <div className="flex gap-2 pt-1">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                                        <PencilIcon className="w-3 h-3 mr-1" /> Edit
                                    </Button>
                                    <AlertDialog
                                        trigger={
                                            <Button size="sm" variant="destructive">
                                                <TrashIcon className="w-3 h-3 mr-1" /> Delete
                                            </Button>
                                        }
                                        dialogTitle="Delete Plan"
                                        actionTitle="Delete"
                                        cancelActionTitle="Cancel"
                                        onConfirm={() => deletePlan(plan.id)}
                                        actionProps={{ className: "bg-destructive text-destructive-foreground hover:bg-destructive/90" }}
                                    >
                                        Are you sure you want to delete <strong>{plan.name}</strong>? This action cannot be undone.
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Plan" : "Create Plan"}</DialogTitle>
                    </DialogHeader>
                    <PlanForm
                        initial={editing}
                        onSubmit={handleSubmit}
                        isLoading={creating || updating}
                        onCancel={() => setDialogOpen(false)}
                        onSetSlugError={(fn) => { setSlugErrorRef.current = fn; }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PricingPlans;
