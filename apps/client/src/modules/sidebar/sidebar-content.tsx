"use client";
import {
  MainLeft,
  TopLeft,
} from "@/components/ui/assistant-ui/thread-list/thread-list";
import Navigation from "./navigation";

const SidebarContent = () => {
  return (
    <>
      <TopLeft />
      <MainLeft />
      {/* <div className="p-3">
        <Navigation />
      </div> */}
    </>
  );
};

export default SidebarContent;
