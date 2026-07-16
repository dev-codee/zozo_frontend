"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Latest", href: "/phones?sort=latest" },
  { label: "Trending", href: "/phones?sort=trending" },
  { label: "Brands", href: "/phones" },
  { label: "Compare", href: "/compare" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle shadow-sm bg-surface-white/95 backdrop-blur-md">
      <div className="flex justify-between items-center px-4 md:px-6 h-16 w-full max-w-[1280px] mx-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-on-surface tracking-tight">
            zozo<span className="text-primary-container">.pk</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="h-full flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold tracking-wide uppercase px-4 hover:bg-surface-container-low"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
            aria-label="Search"
          >
            <span className="material-symbols-outlined">search</span>
          </Link>
          <Link
            href="/login"
            className="hidden md:inline-flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-2 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors h-11"
          >
            Login
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-white border-t border-border-subtle animate-[slideDown_0.2s_ease-out]">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
