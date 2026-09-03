"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { createPortal } from "react-dom";
import { phoneCategoryGroups } from "../lib/phoneCategories";
import AppIcon from "./AppIcon";

export default function NavbarClient({
  dynamicPages = [],
  popularBrands = [],
}: {
  dynamicPages?: any[];
  popularBrands?: { slug: string; name: string }[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // "Best Phones for" dropdown — rendered via portal so it isn't clipped by the
  // nav's overflow-x-auto (which forces overflow-y clipping) or the header's
  // backdrop-filter containing block.
  const bestRef = useRef<HTMLDivElement>(null);
  const [bestOpen, setBestOpen] = useState(false);
  const [bestPos, setBestPos] = useState({ top: 0, left: 0 });
  const bestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const evsRef = useRef<HTMLDivElement>(null);
  const [evsOpen, setEvsOpen] = useState(false);
  const [evsPos, setEvsPos] = useState({ top: 0, left: 0 });
  const evsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const MEGA_WIDTH = 760;
  const openBest = () => {
    if (bestTimer.current) clearTimeout(bestTimer.current);
    const r = bestRef.current?.getBoundingClientRect();
    if (r) {
      // Anchor below the trigger, clamped so the wide panel stays in the viewport.
      const maxLeft = window.innerWidth - MEGA_WIDTH - 12;
      const left = Math.max(12, Math.min(r.left, maxLeft));
      setBestPos({ top: r.bottom, left });
    }
    setBestOpen(true);
  };
  const closeBestSoon = () => {
    if (bestTimer.current) clearTimeout(bestTimer.current);
    bestTimer.current = setTimeout(() => setBestOpen(false), 120);
  };

  const openEvs = () => {
    if (evsTimer.current) clearTimeout(evsTimer.current);
    const r = evsRef.current?.getBoundingClientRect();
    if (r) {
      const maxLeft = window.innerWidth - 200 - 12;
      const left = Math.max(12, Math.min(r.left, maxLeft));
      setEvsPos({ top: r.bottom, left });
    }
    setEvsOpen(true);
  };
  const closeEvsSoon = () => {
    if (evsTimer.current) clearTimeout(evsTimer.current);
    evsTimer.current = setTimeout(() => setEvsOpen(false), 120);
  };

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
    { label: "Top Phones", href: "#top-phones" },
    { label: "EVs", href: "#evs" },
    { label: "Up Coming Phones", href: "/phones?status=upcoming" },
    { label: "Compare", href: "/compare" },
    { label: "Brands", href: "/brands" },
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
          <Image
            src="/ZOZO-Logo-v2.png"
            alt="zozo.pk"
            width={180}
            height={48}
            priority
            className="h-12 md:h-14 w-auto object-contain"
          />
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
            <AppIcon name="search" size={20} />
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
                <AppIcon name="expand_more" size={16} className="text-text-muted" />
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
                    <AppIcon name="logout" size={18} />
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
            <AppIcon name={mobileOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Desktop Nav */}
      <div className="hidden md:block border-t border-border-subtle">
        <Suspense fallback={<nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto"></nav>}>
          <nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto custom-scrollbar">
            {baseNavLinks.map((link, index) => {
              // Insert the Dropdown at Top Phones (index 1) and EVs (index 2)
              const isBest = index === 1;
              const isEvs = index === 2;
              const renderDropdown = isBest || isEvs;
              const ref = isBest ? bestRef : (isEvs ? evsRef : null);
              const open = isBest ? bestOpen : evsOpen;
              const openFn = isBest ? openBest : openEvs;
              const closeFn = isBest ? closeBestSoon : closeEvsSoon;
              const setOpenFn = isBest ? setBestOpen : setEvsOpen;
              const active = isActive(link.href);

              return (
                <div key={link.label} className="h-full flex items-center shrink-0 gap-4">
                  {!renderDropdown ? (
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
                  ) : (
                    <div
                      ref={ref as any}
                      className="relative h-full flex items-center shrink-0"
                      onMouseEnter={openFn}
                      onMouseLeave={closeFn}
                    >
                      <button
                        onClick={() => (open ? setOpenFn(false) : openFn())}
                        aria-expanded={open}
                        className={`h-full flex items-center gap-1 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 border-transparent ${
                          open
                            ? "text-primary bg-surface-container-low/50"
                            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                        }`}
                      >
                        {link.label}
                        <AppIcon
                          name="expand_more"
                          size={16}
                          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
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
                    <AppIcon name="expand_more" size={16} />
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
              
              {baseNavLinks.slice(0, 1).map((link) => {
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

              {/* Mobile Top Phones Menu */}
              <div className="flex flex-col mb-2 pb-2 border-b border-border-subtle">
                <span className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Popular Brands
                </span>
                {popularBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/phones?brand=${brand.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  >
                    <AppIcon name="smartphone" size={18} className="text-text-muted" />
                    {brand.name}
                  </Link>
                ))}

                {phoneCategoryGroups.map((group) => (
                  <div key={group.title} className="flex flex-col mt-2">
                    <span className="px-4 pt-2 pb-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      {group.title}
                    </span>
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                      >
                        <AppIcon name={item.icon} size={18} className="text-text-muted" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              {/* Mobile EVs Menu */}
              <div className="flex flex-col mb-2 pb-2 border-b border-border-subtle">
                <span className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                  EVs
                </span>
                {['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/vehicles?category=${cat}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  >
                    {cat}s
                  </Link>
                ))}
                <Link
                  href="/vehicles/compare"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                >
                  <AppIcon name="compare_arrows" size={18} className="text-text-muted" />
                  Compare EVs
                </Link>
                <Link
                  href="/vehicles/comparisons"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                >
                  <AppIcon name="widgets" size={18} className="text-text-muted" />
                  All EV Comparisons
                </Link>
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
                    <AppIcon name="logout" size={18} />
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

      {/* "Best Phones for" mega-menu (portaled to escape overflow clipping) */}
      {mounted && bestOpen && createPortal(
        <div
          style={{ position: "fixed", top: bestPos.top, left: bestPos.left, width: MEGA_WIDTH, zIndex: 60 }}
          onMouseEnter={openBest}
          onMouseLeave={closeBestSoon}
          className="bg-surface-white border border-border-subtle shadow-xl rounded-2xl p-5 max-w-[calc(100vw-24px)] max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 pb-1.5 border-b border-border-subtle">
                Popular Brands
              </h3>
              <ul className="flex flex-col">
                {popularBrands.map((brand) => (
                  <li key={brand.slug}>
                    <Link
                      href={`/phones?brand=${brand.slug}`}
                      onClick={() => setBestOpen(false)}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors group"
                    >
                      <AppIcon name="smartphone" size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                      <span className="leading-tight">{brand.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {phoneCategoryGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 pb-1.5 border-b border-border-subtle">
                  {group.title}
                </h3>
                <ul className="flex flex-col">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setBestOpen(false)}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors group"
                      >
                        <AppIcon name={item.icon} size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                        <span className="leading-tight">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* EVs mega-menu */}
      {mounted && evsOpen && createPortal(
        <div
          style={{ position: "fixed", top: evsPos.top, left: evsPos.left, width: 200, zIndex: 60 }}
          onMouseEnter={openEvs}
          onMouseLeave={closeEvsSoon}
          className="bg-surface-white border border-border-subtle shadow-xl rounded-xl p-3 flex flex-col gap-1"
        >
          {['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'].map(cat => (
             <Link key={cat} href={`/vehicles?category=${cat}`} onClick={() => setEvsOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
               {cat}s
             </Link>
           ))}
           <div className="my-1 border-t border-border-subtle" />
           <Link href="/vehicles/compare" onClick={() => setEvsOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
             <AppIcon name="compare_arrows" size={18} className="text-text-muted" />
             Compare EVs
           </Link>
           <Link href="/vehicles/comparisons" onClick={() => setEvsOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
             <AppIcon name="widgets" size={18} className="text-text-muted" />
             All EV Comparisons
           </Link>
        </div>,
        document.body
      )}
    </header>
  );
}
