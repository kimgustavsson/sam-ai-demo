import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import SplashScreen from "./components/SplashScreen";

export const metadata: Metadata = {
  title: "Enable",
  description: "Mobile chat assistant interface",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: '--font-jakarta', 
  weight: ['500', '700', '800'] 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter', 
  weight: ['400', '500'] 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${inter.variable} font-sans antialiased bg-white text-slate-900 pt-12`}
        suppressHydrationWarning={true}
      >
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
