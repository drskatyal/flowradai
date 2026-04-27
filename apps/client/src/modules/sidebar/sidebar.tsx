"use client";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSidebar } from "@/providers/sidebar-provider";
import { Menu, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import ReportValidation from "./report-validation";
import SidebarContent from "./sidebar-content";

const Sidebar = () => {
  const { isSidebar, setIsSidebar, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();

  return (
    <>
      <div className="top-3 left-3 z-50 absolute hidden lg:flex flex-col gap-3">
        {/* Logo and History Trigger Container */}
        <div
          className={`flex items-center gap-1.5 p-1 px-1.5 bg-background/95 backdrop-blur-md rounded-full border shadow-sm border-border/50 transition-all duration-300 hover:shadow-md ${isSidebar ? "flex-row" : "flex-col"
            }`}
        >
          <img
            src="/Flowrad logo.png"
            alt="flowrad-logo"
            className="w-7 h-7 object-contain ml-0.5 pointer-events-none select-none"
          />
          <div
            className={`h-4 w-px bg-border/60 mx-0.5 ${isSidebar ? "block" : "hidden"
              }`}
          />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-200"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar Tools Toggle */}
        {!isSidebar && (
          <Tooltip
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsSidebar(true)}
                className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-md shadow-sm border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200 group"
              >
                <PanelLeftOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            }
          >
            Open Tools
          </Tooltip>
        )}
      </div>

      <aside className="hidden lg:flex flex-col h-screen border-r lg:border-r-0 bg-muted relative">
        {isSidebar && <ReportValidation />}
      </aside>
    </>
  );
};

export default Sidebar;