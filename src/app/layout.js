import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fashiq AI | Premium Fashion Photoshoots",
  description: "Transform your boutique with professional AI fashion photography. High-end, on-model photoshoots for clothing and jewelry.",
  keywords: ["Fashiq AI", "AI Fashion Photography", "AI Jewelry Photoshoot", "Virtual Fashion Model", "E-commerce AI photography"],
  metadataBase: new URL('https://fashiqai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Fashiq AI | Premium Fashion Photoshoots',
    description: 'Transform your boutique with professional AI fashion photography.',
    url: 'https://fashiqai.com',
    siteName: 'Fashiq AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashiq AI | Premium Fashion Photoshoots',
    description: 'Transform your boutique with professional AI fashion photography.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
