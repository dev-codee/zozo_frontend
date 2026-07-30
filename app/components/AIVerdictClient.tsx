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
      

      <div className="prose prose-sm md:prose-base prose-neutral max-w-none relative z-10">
        <p className="text-text-main/90 leading-relaxed m-0">
          {verdict}
        </p>
      </div>
    </div>
  );
}
