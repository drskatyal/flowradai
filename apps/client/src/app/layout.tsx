import { ClientProvider, RuntimeProvider, TokenProvider } from "@/providers";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./global.css";
import { Suspense } from "react";
import { StateClearProvider } from "@/providers";
import { VADConfig } from "@/components/customs/mic/voice-activity-detection/vad-config";
import SidebarProvider from "@/providers/sidebar-provider";
import { GTM_ID } from "@/lib/gtm";
import Script from "next/script";
import { SessionGuard } from "@/components/session-guard";

export const metadata: Metadata = {
  title: "Flowrad AI Report",
  description:
    "Engage in dynamic conversations powered by a custom-built GPT-based chatbot, designed to enhance communication and problem-solving.",
  icons: {
    icon: "/Flowrad logo.png",
  },
};

import { ChunkErrorErrorBoundary } from "@/components/error/chunk-error-boundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/auth/sign-in"
      signUpForceRedirectUrl="/onboarding"
      signUpUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <head>
          {/* GTM script */}
          {GTM_ID && (
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${GTM_ID}');
                `,
              }}
            />
          )}
        </head>
        <body>
          {/* noscript fallback required by GTM */}
          {GTM_ID && (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              ></iframe>
            </noscript>
          )}
          <StateClearProvider />
          <SessionGuard />
          <ClientProvider>
            <TokenProvider>
              <ChunkErrorErrorBoundary>
                <Suspense>
                  <VADConfig />
                  <SidebarProvider>
                    <RuntimeProvider>{children}</RuntimeProvider>
                  </SidebarProvider>
                </Suspense>
              </ChunkErrorErrorBoundary>
            </TokenProvider>
          </ClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
