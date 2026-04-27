"use client";

import { NavMain, NavUser, TeamSwitcher } from "@/components/customs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/constants";
import * as React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData?.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          itemsWithNoSubItems={sidebarData?.navItemsWithNoSubItems}
          itemsWithSubItems={sidebarData?.navItemsWithSubItems}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
