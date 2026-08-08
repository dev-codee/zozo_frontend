import { redirect } from "next/navigation";

export default async function LegacyCompareRedirect({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}) {
  const resolvedParams = await params;
  const { slug1, slug2 } = resolvedParams;
  redirect(`/compare/${slug1}-vs-${slug2}`);
}

