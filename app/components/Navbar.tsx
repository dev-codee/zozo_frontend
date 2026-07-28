import { getPages } from "@/app/lib/api";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const pages = await getPages();
  const headerPages = pages.filter((p: any) => 
    p.status === 'PUBLISHED' && 
    (p.placement === 'HEADER' || p.placement === 'BOTH')
  );

  return <NavbarClient dynamicPages={headerPages} />;
}
