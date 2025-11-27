import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Assistant",
  description: "Mobile chat assistant interface",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white text-slate-900"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
