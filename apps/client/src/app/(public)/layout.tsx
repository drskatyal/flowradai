import Image from "next/image";
import Link from "next/link";

export default function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex items-center justify-center py-4 min-h-screen">
        {children}
      </main>
      <footer className="w-full bg-muted py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/full-logo.png"
                  alt="Logo"
                  width={120}
                  height={80}
                  priority
                />
              </Link>
            </div>

            <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cancellation-policy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancellation Policy
              </Link>
            </nav>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} Flowrad.AI. All rights reserved.
            </div>
            <div>
              Developed by{" "}
              <a
                href="https://techstaunch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
              >
                TechStaunch
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
