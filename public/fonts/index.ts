import { Weight } from "lucide-react";
import localFont from "next/font/local";

export const fontLibertinus = localFont({
  src: "./LibertinusMath-Regular.ttf",
  variable: "--font-libertinus",
  weight: "400",
  style: "normal",
});

export const fontDMSerifItalic = localFont({
  src: "./DMSerifText-Italic.ttf",
  variable: "--font-dm-serif-italic",
  weight: "400",
  style: "italic",
});

export const fontDMSerif = localFont({
  src: "./DMSerifText-Regular.ttf",
  variable: "--font-dm-serif",
  weight: "400",
  style: "normal",
});
