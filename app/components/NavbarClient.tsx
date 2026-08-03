"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

export default function NavbarClient({ dynamicPages = [] }: { dynamicPages?: any[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseNavLinks = [
    { label: "Home", href: "/" },
    { label: "Top 10 Phones", href: "/phones?sort=trending&limit=10" },
    { label: "Best 10 Phones By Price", href: "/phones?sort=price_asc&limit=10" },
    { label: "Up Coming Phones", href: "/phones?status=upcoming" },
    { label: "Compare", href: "/compare" },
    { label: "Brands", href: "/brands" },
  ];

  const bestPhonesLinks = [
    { label: "Doctor", href: "/phones?category=doctor" },
    { label: "Engineers", href: "/phones?category=engineers" },
    { label: "Developers", href: "/phones?category=developers" },
    { label: "Gamers", href: "/phones?category=gamers" },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path, query] = href.split('?');
    if (href === '/compare' && pathname.startsWith('/compare')) return true;
    if (path !== pathname) return false;
    if (query) {
       const params = new URLSearchParams(query);
       for (const [key, value] of params.entries()) {
         if (searchParams.get(key) !== value) return false;
       }
       return true;
    }
    if (href === '/phones' && searchParams.get('sort')) return false;
    return true;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle shadow-sm bg-surface-white/95 backdrop-blur-md">
      {/* Top Row: Logo, Search, Actions */}
      <div className="flex justify-between items-center px-4 md:px-6 h-16 w-full max-w-[1280px] mx-auto gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/ZOZO-Logo-v2.png" unoptimized alt="zozo.pk" width={210} height={60} className="h-14 md:h-16 w-auto object-contain" />
        </Link>

        {/* Centered Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl justify-center px-4">
          <SearchBar className="w-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/search"
            className="md:hidden text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
            aria-label="Search"
          >
            <span className="material-symbols-outlined">search</span>
          </Link>
          
          {user ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low border border-border-subtle p-1 pr-3 rounded-full transition-colors"
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-on-surface max-w-[100px] truncate">{user.name}</span>
                <span className="material-symbols-outlined text-text-muted text-[16px]">expand_more</span>
              </button>
              
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 bg-surface-white border border-border-subtle shadow-xl rounded-xl py-2 min-w-[200px] z-50">
                  <div className="px-4 py-2 border-b border-border-subtle mb-2">
                    <p className="text-xs text-text-muted">Signed in as</p>
                    <p className="text-sm font-bold text-on-surface truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-2 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors h-11"
            >
              Login
            </Link>
          )}

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

      {/* Bottom Row: Desktop Nav */}
      <div className="hidden md:block border-t border-border-subtle">
        <Suspense fallback={<nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto"></nav>}>
          <nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto custom-scrollbar">
            {baseNavLinks.map((link, index) => {
              // Insert the Dropdown after Best 10 Phones By Price (index 2)
              const renderDropdown = index === 2;
              const active = isActive(link.href);

              return (
                <div key={link.label} className="h-full flex items-center shrink-0 gap-4">
                  <Link
                    href={link.href}
                    className={`h-full flex items-center transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 ${
                      active 
                        ? "text-primary border-primary bg-surface-container-low/50" 
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>

                  {renderDropdown && (
                    <div className="relative h-full group flex items-center shrink-0">
                      <button className="h-full flex items-center gap-1 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent">
                        Best Phones for
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>
                      <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-surface-white border border-border-subtle shadow-lg rounded-xl py-2 min-w-[200px] z-50">
                        {bestPhonesLinks.map(child => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Dynamic Parent/Child Pages */}
            {dynamicPages.filter(p => p.pageType === 'PARENT' || (p.pageType === 'STANDALONE')).map((page) => {
              if (page.pageType === 'STANDALONE') {
                const active = isActive(`/pages/${page.slug}`);
                return (
                  <Link
                    key={page._id}
                    href={`/pages/${page.slug}`}
                    className={`h-full flex items-center shrink-0 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 ${
                      active ? "text-primary border-primary bg-surface-container-low/50" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {page.title}
                  </Link>
                );
              }

              // PARENT PAGE with dropdown
              const children = dynamicPages.filter(p => p.pageType === 'CHILD' && p.parentPage === page._id);
              return (
                <div key={page._id} className="relative h-full group flex items-center shrink-0">
                  <button className="h-full flex items-center gap-1 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent">
                    {page.title}
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                  {children.length > 0 && (
                    <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-surface-white border border-border-subtle shadow-lg rounded-xl py-2 min-w-[200px] z-50">
                      {children.map(child => (
                        <Link
                          key={child._id}
                          href={`/pages/${child.slug}`}
                          className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </Suspense>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-white border-t border-border-subtle animate-[slideDown_0.2s_ease-out]">
          <Suspense fallback={<nav className="flex flex-col p-4 gap-1"></nav>}>
            <nav className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-64px)] custom-scrollbar">
              
              {baseNavLinks.slice(0, 3).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                      active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Best Phones for */}
              <div className="flex flex-col mb-2 pb-2 border-b border-border-subtle">
                <span className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Best Phones for
                </span>
                {bestPhonesLinks.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {baseNavLinks.slice(3).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                      active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Mobile Dynamic Pages */}
              {dynamicPages.filter(p => p.pageType === 'PARENT' || (p.pageType === 'STANDALONE')).map((page) => {
                if (page.pageType === 'STANDALONE') {
                  const active = isActive(`/pages/${page.slug}`);
                  return (
                    <Link
                      key={page._id}
                      href={`/pages/${page.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                        active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                      }`}
                    >
                      {page.title}
                    </Link>
                  );
                }

                const children = dynamicPages.filter(p => p.pageType === 'CHILD' && p.parentPage === page._id);
                return (
                  <div key={page._id} className="flex flex-col gap-1 pl-2">
                    <span className="px-2 py-2 text-xs font-bold text-text-muted uppercase tracking-widest">{page.title}</span>
                    {children.map(child => {
                      const active = isActive(`/pages/${child.slug}`);
                      return (
                        <Link
                          key={child._id}
                          href={`/pages/${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold border-l-4 ${
                            active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                          }`}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}

              {user ? (
                <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">{user.name}</span>
                      <span className="text-xs text-text-muted truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide text-error hover:bg-error/10"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </Suspense>
        </div>
      )}
    </header>
  );
}
