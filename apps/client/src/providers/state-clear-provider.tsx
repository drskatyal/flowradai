"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStore } from "@/stores/use-store";
import { queryClient } from "./client-provider";

export default function StateClearProvider() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const resetStore = useStore((state) => state.resetStore);

  useEffect(() => {
    if (isLoaded &&!isSignedIn && !userId) {
      resetStore(); // Reset Zustand store on logout or new sign in
      
      // Clear React Query cache to ensure fresh data on next login
      queryClient.clear();
    }
  }, [isLoaded, isSignedIn, userId, resetStore]);

  return null;
}
