import "~/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { ThemeProvider } from "~/components/organisms/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEOFT - Plataforma Exclusiva do Setor de Oftalmologia do HGF",
  description:
    "Descubra a SEOFT, a plataforma auxiliar do Setor de Oftalmologia do HGF. Otimize sua rotina com ferramentas exclusivas para residentes e colaboradores do hospital. Acesse informações e recursos indispensáveis para o seu dia a dia.",
  applicationName: "SEOFT - Setor de Oftalmologia HGF",
  generator: "Next.js",
  keywords: [
    "oftalmologia",
    "HGF",
    "SEOFT",
    "Setor de Oftalmologia",
    "residentes",
    "hospital geral de fortaleza",
    "ferramentas para médicos",
    "recursos oftalmologia",
  ],
  authors: [{ name: "Leonardo Nunes", url: "https://github.com/leonunesbs" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://seoft.com.br/",
    languages: { "pt-BR": "https://seoft.com.br" },
  },
  openGraph: {
    title: "SEOFT - Plataforma Auxiliar do Setor de Oftalmologia do HGF",
    description:
      "Bem-vindo à SEOFT, uma plataforma desenvolvida exclusivamente para o Setor de Oftalmologia do HGF. Ferramentas otimizadas para residentes, integração eficiente e recursos exclusivos para colaboradores. Descubra mais!",
    url: "https://seoft.com.br",
    siteName: "SEOFT",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://seoft.com.br/iSEOFT-logo.png",
        width: 512,
        height: 512,
        alt: "Logo da SEOFT - Setor de Oftalmologia do HGF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@leonunesbs",
    title: "SEOFT - Ferramentas Exclusivas para Oftalmologia no HGF",
    description:
      "A SEOFT é a solução definitiva para residentes e colaboradores do Setor de Oftalmologia do HGF. Recursos personalizados e integração para otimizar sua rotina. Acesse já!",
    images: ["https://seoft.com.br/iSEOFT-logo.png"],
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: "/favicon/favicon-96x96.png",
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
    other: [
      { rel: "icon", url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewports = {
  mobile: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="iSEOFT" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        {/* Metadata */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={openSans.className}>
        <TRPCReactProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
