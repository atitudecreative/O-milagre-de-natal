import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const ui = Geist({ variable: "--font-ui", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-ui-mono", subsets: ["latin"] });
const display = Instrument_Serif({ variable: "--font-display-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Palco — Apresentações de eventos para patrocinadores", template: "%s" },
  description: "Plataforma de apresentação comercial de eventos e captação de patrocínios.",
};

export const viewport: Viewport = {
  themeColor: "#141413",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${ui.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
