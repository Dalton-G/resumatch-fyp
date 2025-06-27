import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  fontDMSerif,
  fontDMSerifItalic,
  fontLibertinus,
} from "../../public/fonts";

export const metadata: Metadata = {
  title: "ResuMatch",
  description: "AI Job Matching and Resume Optimization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased",
          fontLibertinus.variable,
          fontDMSerif.variable,
          fontDMSerifItalic.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
