"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { ExtendedUserPublicMetadata } from "@/constants";
import UsersTable from "./userTable";
const UserPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (
      (user?.publicMetadata as ExtendedUserPublicMetadata)?.user?.role !==
        "admin" &&
      isLoaded
    ) {
      signOut();
      router.replace("auth/login");
    }
  }, [user, isLoaded]);
  return (
    <>
      <UsersTable />
    </>
  );
};

export default UserPage;
