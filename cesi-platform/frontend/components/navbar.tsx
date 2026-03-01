'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">CR</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Climate Risk</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className={`hidden md:flex gap-8 items-center`}>
            <Link href="/" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Home
            </Link>
            <Link href="/cities" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Cities
            </Link>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border">
            <Link href="/" className="block text-foreground hover:text-primary py-2">
              Home
            </Link>
            <Link href="/cities" className="block text-foreground hover:text-primary py-2">
              Cities
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
