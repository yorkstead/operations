import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Providers } from "@/components/providers";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} | ${brand.descriptor}`,
  description: "Configurable commercial operations platform with deterministic demo environments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
