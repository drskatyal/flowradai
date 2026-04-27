"use client";
import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useRouter } from "next/navigation";

const NotFoundPage: NextPage = () => {
  const { push, back } = useRouter();
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2 px-4">
        <h1 className="text-[4rem] sm:text-[5rem] md:text-[7rem] font-bold leading-tight">
          404
        </h1>
        <span className="text-sm sm:text-base font-medium">Page Not Found</span>
        <p className="text-center text-sm sm:text-base text-muted-foreground">
          The page you are looking for <br className="hidden sm:block" />
          doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" variant="outline" onClick={back}>
            Go Back
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => push("/auth/login")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
