import { Metadata } from "next";
import { Rethink_Sans, JetBrains_Mono } from "next/font/google";
import { Slide, ToastContainer } from "react-toastify";

import { BitcoinWalletProvider } from "@/contexts/BitcoinWalletProvider";
import SolanaWalletProvider from "@/contexts/SolanaWalletProvider";
import { ZplClientProvider } from "@/contexts/ZplClientProvider";

import DevInfo from "../components/DevInfo/DevInfo";
import GlobalModals from "../components/GlobalModals/GlobalModals";
import Header from "../components/Header/Header";
import Socials from "../components/Socials/Socials";

import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import "./design-system.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://orpheus.zeuslayer.dev"),
  title: "Orpheus",
  description:
    "Orpheus: A Next.js template for Bitcoin applications built on ZeusLayer (zApps)",
  openGraph: {
    images: ["/graphics/metadata-img.jpg"],
    title: "Orpheus",
  },
  twitter: {
    images: ["/graphics/metadata-img.jpg"],
    card: "summary_large_image",
  },
};

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rethink-sans",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  adjustFontFallback: false,
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: "400",
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rethinkSans.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body>
        <SolanaWalletProvider>
          <ZplClientProvider>
            <BitcoinWalletProvider>
              <GlobalModals />
              <div className="wrapper">
                <Header />
                <div className="page-wrapper">{children}</div>
                <Socials />
                <DevInfo />
              </div>
              <ToastContainer
                stacked
                className="orpheus-toast"
                position="top-right"
                autoClose={7500}
                hideProgressBar={false}
                rtl={false}
                pauseOnFocusLoss
                theme="dark"
                pauseOnHover
                transition={Slide}
              />
            </BitcoinWalletProvider>
          </ZplClientProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
