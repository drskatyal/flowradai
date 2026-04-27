"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getInitials } from "@/helpers";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { SignInButton, SignOutButton, useAuth, useUser } from '@clerk/nextjs'

export function NavUser() {
  const { isMobile } = useSidebar();

  const { user } = useUser();
  const authUser = {displayName: `${user?.firstName}`, photoURL: user?.imageUrl, email: user?.primaryEmailAddress?.emailAddress}
  const router = useRouter();
  const userInitials = getInitials(authUser?.displayName || "");

  const { sessionId, signOut } = useAuth()

  if (!sessionId) {
    return <SignInButton />
  }

  const handleLogout = async () => {
      destroyCookie(null, "auth", {
        path: "/",
        sameSite: "strict",
      });
      signOut();
      router.replace("/auth/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={authUser?.photoURL || ""}
                  alt={authUser?.displayName || ""}
                />
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {authUser?.displayName || "Admin"}
                </span>
                <span className="truncate text-xs">{authUser?.email || ''}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={authUser?.photoURL || ""}
                    alt={authUser?.displayName || ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {authUser?.displayName || ''}
                  </span>
                  <span className="truncate text-xs">{authUser?.email || ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <SignOutButton signOutOptions={{ sessionId }} redirectUrl="/auth/login"/>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
