"use client";

import { useState, useEffect } from "react";

export default function PhoneDescriptionClient({
  slug,
  initialDescription,
}: {
  slug: string;
  initialDescription?: string;
}) {
  const [description, setDescription] = useState<string | null>(
    initialDescription || null
  );
  const [loading, setLoading] = useState(!initialDescription);

  useEffect(() => {
    if (initialDescription) return;

    async function fetchDescription() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE_URL}/phones/${slug}/description`);
        if (res.ok) {
          const json = await res.json();
          setDescription(json.data?.description || null);
        }
      } catch (error) {
        console.error("Failed to fetch description", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDescription();
  }, [slug, initialDescription]);

  if (loading) {
    return (
      <section className="bg-surface-white border border-border-subtle rounded-xl p-6 md:p-8 mt-2 animate-pulse">
        <div className="h-7 bg-surface-container-low rounded w-1/4 mb-4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-5/6"></div>
          <div className="h-4 bg-surface-container-low rounded w-full mt-4"></div>
          <div className="h-4 bg-surface-container-low rounded w-4/5"></div>
        </div>
      </section>
    );
  }

  if (!description) return null;

  return (
    <section className="bg-surface-white border border-border-subtle rounded-xl p-6 md:p-8 mt-2">
      <h2 className="font-headline-md text-xl font-bold text-text-main mb-4">
        Overview
      </h2>
      <div className="prose prose-sm md:prose-base max-w-none text-text-main whitespace-pre-wrap">
        {description}
      </div>
    </section>
  );
}
