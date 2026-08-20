'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-24 flex flex-col items-center justify-center text-center min-h-[60vh] bg-surface">
      <span className="material-symbols-outlined text-[64px] text-outline mb-4">
        error
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-text-main mb-2">
        Something went wrong
      </h1>
      <p className="text-text-muted max-w-md mx-auto mb-6">
        We hit an unexpected problem loading this page. Please try again in a moment.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold text-sm px-5 h-10 rounded-lg flex items-center justify-center transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-border-subtle bg-surface-white hover:bg-surface-container-low text-text-main font-semibold text-sm px-5 h-10 rounded-lg flex items-center justify-center transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
