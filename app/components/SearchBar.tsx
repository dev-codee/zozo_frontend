"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone } from "../lib/api";

export default function SearchBar({ className = "w-72" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`relative hidden md:block ${className}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search phones..."
          className="w-full bg-surface-container-low text-on-surface border border-border-subtle rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px] pointer-events-none">
          search
        </span>
      </form>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] bg-surface-white border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
          {query.trim() === "" ? (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[32px] opacity-50">search</span>
              Type to start searching...
            </div>
          ) : loading ? (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[32px] opacity-50 text-primary">progress_activity</span>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {results.map((phone) => (
                <Link
                  key={phone.slug}
                  href={`/${phone.slug}-price-in-pakistan`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-3 hover:bg-surface-container-lowest border-b border-border-subtle/50 last:border-b-0 transition-colors"
                >
                  <div className="w-12 h-12 shrink-0 bg-surface-container rounded-lg flex items-center justify-center p-1 overflow-hidden">
                    {phone.images?.[0]?.url ? (
                      <img
                        src={phone.images[0].url}
                        alt={phone.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-text-muted">smartphone</span>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-text-main truncate">
                      {phone.name}
                    </span>
                    <span className="text-xs text-text-muted truncate mt-0.5">
                      {phone.price_pkr ? `Rs. ${phone.price_pkr.toLocaleString()}` : 'Price TBA'}
                    </span>
                  </div>
                </Link>
              ))}
              <button 
                onClick={handleSearch}
                className="w-full block text-center p-3 text-sm text-primary font-bold hover:bg-surface-container-lowest transition-colors bg-surface-container-low/30 border-t border-border-subtle/50"
              >
                View all results
              </button>
            </div>
          ) : (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[32px] opacity-50">search_off</span>
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
