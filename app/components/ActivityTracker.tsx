"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track actual page views, skip API routes or static files if any hit here
    if (pathname) {
      try {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'PAGE_VIEW',
            details: pathname
          }),
          credentials: 'include'
        });
      } catch (e) {
        // silently fail tracking
      }
    }
  }, [pathname]);

  return null;
}
