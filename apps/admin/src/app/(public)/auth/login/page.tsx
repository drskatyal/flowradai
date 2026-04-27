"use client";
import { NextPage } from "next";
import { SignIn } from "@clerk/nextjs";

const LoginPage: NextPage = () => {
  return (
    <div className="auth-modal">
      <SignIn routing="hash" fallbackRedirectUrl={"/users"}/>
    </div>
  )
};

export default LoginPage;
