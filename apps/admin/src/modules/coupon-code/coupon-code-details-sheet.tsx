import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCouponCode } from "@/hooks/use-coupon-code";
import { serverAxios } from "@/lib/axios";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Clock, Users, X } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";


const formatDate = (date: string | number | Date) => {
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
};

const CouponCodeDetailsContent = ({
  couponCodeId,
  onClose,
}: {
  couponCodeId: string;
  onClose: () => void;
}) => {
  const { data: couponCode, isLoading: loading } = useCouponCode(couponCodeId);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "applied">("all");
  const [usageDetails, setUsageDetails] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    const fetchUsageDetails = async () => {
      if (!couponCodeId) return;

      setLoadingUsage(true);
      try {
        const response = await serverAxios.get(
          `/coupon-code/getCouponUsageDetails?id=${couponCodeId}`
        );
        setUsageDetails(response.data);
      } catch (error) {
        console.error("Error fetching usage details:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (couponCodeId) {
      fetchUsageDetails();
    }
  }, [couponCodeId]);

  if (loading) {
    return (
      <>
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 z-50 w-[420px] bg-card border-l flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
          {/* Minimal header */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Large code display */}
          <div className="px-5 pb-6">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-9 w-48" />
          </div>

          <Separator />

          <div className="p-5 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!couponCode) {
    return (
      <>
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 z-50 w-[420px] bg-card border-l flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
          <div className="p-5 flex items-center justify-between">
            <span className="text-sm font-medium">Coupon Code</span>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Coupon code not found
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const allowedUsers = couponCode.allowedUsers || [];
  const hasUsers = allowedUsers.length > 0;
  const allUsersAllow = couponCode.allowToAllUsers || false;

  const statusColor = couponCode.isActive ? "bg-green-500" : "bg-gray-400";
  const statusText = couponCode.isActive ? "ACTIVE" : "INACTIVE";

  const tableRows = [
    { label: "Name", value: couponCode.name || "—" },
    { label: "Validity Period", value: `${couponCode.days} Days` },
    { label: "Created At", value: formatDate(couponCode.createdAt) },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side sheet */}
      <div className="fixed inset-y-0 right-0 z-50 w-[420px] bg-card border-l flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        {/* Minimal header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColor}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {statusText}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Large code display */}
        <div className="px-5 pb-6">
          <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
          <h1 className="text-3xl font-mono font-black tracking-[0.15em]">
            {couponCode.code}
          </h1>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-0">
            {/* Table-like rows */}
            {tableRows.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-4 border-b last:border-b-0"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}

            {/* Users section with tabs - show for restricted coupons */}
            {!allUsersAllow && hasUsers && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Allowed Users
                  </span>
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {usageDetails?.stats?.totalAllowed || allowedUsers.length}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === "all"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    All ({usageDetails?.stats?.totalAllowed || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === "pending"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Pending ({usageDetails?.stats?.totalPending || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("applied")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === "applied"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Applied ({usageDetails?.stats?.totalApplied || 0})
                  </button>
                </div>

                {/* User list based on active tab */}
                {loadingUsage ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(() => {
                      const users = usageDetails?.users?.[activeTab] || allowedUsers;

                      if (users.length === 0) {
                        return (
                          <div className="text-center py-8 border rounded-lg bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                              {activeTab === "pending" && "No pending users"}
                              {activeTab === "applied" && "No users have applied this coupon yet"}
                              {activeTab === "all" && "No users assigned"}
                            </p>
                          </div>
                        );
                      }

                      return users.map((user: any) => (
                        <div
                          key={user._id}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-2 border-foreground/10 flex items-center justify-center text-xs font-bold bg-muted relative">
                              {getInitials(user.firstName, user.lastName)}
                              {user.hasUsed && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.hasUsed && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Applied
                              </span>
                            )}
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Users who applied section - show for allUsersAllow coupons */}
            {allUsersAllow && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Users Who Applied
                  </span>
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {usageDetails?.stats?.totalApplied || 0}
                  </span>
                </div>

                {loadingUsage ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(() => {
                      const appliedUsers = usageDetails?.users?.applied || [];

                      if (appliedUsers.length === 0) {
                        return (
                          <div className="text-center py-8 border rounded-lg bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                              No users have applied this coupon yet
                            </p>
                          </div>
                        );
                      }

                      return appliedUsers.map((user: any) => (
                        <div
                          key={user._id}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-2 border-foreground/10 flex items-center justify-center text-xs font-bold bg-muted relative">
                              {getInitials(user.firstName, user.lastName)}
                              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Applied
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* No users state - only show if allUsersAllow is false */}
            {!allUsersAllow && !hasUsers && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Allowed Users
                  </span>
                  <span className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                    0
                  </span>
                </div>
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    No users assigned
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MemoizedCouponCodeDetailsContent = memo(
  CouponCodeDetailsContent,
  (prevProps, nextProps) => {
    return prevProps.couponCodeId === nextProps.couponCodeId;
  }
);

const CouponCodeDetailsSheet = memo(
  ({
    isOpen,
    onClose,
    couponCodeId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    couponCodeId?: string;
  }) => {
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) onClose();
      },
      [onClose]
    );

    if (!couponCodeId) return null;

    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <MemoizedCouponCodeDetailsContent
          couponCodeId={couponCodeId}
          onClose={onClose}
        />
      </Sheet>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.couponCodeId === nextProps.couponCodeId &&
      prevProps.isOpen === nextProps.isOpen
    );
  }
);

CouponCodeDetailsSheet.displayName = "CouponCodeDetailsSheet";

export default CouponCodeDetailsSheet;