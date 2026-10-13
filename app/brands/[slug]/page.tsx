import { notFound } from "next/navigation";
import { getBrands } from "@/app/lib/api";
import PhonesPage, { generateMetadata as phonesMetadata } from "@/app/phones/page";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function brandSearchParams({ params, searchParams }: Props) {
  const { slug } = await params;
  const brands = await getBrands("phone");
  if (!brands.some((brand) => brand.slug === slug)) notFound();
  return { ...(await searchParams), brand: slug };
}

export async function generateMetadata(props: Props) {
  return phonesMetadata({ searchParams: Promise.resolve(await brandSearchParams(props)) });
}

export default async function BrandPage(props: Props) {
  return PhonesPage({ searchParams: Promise.resolve(await brandSearchParams(props)) });
}
