import type { Metadata } from "next";
import "./globals.css";
import InteractiveEffects from "@/components/public/InteractiveEffects";

export const metadata: Metadata = {
  title: "For Vanshika",
  description:
    "A premium, digital romantic sanctuary — written with love, made for Vanshika.",
  openGraph: {
    title: "For Vanshika",
    description: "A premium, digital romantic sanctuary — written with love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=boska@400,500,700&f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/* Globally active Lenis scrolling and cursor heart emitter */}
        <InteractiveEffects />
        {children}
      </body>
    </html>
  );
}
