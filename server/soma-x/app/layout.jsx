import { Manrope } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { LanguageProvider } from "@/context/LanguageContext";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from 'sonner';
import LayoutWrapper from "@/components/global/LayoutWrapper";

const manRope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "SomaBox Digital Library",
  description: "Offline Education For All - An initiative by Soma Foundation Rwanda",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manRope.className} antialiased`}>
        <NextTopLoader color="#273591" />
        <DataProvider>
          <LanguageProvider>
            <Toaster position="top-center" richColors />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </LanguageProvider>
        </DataProvider>
      </body>
    </html>
  );
}
