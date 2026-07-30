export default function AIVerdictClient({ verdict, loading, hasEnoughPhones }: { verdict: string | null, loading: boolean, hasEnoughPhones: boolean }) {
  if (!hasEnoughPhones) {
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
          <h3 className="font-headline-sm text-lg font-bold text-text-main">
            AI Verdict
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-full"></div>
          <div className="h-4 bg-surface-container-high rounded w-5/6"></div>
          <div className="h-4 bg-surface-container-high rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-surface-white border border-primary/20 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
        </div>
        <h3 className="font-headline-sm text-lg font-bold text-text-main flex items-center gap-2">
          AI Verdict
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
        </h3>
      </div>
      
      <div className="prose prose-sm md:prose-base prose-neutral max-w-none relative z-10">
        <p className="text-text-main/90 leading-relaxed m-0">
          {verdict}
        </p>
      </div>
    </div>
  );
}
