"use client";
import { AppSidebar } from "@/components/customs";
import { Header } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const user = { displayName: "Admin" }

  const router = useRouter();

  useEffect(() => {
    router.push("/users");
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-y-auto  mx-auto max-w-screen-2xl">
        <Header />
        <section className="p-4 grow overflow-y-auto">
          <h1 className="text-2xl font-bold">Hello, {user?.displayName}</h1>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Home;
