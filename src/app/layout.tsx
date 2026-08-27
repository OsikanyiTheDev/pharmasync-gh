'use client';

import React, { useState } from 'react';
import './globals.css';
import { PharmacyProvider } from '../context/PharmacyContext';
import { OfflineProvider } from '../context/OfflineContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { KeyboardModal } from '../components/layout/KeyboardModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  return (
    <html lang="en" className="light">
      <head>
        <title>PharmaSync GH - Ghanaian Multi-Branch Pharmacy System</title>
        <meta name="description" content="Multi-branch Ghanaian Retail Pharmacy Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-[#F3F4F7] text-slate-900 antialiased flex flex-col font-sans">
        <ThemeProvider>
          <ToastProvider>
            <OfflineProvider>
              <PharmacyProvider>
                <div className="flex min-h-screen bg-[#F3F4F7]">
                  <Sidebar onOpenShortcuts={() => setIsKeyboardModalOpen(true)} />
                  <div className="flex-1 md:pl-64 flex flex-col min-w-0 bg-[#F3F4F7]">
                    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#F3F4F7]">
                      {children}
                    </main>
                  </div>
                </div>
                <MobileNav />
                <KeyboardModal isOpen={isKeyboardModalOpen} onClose={() => setIsKeyboardModalOpen(false)} />
              </PharmacyProvider>
            </OfflineProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
