import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import SwRegister from "@/components/vip/SwRegister";
import { VipThemeProvider } from "@/components/vip/VipThemeProvider";

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isApp = host === "app.monasterybarbers.es";
  return {
    manifest: isApp ? "/manifest.json" : "/espacio-vip/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Monastery VIP",
    },
    // Next.js only genera mobile-web-app-capable; forzamos el tag de iOS explícitamente
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
    icons: {
      apple: "/icons/icon-192.png",
    },
  };
}

export default function VipLayout({ children }: { children: React.ReactNode }) {
  return (
    <VipThemeProvider>
      <SwRegister />
      {children}
    </VipThemeProvider>
  );
}
