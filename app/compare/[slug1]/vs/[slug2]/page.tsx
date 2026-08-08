import { redirect } from "next/navigation";

export default async function LegacyComparePage({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}) {
  const { slug1, slug2 } = await params;
  redirect(`/compare/${slug1}-vs-${slug2}`);
}
