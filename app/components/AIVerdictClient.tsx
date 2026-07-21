"use client";

import { useState, useEffect } from "react";
import { getAIComparisonVerdict } from "@/app/lib/api";

export default function AIVerdictClient({ slugs }: { slugs: string[] }) {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slugs.length < 2) {
      setVerdict(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setVerdict(null);

    getAIComparisonVerdict(slugs)
      .then((data) => {
        if (isMounted && data) {
          setVerdict(data);
        }
      })
      .catch((err) => console.error("Failed to fetch AI comparison", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slugs]);

  if (slugs.length < 2) {
    return (
      <div className="bg-surface-container-low/40 border border-border-subtle rounded-xl p-6 text-center text-text-muted text-sm font-medium">
        Add at least two phones to see the AI Verdict.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 md:p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
          <div className="h-6 bg-surface-container-low rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div className="bg-surface-white border border-primary/20 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
      {/* Subtle AI Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
        </div>
        <div>
          <h2 className="font-headline-md text-xl font-bold text-text-main">
            AI Verdict
          </h2>
          <p className="text-xs text-text-muted font-medium mt-0.5">
            Powered by ZOZO
          </p>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none text-text-main whitespace-pre-wrap relative z-10 leading-relaxed">
        {verdict}
      </div>
    </div>
  );
}
