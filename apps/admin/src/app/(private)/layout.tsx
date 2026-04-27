"use client";
import { AppSidebar } from "@/components/customs";
import { Header } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-y-auto mx-auto max-w-screen-2xl">
        <Header />
        <section className="p-4 pt-0 grow">{children}</section>
      </SidebarInset>
    </SidebarProvider>
  );
}
