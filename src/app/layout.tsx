import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CadPro TMMS",
  description: "Traffic management monitoring system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className="m-0 min-h-full bg-[#f5f4ef] text-[#10211d] font-[Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      <body className="m-0 min-h-full bg-[#f5f4ef] text-[#10211d]">{children}</body>
    </html>
  );
}
