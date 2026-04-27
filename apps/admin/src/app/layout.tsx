import { Toaster } from "@/components/ui/toaster";
import { ClientProvider, TokenProvider } from "@/providers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning // TODO: suppressed for development need to remove this
      >
        <ClerkProvider
          afterSignOutUrl="/login"
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <ClientProvider>
            <TokenProvider>
              {children}
            </TokenProvider>
          </ClientProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
