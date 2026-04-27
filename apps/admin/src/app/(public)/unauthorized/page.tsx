"use client";
import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useAuth } from '@clerk/nextjs'
import { useRouter } from "next/navigation";

const UnauthorizedPage: NextPage = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    signOut();
    router.replace("/auth/login");
  };

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4">
        <h1 className="text-[4rem] sm:text-[5rem] md:text-[7rem] font-bold leading-tight">
          403
        </h1>
        <span className="text-sm sm:text-base font-medium">
          Access Forbidden
        </span>
        <p className="text-center text-sm sm:text-base text-muted-foreground">
          You don&apos;t have necessary permission{" "}
          <br className="hidden sm:block" />
          to view this resource.
        </p>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" onClick={handleLogout}>
            Login with new account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
