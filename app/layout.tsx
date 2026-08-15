import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSiteData } from "@/lib/api";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const name = settings.business?.businessName || "AB Creation";
  return {
    title: `${name} — Custom Apparel & Printing`,
    description:
      "Premium custom apparel and printing. Shop ready-made printed tees or bring your own design.",
    ...(settings.branding?.faviconUrl
      ? { icons: { icon: settings.branding.faviconUrl } }
      : {}),
  };
}

// "#ff5c00" -> "255 92 0" for the rgb(var()/alpha) Tailwind token
function hexToRgbChannels(hex: string): string | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await getSiteData();
  const brandRgb =
    settings.branding?.primaryColor &&
    settings.branding.primaryColor.toLowerCase() !== "#ff5c00"
      ? hexToRgbChannels(settings.branding.primaryColor)
      : null;

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased`}
      >
        {brandRgb && (
          <style>{`:root{--brand-orange-rgb:${brandRgb};}`}</style>
        )}
        <TopBar />
        <Navbar logoUrl={settings.branding?.logoUrl} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
