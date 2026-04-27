"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ThreadPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, []);

  return <div>ThreadPage</div>;
};

export default ThreadPage;
