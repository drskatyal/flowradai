"use client";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import FloatingMessageInput from "./floating-message-input";
import { FloatingOutput } from "./floating-output";
import { ThreadPrimitive } from "@assistant-ui/react";
import { FloatingHeader } from "./floating-header";

export const FloatingWindow = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background backdrop-blur-xl border border-border/40 shadow-2xl">
        {/* Header Bar */}
        <FloatingHeader className="h-10 border-b border-border/40 bg-background/70 supports-[backdrop-filter]:bg-background/20 backdrop-blur-xl" />
        {/* Auth content (non-draggable area) */}
        <div className="flex items-center justify-center flex-1 p-4 bg-background/80 supports-[backdrop-filter]:bg-background/30 backdrop-blur-xl no-drag">
          <div className="max-w-md">
            <SignIn
              signUpUrl="/auth/sign-up"
              redirectUrl="/floating"
              afterSignInUrl="/floating"
              afterSignUpUrl="/floating"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Dedicated header for the authenticated view */}
      <div className="bg-[#C7C7C7] rounded-t-lg mx-0 mt-0 pt-1 widget-header">
        <FloatingHeader className="pb-0 pt-0 h-6" />
      </div>

      <ThreadPrimitive.Root className="flex flex-col flex-1 h-full overflow-hidden gap-5">
        {/* Input Area - Removed drag-area class since header handles it now */}
        <div className="flex-shrink-0">
          <FloatingMessageInput />
        </div>

        {/* Output Area - Messages */}
        <div className="flex-1 min-h-0 widget-container p-3 rounded-lg">
          <FloatingOutput />
        </div>
      </ThreadPrimitive.Root>
    </div>
  );
};

