"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDesktopView } from "@/hooks";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores/use-store";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  BellRing,
  CalendarCheck2,
  ChevronDown,
  Gift,
  LayoutTemplate,
  LogOut,
  Menu,
  MonitorCog,
  PlusIcon,
  Settings,
  Stethoscope,
  TicketPercent,
  UserPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CouponCode from "./coupon-code/coupon-code";
import CustomProfile from "./custom-profile/custom-profile";
import Instructions from "./instructions";
import UpdatePreferences from "./preferences/preferences";
import ReferAndEarn from "./refer-and-earn/refer-and-earn";
import Shortcuts from "./shortcuts";
import Subscription from "./subscription/subscription";
import UpdateSpecilaity from "./update-speciality/update-speciality";
import WebSearchDialog from "./web-search-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavbarStyles {
  wrapper?: string;
  defaultElementWrapper?: string;
}

export interface ExtendedUserPublicMetadata extends UserPublicMetadata {
  internalId: string;
  user: { status: "active" | "inactive" | "onboarding"; referralCode: string };
  thread?: { availableCredits: number; totalCredits: number };
  payment?: {
    paymentId?: string;
    paymentCreatedAt?: string;
    paymentType?: string;
    paymentAmount?: number;
    threadsQuantity?: number;
    currency?: string;
    planType?: string;
    planName?: string;
    planExpiry?: string;
  };
  referralCode?: string;
  referral?: {
    code: string;
    by: string;
  };
}

interface NavbarProps {
  children?: React.ReactNode;
  classNames?: NavbarStyles;
}

const Navbar: React.FC<NavbarProps> = ({ children, classNames }) => {
  const { user, isUserLoading } = useStore();
  const router = useRouter();
  const { user: authUser } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { setIsMobileMenuOpen } = useSidebar();
  const { isDesktopView } = useDesktopView();

  const remainingThreads = user?.availableCredits || 0;

  const [isOpen, setIsOpen] = useState(false);
  const [isSpeciality, setIsSpeciality] = useState(false);
  const [isPreferences, setIsPreferences] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isReferAndEarn, setIsReferAndEarn] = useState(false);
  const [isCouponCode, setIsCouponCode] = useState(false);

  const { isCustomProfile } = useThreadContext();

  useEffect(() => {
    setIsOpen(isCustomProfile);
  }, [isCustomProfile]);

  useEffect(() => {
    if (!isUserLoading && user) {
      setIsSpeciality(!user.specialityId);
    }
  }, [user, isUserLoading]);

  const planType =
    (authUser?.publicMetadata as ExtendedUserPublicMetadata)?.payment
      ?.planType || "regular";

  const planExpiry = (authUser?.publicMetadata as ExtendedUserPublicMetadata)
    ?.payment?.planExpiry;

  const isUnlimited = ["monthly", "yearly", "quarterly"].includes(planType);
  const isReferral = planType === "referral";
  const isPlanCouponCode = planType === "coupon_code";

  const getRemainingDays = () => {
    if (!planExpiry) return 0;
    const expiry = new Date(planExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingReferralDays = getRemainingDays();

  const menuContent = (
    <DropdownMenuContent
      align="end"
      className="w-64 p-2 shadow-lg border-border"
    >
      <div className="flex items-center gap-3 p-3 mb-1">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={authUser?.imageUrl} />
          <AvatarFallback className="bg-primary/5 text-primary">
            {authUser?.fullName?.charAt(0) ||
              authUser?.firstName?.charAt(0) ||
              "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-0.5 overflow-hidden">
          <span className="text-sm font-semibold truncate">
            {authUser?.fullName || authUser?.username}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {authUser?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </div>

      <DropdownMenuSeparator className="mx-[-8px] mb-2" />

      <DropdownMenuItem
        onClick={() => openUserProfile()}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <Settings className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Manage account</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsOpen(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <UserPen className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Custom Profile</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsSpeciality(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <Stethoscope className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Update Speciality</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsPreferences(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <MonitorCog className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Preferences</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsSubscription(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <CalendarCheck2 className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Subscription Plan</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsCouponCode(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <TicketPercent className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Coupon Code</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => setIsReferAndEarn(true)}
        className="cursor-pointer py-2 px-3 focus:bg-primary/5 focus:text-primary rounded-md transition-colors"
      >
        <Gift className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Refer & Earn</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="mx-[-8px] my-2" />

      <DropdownMenuItem
        className="cursor-pointer py-2 px-3 text-red-600 focus:text-red-700 focus:bg-red-50 rounded-md transition-colors"
        onClick={() => signOut()}
      >
        <LogOut className="mr-3 h-4 w-4 opacity-70" />
        <span className="text-sm font-medium">Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <nav
      className={cn(
        "flex flex-col border-b bg-white dark:bg-slate-950 ",
        classNames?.wrapper
      )}
    >
      <div className="flex min-h-14 items-center px-4 justify-between w-full">
        <div className="flex items-center gap-2">
          {!isDesktopView && (
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden h-9 w-9 text-muted-foreground mr-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isDesktopView ? "secondary" : "outline"}
                  onClick={() => router.push("/template")}
                  className="h-9 px-4"
                >
                  {isDesktopView ? "Templates & Macros" : <LayoutTemplate />}
                </Button>
              </TooltipTrigger>
              {!isDesktopView && (
                <TooltipContent side="right">
                  <p>Templates & Macros</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <WebSearchDialog />
        </div>

        <div className="hidden lg:flex flex-1 justify-center max-w-[500px] ">
          {children}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-2">
            <Shortcuts />
            <Instructions variant="navbar" />
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 h-9 px-3"
          >
            {remainingThreads > 0 ||
              isUnlimited ||
              isReferral ||
              isPlanCouponCode ? (
              <>
                <span className="hidden lg:inline">
                  {isDesktopView ? "Purchase reports" : "Reports"}
                </span>
                <div
                  className={cn(
                    "inline-flex h-5 items-center rounded border border-border px-1.5 text-[0.7rem] font-medium text-muted-foreground bg-muted gap-1",
                    (isReferral || isPlanCouponCode) &&
                    "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  {isReferral || isPlanCouponCode ? (
                    <>
                      <BellRing className="w-3 h-3" />
                      <span>
                        {remainingReferralDays}{" "}
                        {isDesktopView ? "days left" : ""}
                      </span>
                    </>
                  ) : isUnlimited ? (
                    "UN"
                  ) : (
                    remainingThreads
                  )}
                </div>
              </>
            ) : (
              <>
                <PlusIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Buy</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={authUser?.imageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {authUser?.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            {menuContent}
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <CustomProfile
          isOpen={isOpen}
          setIsOpen={() => {
            setIsOpen(false);
          }}
        />
      )}
      {isSpeciality && (
        <UpdateSpecilaity
          isNotSpeciality={!user?.specialityId}
          isOpen={isSpeciality}
          setIsOpen={() => setIsSpeciality(false)}
        />
      )}
      {isPreferences && (
        <UpdatePreferences
          isOpen={isPreferences}
          setIsOpen={() => setIsPreferences(false)}
        />
      )}
      {isSubscription && (
        <Subscription isOpen={isSubscription} setIsOpen={setIsSubscription} />
      )}
      {isReferAndEarn && (
        <ReferAndEarn isOpen={isReferAndEarn} setIsOpen={setIsReferAndEarn} />
      )}
      {isCouponCode && (
        <CouponCode isOpen={isCouponCode} setIsOpen={setIsCouponCode} />
      )}
    </nav>
  );
};

export default Navbar;