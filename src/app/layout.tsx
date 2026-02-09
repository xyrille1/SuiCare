
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@mysten/dapp-kit/dist/index.css";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuiCare - Decentralized Fundraising",
  description: "Create and donate to fundraising campaigns on the Sui blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }> ) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-muted/20`}>
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
