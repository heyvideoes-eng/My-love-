import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Control Center",
  description: "Secure management dashboard",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900 font-satoshi" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
