"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Phone } from "@/app/lib/api";
import SubmitBenchmarkModal from "./SubmitBenchmarkModal";
import { useAuth } from "@/app/context/AuthContext";
import AppIcon from "./AppIcon";

export default function SubmitBenchmarkWrapper({ phone }: { phone: Phone }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const handleOpen = () => {
    if (!user) {
      const redirectUrl = encodeURIComponent(pathname + '?' + searchParams.toString());
      router.push(`/login?redirect=${redirectUrl}`);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="col-span-full flex justify-center py-5 bg-surface-white mt-4 border-t border-border-subtle/50 pt-4">
        <button 
          onClick={handleOpen} 
          className="flex items-center gap-2 text-text-main hover:text-primary font-semibold text-sm px-5 py-2.5 bg-surface-container-low hover:bg-primary/10 rounded-xl transition-colors border border-border-subtle hover:border-primary/30 cursor-pointer"
        >
          <AppIcon name="description" size={20} />
          Submit your benchmark results
        </button>
      </div>
      <SubmitBenchmarkModal isOpen={isOpen} onClose={() => setIsOpen(false)} phone={phone} />
    </>
  );
}
