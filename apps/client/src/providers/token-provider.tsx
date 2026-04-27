"use client";
import { setGetTokenFunction } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";
import { QueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

export const queryClient = new QueryClient();

const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    setGetTokenFunction(getToken);
  }, [getToken]);

  return children;
};

export default TokenProvider;
