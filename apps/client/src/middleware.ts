import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/auth(.*)",
  "/api(.*)",
  "/privacy-policy",
  "/terms-and-conditions",
  "/cancellation-policy",
]);

const isClerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && Boolean(process.env.CLERK_SECRET_KEY);

// In local/dev without Clerk keys, skip auth to allow the app to boot
export default isClerkEnabled
  ? clerkMiddleware(
      (auth, request) => {
        if (!isPublicRoute(request)) {
          auth.protect();
        }
      },
      {
        signInUrl: "/auth/sign-in",
        signUpUrl: "/auth/sign-up",
      }
    )
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
