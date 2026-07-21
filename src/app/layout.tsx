import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const GA_MEASUREMENT_ID = "G-1LW5SSCQ4F";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meliora Advisory — Asesoría financiera, contable y de gestión para PyMEs",
  description:
    "El orden financiero que tu PyME necesita, sin cambiar de sistema ni contratar tres proveedores. Contabilidad, remuneraciones, dashboards y reportería gerencial sobre Softland, Softland Cloud u otro ERP.",
  keywords: [
    "asesoría financiera PyME",
    "contabilidad Chile",
    "CFO externo",
    "remuneraciones",
    "gestión financiera",
    "consultoría PyME Chile",
    "reportes Softland",
    "dashboard Softland Cloud",
    "Power BI Softland",
    "business intelligence PyME",
    "reportería gerencial automatizada",
  ],
  openGraph: {
    title: "Meliora Advisory",
    description:
      "El orden financiero que tu PyME necesita, sin cambiar de sistema ni contratar tres proveedores. Dashboards y reportería sobre Softland, Softland Cloud u otro ERP.",
    url: "https://melioraadvisory.cl",
    siteName: "Meliora Advisory",
    locale: "es_CL",
    type: "website",
    images: [{ url: "https://melioraadvisory.cl/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meliora Advisory",
    description:
      "El orden financiero que tu PyME necesita, sin cambiar de sistema ni contratar tres proveedores.",
    images: ["https://melioraadvisory.cl/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Meliora Advisory",
  description:
    "Asesoría financiera, contable y de gestión para PyMEs: contabilidad, remuneraciones, CFO externo y dashboards de reportería gerencial sobre Softland, Softland Cloud u otro ERP.",
  url: "https://melioraadvisory.cl",
  image: "https://melioraadvisory.cl/og-image.png",
  areaServed: "CL",
  address: { "@type": "PostalAddress", addressCountry: "CL" },
  priceRange: "$$",
  knowsAbout: [
    "Softland",
    "Softland Cloud",
    "Power BI",
    "SQL Server",
    "Contabilidad",
    "CFO externo",
    "Reportería gerencial",
    "Dashboards financieros",
    "Remuneraciones",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
