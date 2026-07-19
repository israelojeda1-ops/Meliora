import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meliora Advisory — Asesoría financiera, contable y de gestión para PyMEs",
  description:
    "El orden financiero que tu PyME necesita, sin cambiar de sistema ni contratar tres proveedores. Contabilidad, remuneraciones y finanzas en un solo lugar.",
  keywords: [
    "asesoría financiera PyME",
    "contabilidad Chile",
    "CFO externo",
    "remuneraciones",
    "gestión financiera",
    "consultoría PyME Chile",
  ],
  openGraph: {
    title: "Meliora Advisory",
    description:
      "El orden financiero que tu PyME necesita, sin cambiar de sistema ni contratar tres proveedores.",
    url: "https://melioraadvisory.cl",
    siteName: "Meliora Advisory",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
