import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RunTrack",
    template: "%s | RunTrack",
  },
  description:
    "Suivi de progression running — plans d'entraînement, sync Strava, statistiques détaillées",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo_progrun.png",
    apple: "/logo_progrun.png",
  },
  openGraph: {
    title: "RunTrack",
    description:
      "Suivi de progression running — plans d'entraînement, sync Strava, statistiques détaillées",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/logo_progrun.png",
        width: 512,
        height: 512,
        alt: "RunTrack — écureuil runner",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "RunTrack",
    description: "Suivi de progression running",
    images: ["/logo_progrun.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RunTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text font-dm antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
