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
import { PinLockModal } from '../components/auth/PinLockModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  return (
    <html lang="en" className="light">
      <head>
        <title>PharmaSync GH - Ghanaian Multi-Branch Pharmacy System</title>
        <meta name="description" content="Multi-branch Ghanaian Retail Pharmacy Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-[#F3F4F7] text-slate-900 antialiased flex flex-col font-sans overflow-x-hidden">
        <ThemeProvider>
          <ToastProvider>
            <OfflineProvider>
              <PharmacyProvider>
                {/* FIX: flex-col on mobile, flex-row on desktop to prevent left blank space */}
                <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#F3F4F7] overflow-x-hidden">
                  <Sidebar onOpenShortcuts={() => setIsKeyboardModalOpen(true)} />
                  {/* FIX: pl-0 on mobile (full width), md:pl-64 only on desktop when sidebar is fixed */}
                  <div className="flex-1 w-full min-w-0 md:pl-64 flex flex-col bg-[#F3F4F7] overflow-x-hidden">
                    {/* FIX: pb-24 on mobile to avoid bottom nav cutoff, md:pb-6 on desktop */}
                    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 bg-[#F3F4F7] overflow-x-hidden">
                      {children}
                    </main>
                  </div>
                </div>
                <MobileNav />
                <KeyboardModal isOpen={isKeyboardModalOpen} onClose={() => setIsKeyboardModalOpen(false)} />
                <PinLockModal />
              </PharmacyProvider>
            </OfflineProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
