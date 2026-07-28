import { getPages } from "@/app/lib/api";
import NavbarClient from "./NavbarClient";
import { Suspense } from "react";

export default async function Navbar() {
  const pages = await getPages();
  const headerPages = pages.filter((p: any) => 
    p.status === 'PUBLISHED' && 
    (p.placement === 'HEADER' || p.placement === 'BOTH')
  );

  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-border-subtle bg-surface-white"></div>}>
      <NavbarClient dynamicPages={headerPages} />
    </Suspense>
  );
}
