"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MacroList from "../macro/macro-list";
import TemplateList from "./template-list";

const Templates = () => {
  return (
    <div className="p-0 space-y-4">
      <Tabs defaultValue="templates" className="w-full">
        {/* ===== Header Tabs ===== */}
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/40 p-1 rounded-xl border shadow-sm">
            <TabsTrigger
              value="templates"
              className="
                px-6 py-2 rounded-lg text-sm font-medium
                data-[state=active]:bg-black
                data-[state=active]:text-white
                data-[state=active]:shadow
                transition-all
              "
            >
              Templates
            </TabsTrigger>

            <TabsTrigger
              value="macros"
              className="
                px-6 py-2 rounded-lg text-sm font-medium
                data-[state=active]:bg-black
                data-[state=active]:text-white
                data-[state=active]:shadow
                transition-all
              "
            >
              Macros
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ===== Templates Tab ===== */}
        <TabsContent value="templates" className="space-y-4">
          <TemplateList />
        </TabsContent>

        {/* ===== Macros Tab ===== */}
        <TabsContent value="macros">
          <MacroList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;
