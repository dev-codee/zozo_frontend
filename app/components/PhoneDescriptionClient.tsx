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

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let currentSection = ''; // 'pros-cons', 'faqs', 'normal'
  let pros: string[] = [];
  let cons: string[] = [];
  let prosConsSubState = 'pros'; // 'pros' or 'cons'
  let faqs: { question: string, answer: string }[] = [];
  let currentFAQ: { question: string, answer: string } | null = null;
  let normalBlockLines: string[] = [];

  const sectionHeaderRegex = /^(?:1?\d\.\s*)?(?:##\s*)?(Quick Verdict|Design|Display|Performance|Camera|Battery|Software|Audio|Connectivity|Gaming|Benchmarks|FAQs|Pros\s*&\s*Cons)(?:\s+(?:of|for)\s+.*)?$/i;

  const flushNormalBlock = (key: string | number) => {
    if (normalBlockLines.length === 0) return;
    const content = normalBlockLines.join('\n').trim();
    normalBlockLines = [];
    if (!content) return;

    // Check if list
    if (content.startsWith('- ') || content.startsWith('* ')) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 space-y-1.5 my-3 text-text-muted">
          {content.split('\n').map((line, lIdx) => {
            const lineText = line.replace(/^[-*]\s*/, '');
            return <li key={lIdx}>{boldPhoneName(lineText, phoneName)}</li>;
          })}
        </ul>
      );
    } else if (/^\d+\.\s*/.test(content)) {
      renderedElements.push(
        <ol key={`numlist-${key}`} className="list-decimal pl-6 space-y-1.5 my-3 text-text-muted">
          {content.split('\n').map((line, lIdx) => {
            const lineText = line.replace(/^\d+\.\s*/, '');
            return <li key={lIdx}>{boldPhoneName(lineText, phoneName)}</li>;
          })}
        </ol>
      );
    } else {
      renderedElements.push(
        <p key={`p-${key}`} className="text-text-muted leading-relaxed mb-4 text-sm md:text-base">
          {boldPhoneName(content, phoneName)}
        </p>
      );
    }
  };

  const flushSection = (key: string | number) => {
    if (currentSection === 'pros-cons') {
      if (pros.length > 0 || cons.length > 0) {
        renderedElements.push(
          <div key={`proscons-${key}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/10 rounded-xl p-5 shadow-sm">
              <h3 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">check_circle</span>
                Pros
              </h3>
              <ul className="space-y-2.5 text-sm text-text-muted">
                {pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base flex-shrink-0 mt-0.5">done</span>
                    <span>{boldPhoneName(pro, phoneName)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50 border border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/10 rounded-xl p-5 shadow-sm">
              <h3 className="text-rose-800 dark:text-rose-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-lg">cancel</span>
                Cons
              </h3>
              <ul className="space-y-2.5 text-sm text-text-muted">
                {cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-base flex-shrink-0 mt-0.5">close</span>
                    <span>{boldPhoneName(con, phoneName)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        pros = [];
        cons = [];
      }
    } else if (currentSection === 'faqs') {
      if (currentFAQ) {
        faqs.push(currentFAQ);
        currentFAQ = null;
      }
      if (faqs.length > 0) {
        renderedElements.push(
          <div key={`faqs-${key}`} className="space-y-3 my-6">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border border-border-subtle rounded-xl bg-surface-container-low/10 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-semibold text-sm md:text-base text-text-main hover:bg-surface-container-low/20 transition-colors">
                  <span className="flex items-start gap-2.5">
                    <span className="bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5">Q</span>
                    <span className="pr-4">{faq.question}</span>
                  </span>
                  <span className="material-symbols-outlined text-text-muted transition-transform duration-200 group-open:rotate-180 flex-shrink-0">keyboard_arrow_down</span>
                </summary>
                <div className="p-4 pt-0 text-sm md:text-base text-text-muted border-t border-border-subtle/30 bg-surface-white/50">
                  <div className="flex items-start gap-2.5 mt-3">
                    <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5">A</span>
                    <p className="leading-relaxed">{boldPhoneName(faq.answer, phoneName)}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        );
        faqs = [];
      }
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect empty line
    if (!line) {
      if (currentSection === 'normal') {
        flushNormalBlock(i);
      }
      continue;
    }

    // Detect section headers
    const headerMatch = line.match(sectionHeaderRegex);
    if (headerMatch) {
      // Flush previous content
      flushNormalBlock(i);
      flushSection(i);

      const sectionTitle = headerMatch[1].toLowerCase();
      // Remove any numbers or markdown characters to show a clean title
      const cleanTitle = line.replace(/^(?:\d+\.\s*)?#+\s*(?:\d+\.\s*)?/, '').trim();

      if (sectionTitle.includes('faq')) {
        currentSection = 'faqs';
      } else if (sectionTitle.includes('pros') && sectionTitle.includes('cons')) {
        currentSection = 'pros-cons';
        prosConsSubState = 'pros'; // reset to pros by default
      } else {
        currentSection = 'normal';
      }

      // Render the heading
      renderedElements.push(
        <h2 key={`heading-${i}`} className="font-headline-md text-xl font-bold text-text-main mt-8 mb-4 border-b border-border-subtle/50 pb-2 flex items-center gap-2">
          {sectionTitle.includes('faq') && <span className="material-symbols-outlined text-primary text-xl">help_outline</span>}
          {sectionTitle.includes('pros') && <span className="material-symbols-outlined text-primary text-xl">thumbs_up_down</span>}
          {boldPhoneName(cleanTitle, phoneName)}
        </h2>
      );
      continue;
    }

    // Process line depending on the current section
    if (currentSection === 'pros-cons') {
      const lowerLine = line.toLowerCase();
      // Check if we hit subheadings like "Pros" or "Cons"
      if (lowerLine.includes('pros') && !lowerLine.startsWith('+') && !lowerLine.startsWith('-') && !lowerLine.startsWith('*') && !lowerLine.startsWith('•')) {
        prosConsSubState = 'pros';
        continue;
      }
      if (lowerLine.includes('cons') && !lowerLine.startsWith('+') && !lowerLine.startsWith('-') && !lowerLine.startsWith('*') && !lowerLine.startsWith('•')) {
        prosConsSubState = 'cons';
        continue;
      }

      if (line.startsWith('+') || line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        const cleanLine = line.replace(/^[+\-*•]\s*/, '').trim();
        if (line.startsWith('+')) {
          pros.push(cleanLine);
        } else if (line.startsWith('-') && prosConsSubState === 'cons') {
          cons.push(cleanLine);
        } else if (line.startsWith('-') && prosConsSubState === 'pros') {
          pros.push(cleanLine);
        } else {
          if (prosConsSubState === 'pros') {
            pros.push(cleanLine);
          } else {
            cons.push(cleanLine);
          }
        }
      }
    } else if (currentSection === 'faqs') {
      // Look for Q: and A: or numbered Qs
      const qMatch = line.match(/^(?:Q|Question|Q\d+):\s*(.*)$/i);
      const aMatch = line.match(/^(?:A|Answer):\s*(.*)$/i);
      const numQMatch = line.match(/^\d+\.\s*(.*\?)$/i);

      if (qMatch || numQMatch) {
        if (currentFAQ) {
          faqs.push(currentFAQ);
        }
        currentFAQ = { question: qMatch ? qMatch[1] : numQMatch![1], answer: '' };
      } else if (aMatch) {
        if (currentFAQ) {
          currentFAQ.answer = aMatch[1];
        }
      } else {
        if (currentFAQ) {
          if (currentFAQ.answer) {
            currentFAQ.answer += ' ' + line;
          } else {
            currentFAQ.answer = line;
          }
        }
      }
    } else {
      // Normal section text block
      normalBlockLines.push(line);
    }
  }

  // Final flush
  flushNormalBlock('end');
  flushSection('end');

  return renderedElements;
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
