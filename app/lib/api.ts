// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhoneImage {
  url: string;
  cloud_public_id: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface PhonePrice {
  retailer_slug: string;
  retailer_name: string;
  variant?: string;
  price_pkr: number;
  stock_status?: string;
  product_url?: string;
}

export interface Phone {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  status: "available" | "upcoming" | "discontinued" | "out_of_stock";
  description?: string;
  release_date?: string;
  images: PhoneImage[];
  model_number?: string;
  series?: string;
  category?: string;
  subcategory?: string;
  country_availability?: string[];
  carrier_version?: string;
  region_version?: string;
  manufacturer?: string;
  made_in?: string;
  video_url?: string;
  specs: {
    performance?: {
      ram_options_gb?: number[];
      storage_options_gb?: number[];
      chipset?: string;
      cpu?: string;
      gpu?: string;
      expandable_storage?: boolean;
    };
    battery?: {
      capacity_mah?: number;
      charging_watts?: number;
      fast_charging?: boolean;
      wireless_charging?: boolean;
    };
    camera?: {
      rear_summary?: string;
      front_summary?: string;
      video_recording?: string;
    };
    display?: {
      size_inches?: number;
      type?: string;
      resolution?: string;
      refresh_rate_hz?: number;
      protection?: string;
      peak_brightness_nits?: number;
    };
    body?: {
      height_mm?: number;
      width_mm?: number;
      thickness_mm?: number;
      weight_g?: number;
      materials?: string;
      water_resistance?: string;
    };
    connectivity?: {
      network?: string;
      sim?: string;
      usb?: string;
      bluetooth?: string;
      nfc?: boolean;
    };
    os?: string;
    ai_features?: string[];
    extra_specs?: any;
  };
  prices: PhonePrice[];
  price_pkr?: number;
  pta_tax?: {
    passport_pkr?: number;
    cnic_pkr?: number;
    last_updated?: string;
    source_note?: string;
  };
  tags?: string[];
  rating: {
    average: number;
    count: number;
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
  };
}

export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo?: string;
}

export interface HomeData {
  trending: Phone[];
  latest: Phone[];
  brands: Brand[];
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 60 }, // ISR — revalidate every 60s
    });

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText} for ${endpoint}`);
      return null;
    }

    const json: ApiResponse<T> = await res.json();
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getHomeData(): Promise<HomeData | null> {
  return apiFetch<HomeData>("/home");
}

export async function getPhones(query?: string): Promise<Phone[]> {
  const endpoint = query ? `/phones?${query}` : "/phones";
  const data = await apiFetch<Phone[]>(endpoint);
  return data || [];
}

export async function searchPhones(q: string): Promise<Phone[]> {
  const data = await apiFetch<Phone[]>(`/search?q=${encodeURIComponent(q)}`);
  return data || [];
}

export async function getBrands(): Promise<Brand[]> {
  const data = await apiFetch<Brand[]>("/brands");
  return data || [];
}

export async function getPhoneBySlug(slug: string): Promise<Phone | null> {
  return apiFetch<Phone>(`/phones/${slug}`);
}

export async function getComparisonData(slugs: string[]): Promise<Phone[]> {
  if (slugs.length === 0) return [];
  const data = await apiFetch<Phone[]>(`/compare?slugs=${slugs.join(",")}`);
  return data || [];
}

export async function getAIComparisonVerdict(slugs: string[]): Promise<string | null> {
  if (slugs.length < 2) return null;
  const data = await apiFetch<{ verdict: string }>(`/compare/ai?slugs=${slugs.join(",")}`);
  return data?.verdict || null;
}

export async function trackComparison(slugs: string[]): Promise<void> {
  if (slugs.length < 2) return;
  try {
    await fetch(`${API_BASE_URL}/compare/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slugs: slugs.join(",") }),
    });
  } catch (error) {
    console.error("Failed to track comparison:", error);
  }
}

export async function getPopularComparisons(limit: number = 5): Promise<any[]> {
  const data = await apiFetch<any[]>(`/compare/popular?limit=${limit}`);
  return data || [];
}
