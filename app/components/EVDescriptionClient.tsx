"use client";

import React, { useState } from "react";
import AppIcon from "./AppIcon";

interface EVDescriptionClientProps {
  description?: string;
  vehicleName: string;
  pros?: string[];
  cons?: string[];
  buyingAdvice?: string;
  faqs?: { question: string; answer: string }[];
}

export default function EVDescriptionClient({
  description,
  vehicleName,
  pros = [],
  cons = [],
  buyingAdvice,
  faqs = [],
}: EVDescriptionClientProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // If there's no description, pros/cons, buying advice, or FAQs, return null
  const hasContent = description || pros.length > 0 || cons.length > 0 || buyingAdvice || faqs.length > 0;
  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview / Description Card */}
      {description && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
            <AppIcon name="info" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              About the {vehicleName}
            </h2>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none text-text-main/90 leading-relaxed space-y-4 font-normal">
            {description.split("\n\n").map((paragraph, idx) => {
              if (paragraph.startsWith("##")) {
                return (
                  <h3 key={idx} className="text-base md:text-lg font-bold text-text-main pt-2">
                    {paragraph.replace(/^#+\s*/, "")}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-sm md:text-base leading-relaxed text-text-main/80">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </section>
      )}

      {/* Pros & Cons Section */}
      {(pros.length > 0 || cons.length > 0) && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
            <AppIcon name="thumbs_up_down" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              {vehicleName}: Pros & Cons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            {pros.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
                  <AppIcon name="check_circle" size={18} className="text-emerald-600" />
                  What We Like (Pros)
                </h3>
                <ul className="space-y-2.5">
                  {pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-text-main">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {cons.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5">
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
                  <AppIcon name="cancel" size={18} className="text-rose-600" />
                  Things to Consider (Cons)
                </h3>
                <ul className="space-y-2.5">
                  {cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-text-main">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Buying Advice */}
      {buyingAdvice && (
        <section className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AppIcon name="lightbulb" size={22} className="text-blue-600" />
            <h3 className="font-headline-md text-base md:text-lg font-bold text-text-main">
              ZOZO Buying Advice
            </h3>
          </div>
          <p className="text-xs md:text-sm text-text-main/90 leading-relaxed">
            {buyingAdvice}
          </p>
        </section>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
            <AppIcon name="quiz" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              Frequently Asked Questions about {vehicleName}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-border-subtle rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-xs md:text-sm text-text-main flex items-center justify-between gap-4 bg-surface-container-low/20 hover:bg-surface-container-low/40"
                  >
                    <span>{faq.question}</span>
                    <AppIcon
                      name="keyboard_arrow_down"
                      size={20}
                      className={`text-text-muted transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-2 bg-surface-white text-xs md:text-sm text-text-muted leading-relaxed border-t border-border-subtle/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
