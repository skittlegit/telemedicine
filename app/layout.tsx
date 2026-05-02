import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "./_components/PageTransition";

// Display: Fraunces — variable serif with optical sizing. The editorial
// signature on every brand-surface H1, paired with one italic-accent
// fragment per page hero.
const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Body: IBM Plex Sans — clinical, slightly humanist, pairs cleanly with
// Fraunces on the brand surface and reads as steady on the product surface.
const sans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Mono: JetBrains Mono — clinical evidence type. IDs, fees, timestamps,
// prescription codes, audit trails, eyebrow labels.
const mono = JetBrains_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vellum Health",
  description:
    "Encrypted video consultations, signed digital prescriptions, and same-day pharmacy fulfilment with licensed clinicians.",
  applicationName: "Vellum Health",
  appleWebApp: {
    title: "Vellum",
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#F4F1E9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#content" className="skip-link">Skip to content</a>
        <PageTransition>
          <div id="content" tabIndex={-1} className="contents">
            {children}
          </div>
        </PageTransition>
      </body>
    </html>
  );
}
