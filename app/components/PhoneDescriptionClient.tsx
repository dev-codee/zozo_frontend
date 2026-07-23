"use client";

import { useState, useEffect } from "react";

function boldPhoneName(text: string, phoneName: string): React.ReactNode[] {
  if (!text) return [];
  const escapedPhoneName = phoneName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Match **bold** syntax or the phone name itself
  const pattern = new RegExp(`\\*\\*([^*]+)\\*\\*|(${escapedPhoneName})`, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-bold text-text-main">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-bold text-text-main">
          {match[2]}
        </strong>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseMarkdownToJSX(text: string, phoneName: string) {
  if (!text) return null;

  const sectionHeaderRegex = /^(?:1?\d\.\s*)?(Quick Verdict|Design|Display|Performance|Camera|Battery|Software|Audio|Connectivity|Gaming|Benchmarks|FAQs|Pros\s*&\s*Cons)(?:\s+(?:of|for)\s+.*)?$/i;
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check if markdown heading
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s*(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        const children = boldPhoneName(headingText, phoneName);
        if (level === 1) {
          return <h1 key={index} className="font-headline-lg text-2xl font-bold text-text-main mt-6 mb-3">{children}</h1>;
        } else if (level === 2) {
          return <h2 key={index} className="font-headline-md text-xl font-bold text-text-main mt-6 mb-3 border-b border-border-subtle/50 pb-2">{children}</h2>;
        } else {
          return <h3 key={index} className="font-headline-sm text-lg font-bold text-text-main mt-5 mb-2">{children}</h3>;
        }
      }
    }

    // Check if plain text heading matching our section headers
    if (trimmed.split('\n').length === 1 && sectionHeaderRegex.test(trimmed)) {
      return (
        <h2 key={index} className="font-headline-md text-xl font-bold text-text-main mt-6 mb-3 border-b border-border-subtle/50 pb-2">
          {boldPhoneName(trimmed, phoneName)}
        </h2>
      );
    }

    // Check if bulleted list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const lines = trimmed.split('\n');
      return (
        <ul key={index} className="list-disc pl-6 space-y-1.5 my-3 text-text-muted">
          {lines.map((line, lIndex) => {
            const lineText = line.replace(/^[-*]\s*/, '');
            return <li key={lIndex}>{boldPhoneName(lineText, phoneName)}</li>;
          })}
        </ul>
      );
    }

    // Check if numbered list
    if (/^\d+\.\s*/.test(trimmed)) {
      const lines = trimmed.split('\n');
      return (
        <ol key={index} className="list-decimal pl-6 space-y-1.5 my-3 text-text-muted">
          {lines.map((line, lIndex) => {
            const lineText = line.replace(/^\d+\.\s*/, '');
            return <li key={lIndex}>{boldPhoneName(lineText, phoneName)}</li>;
          })}
        </ol>
      );
    }

    // Paragraph
    return (
      <p key={index} className="text-text-muted leading-relaxed mb-4 text-sm md:text-base">
        {boldPhoneName(trimmed, phoneName)}
      </p>
    );
  });
}

export default function PhoneDescriptionClient({
  slug,
  initialDescription,
  phoneName = "Phone",
}: {
  slug: string;
  initialDescription?: string;
  phoneName?: string;
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
      <h2 className="font-headline-md text-2xl font-bold text-text-main mb-6 border-b border-border-subtle pb-3">
        Product Review & Overview
      </h2>
      <div className="prose prose-sm md:prose-base max-w-none text-text-main">
        {parseMarkdownToJSX(description, phoneName)}
      </div>
    </section>
  );
}
