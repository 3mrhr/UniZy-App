import ThemeProvider from "@/components/ThemeProvider";
import LanguageProvider from "@/i18n/LanguageProvider";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "UniZy - Student Super App",
  description: "The digital ecosystem for students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-unizy-navy text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              <ClientLayout>
                {children}
              </ClientLayout>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
