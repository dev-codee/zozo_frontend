"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const budgetPills = [
  { label: "Under 15k", value: 15000 },
  { label: "Under 30k", value: 30000 },
  { label: "Under 50k", value: 50000 },
  { label: "Under 80k", value: 80000 },
  { label: "Under 150k", value: 150000 },
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleBudget(maxPrice: number) {
    router.push(`/phones?max_price=${maxPrice}`);
  }

  return (
    <section className="w-full pt-20 pb-16 px-4 md:px-6 text-center bg-surface-white border-b border-border-subtle">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-6 leading-[1.1] tracking-tight">
          Find the Right Phone
          <br />
          at the{" "}
          <span className="text-primary-container">Right Price</span>
        </h1>
        <p className="text-lg text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Compare latest mobile phone prices in Pakistan across all top
          retailers. Make objective, data-driven purchasing decisions.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-surface-white border border-border-subtle rounded-xl p-2 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.05)] flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto relative z-10 hover:shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] transition-shadow duration-300"
        >
          <div className="flex-1 flex items-center px-4 py-2 w-full">
            <span className="material-symbols-outlined text-text-muted mr-3">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a mobile phone..."
              className="w-full bg-transparent border-none outline-none text-base text-on-surface placeholder:text-outline focus:ring-0 p-0"
              id="hero-search"
            />
          </div>
          <div className="w-px h-8 bg-border-subtle hidden md:block" />
          <div className="px-4 py-2 w-full md:w-auto shrink-0 flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-semibold tracking-wide text-on-surface-variant group-hover:text-primary transition-colors">
              Budget Range
            </span>
            <span className="material-symbols-outlined text-outline ml-2 group-hover:text-primary transition-colors">
              expand_more
            </span>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto bg-primary-container text-white rounded-lg px-8 py-3 font-semibold text-sm hover:bg-primary transition-colors h-11 shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Budget Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {budgetPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => handleBudget(pill.value)}
              className="bg-surface-container-low border border-border-subtle text-on-surface-variant rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary-container hover:text-white hover:border-primary-container transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
