import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicPulse BRICS",
  description: "AI-driven public-investment and decision-support platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                  CP
                </div>
                <h1 className="text-xl font-bold text-gray-900">CivicPulse BRICS</h1>
              </div>
              <div className="flex items-center gap-4">
                <select className="text-sm border-gray-300 rounded-md shadow-sm">
                  <option>English</option>
                  <option>Español</option>
                  <option>Português</option>
                  <option>Русский</option>
                  <option>中文</option>
                  <option>हिन्दी</option>
                </select>
              </div>
            </div>
          </header>
          
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white mt-auto border-t">
            <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
              <p>&copy; 2026 CivicPulse BRICS. All rights reserved.</p>
              <div className="mt-2 space-x-4">
                <a href="#" className="hover:text-primary">Privacy Policy</a>
                <a href="#" className="hover:text-primary">Terms of Service</a>
                <a href="#" className="hover:text-primary">Low-Bandwidth Mode</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
