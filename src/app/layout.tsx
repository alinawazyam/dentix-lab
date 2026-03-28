import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AdminDataProvider } from "@/lib/admin-context";

// Force redeploy - v3 - fix application error

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dentix Lab - Premium Dental Care",
  description: "Modern dental care for a perfect smile. Experience world-class dental services with cutting-edge technology.",
  keywords: ["dental", "dentist", "implants", "cosmetic dentistry", "teeth whitening", "orthodontics"],
  authors: [{ name: "Dentix Lab" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Dentix Lab - Premium Dental Care",
    description: "Modern dental care for a perfect smile",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C73E1D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Preconnect to Google Sheets for faster API calls */}
        <link rel="preconnect" href="https://script.google.com" />
        <link rel="dns-prefetch" href="https://script.google.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <AdminDataProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </AdminDataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
