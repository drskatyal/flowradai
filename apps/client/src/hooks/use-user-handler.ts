import { useDbUser } from "./use-db-user";
import { useStore } from "@/stores/use-store";
import { useUser } from "@clerk/nextjs";
import { ExtendedUserPublicMetadata } from "@/modules/home/navbar";
import { useEffect } from "react";
import { queryClient } from "@/providers/client-provider";

export const useUserHandler = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const setUser = useStore((state) => state.setUser);
  const setIsUserLoading = useStore((state) => state.setIsUserLoading);
  const resetStore = useStore((state) => state.resetStore);

  const metadata = (user?.publicMetadata as ExtendedUserPublicMetadata) || {};
  const internalId = metadata?.internalId;

  const { user: dbUser, isSuccess, isLoading, refetch } = useDbUser(internalId);

  // Reset store and clear React Query cache when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      resetStore();
      queryClient.clear();
    }
  }, [isLoaded, isSignedIn, resetStore]);

  // When user signs in, force refetch user data to ensure fresh data
  useEffect(() => {
    if (isLoaded && isSignedIn && internalId) {
      refetch();
    }
  }, [isLoaded, isSignedIn, internalId, refetch]);

  // Update Zustand store with user data when it's fetched
  useEffect(() => {
    if (isLoaded && isSignedIn && isSuccess && dbUser) {
      setUser(dbUser);
    }
  }, [isLoaded, isSignedIn, isSuccess, dbUser, setUser]);

  // Update loading state
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsUserLoading(isLoading);
    }
  }, [isLoaded, isSignedIn, isLoading, setIsUserLoading]);

  // Electron Auth Sync
  useEffect(() => {
    // Notify Electron about auth state change
    if (isLoaded && typeof window !== "undefined" && (window as any).electron?.sendAuthStateChange) {
      (window as any).electron.sendAuthStateChange(isSignedIn);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    // Listen for auth updates from other windows
    if (typeof window !== "undefined" && (window as any).electron?.onSyncAuth) {
      const cleanup = (window as any).electron.onSyncAuth(({ isSignedIn: remoteIsSignedIn }: { isSignedIn: boolean }) => {
        // If the remote state is different from local state, reload to sync cookies/session
        if (isLoaded && remoteIsSignedIn !== isSignedIn) {
          window.location.reload();
        }
      });
      return cleanup;
    }
  }, [isSignedIn, isLoaded]);

  return {
    user: dbUser,
    isLoaded,
    isSignedIn,
    isUserLoading: isLoading,
  };
};
