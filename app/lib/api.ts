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
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
    ai_summary?: string;
    ai_pros?: string[];
    ai_cons?: string[];
    ai_buying_advice?: string;
    ai_snippet?: string;
    ai_suggested_tags?: string[];
    ai_keywords?: string[];
  };
  updated_at?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  phoneId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: PaginationInfo;
}

export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo?: string;
  total_phones?: number;
  phone_count?: number;
}

export interface VehiclePrice {
  retailer_slug?: string;
  retailer_name: string;
  variant?: string;
  price_pkr: number;
  stock_status?: string;
  product_url?: string;
  last_checked?: string;
}

export interface Vehicle {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  model_name?: string;
  variant_name?: string;
  model_year?: number;
  generation?: string;
  vehicle_type?: "BEV" | "PHEV" | "EREV" | "FCEV" | string;
  ev_category?: "Car" | "Bike" | "Scooter" | "Cycle" | "Rickshaw" | string;
  body_type?: string;
  segment?: string;
  platform?: string;
  doors?: number;
  seats?: number;
  status: "available" | "upcoming" | "announced" | "rumored" | "discontinued" | string;
  announcement_date?: string;
  release_date?: string;
  assembly_country?: string;
  made_in?: string;
  description?: string;
  tags?: string[];
  country_availability?: string[];
  video_url?: string;
  price_pkr?: number;
  images: { url: string; is_primary?: boolean; alt_text?: string }[];
  prices?: VehiclePrice[];
  pricing?: {
    price_global_base_usd?: number;
    price_global_base_cny?: number;
    price_global_base_eur?: number;
    price_pkr_ex_factory?: number;
    price_pkr_on_road?: number;
  };
  specs?: {
    battery?: {
      chemistry?: string;
      capacity_gross_kwh?: number;
      capacity_usable_kwh?: number;
      system_voltage?: number;
      thermal_management?: string;
      warranty_years?: number;
      warranty_distance_km?: number;
    };
    range_and_efficiency?: {
      wltp_combined_km?: number;
      wltp_consumption_kwh_100km?: number;
      epa_combined_km?: number;
      efficiency_mpge_combined?: number;
      cltc_range_km?: number;
      real_world_range_mild_km?: number;
      real_world_range_cold_km?: number;
      real_world_range_highway_km?: number;
      drag_coefficient_cd?: number;
    };
    charging?: {
      ac_max_power_kw?: number;
      ac_port_type?: string;
      ac_charge_time_0_100_hrs?: number;
      dc_max_power_kw?: number;
      dc_port_type?: string;
      dc_charge_time_10_80_min?: number;
      v2l_support?: boolean;
      v2h_support?: boolean;
      v2g_support?: boolean;
    };
    powertrain?: {
      drive_layout?: string;
      motor_count?: number;
      total_power_hp?: number;
      total_power_kw?: number;
      total_torque_nm?: number;
      acceleration_0_100_kmh?: number;
      acceleration_0_60_mph?: number;
      top_speed_kmh?: number;
    };
    dimensions_and_weight?: {
      length_mm?: number;
      width_mm?: number;
      height_mm?: number;
      wheelbase_mm?: number;
      ground_clearance_mm?: number;
      curb_weight_kg?: number;
      trunk_liters?: number;
      frunk_liters?: number;
      towing_braked_kg?: number;
      towing_unbraked_kg?: number;
    };
    chassis_and_suspension?: {
      front_suspension?: string;
      rear_suspension?: string;
      air_suspension?: boolean;
      turning_circle_m?: number;
      wheel_sizes_inches?: number[];
      tire_size?: string;
    };
    cockpit_and_tech?: {
      cockpit_os?: string;
      cockpit_chip?: string;
      center_screen_inches?: number;
      center_screen_features?: string;
      driver_cluster_inches?: number;
      hud?: string;
      apple_carplay?: string;
      android_auto?: string;
      audio_brand?: string;
      speaker_count?: number;
      wireless_chargers?: number;
      ota_updates?: string;
      heat_pump?: boolean;
    };
    adas_and_safety?: {
      euro_ncap_stars?: number;
      nhtsa_stars?: number;
      airbag_count?: number;
      autonomy_level?: string;
      adas_system_name?: string;
      lidar_count?: number;
      camera_count?: number;
      radar_count?: number;
      ultrasonic_count?: number;
      features?: string[];
    };
    extra_specs?: any;
  };
  ratings?: {
    overall?: number;
    range_efficiency?: number;
    charging_speed?: number;
    performance?: number;
    tech_cockpit?: number;
    safety_adas?: number;
    value_for_money?: number;
  };
  rating?: {
    average?: number;
    count?: number;
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
    ai_summary?: string;
    ai_editorial_summary?: string;
    ai_pros?: string[];
    ai_cons?: string[];
    ai_buying_advice?: string;
    ai_snippet?: string;
    ai_keywords?: string[];
  };
  competitor_slugs?: string[];
}

export interface VehicleDetailResponse {
  vehicle: Vehicle;
  variants?: Vehicle[];
}

export interface RelatedVehiclesResponse {
  by_brand?: Vehicle[];
  by_category?: Vehicle[];
  by_price?: Vehicle[];
}

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HomeData {
  trending: Phone[];
  latest: Phone[];
  brands: Brand[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPhones {
  phones: Phone[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0 && !envUrl.includes("undefined")) {
    return envUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:5000/api";
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const res = await fetch(`${baseUrl}${cleanEndpoint}`, {
      next: { revalidate: 60 },
      ...init,
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

export async function getVehicles(query?: string): Promise<PaginatedVehicles | null> {
  const endpoint = query ? `/vehicles?${query}` : "/vehicles";
  const data = await apiFetch<PaginatedVehicles>(endpoint, { cache: "no-store" });
  return data;
}

export async function getVehicleBySlug(slug: string): Promise<VehicleDetailResponse | null> {
  const data = await apiFetch<VehicleDetailResponse>(`/vehicles/${slug}`, { cache: "no-store" });
  return data;
}

export async function getRelatedVehicles(slug: string): Promise<RelatedVehiclesResponse | null> {
  const data = await apiFetch<RelatedVehiclesResponse>(`/vehicles/${slug}/related`, { cache: "no-store" });
  return data;
}

export async function getHomeData(): Promise<HomeData | null> {
  return apiFetch<HomeData>("/home");
}

export async function getPhones(query?: string): Promise<PaginatedPhones> {
  const endpoint = query ? `/phones?${query}` : "/phones";
  const data = await apiFetch<any>(endpoint);

  // Handle cached responses from before the pagination update
  if (Array.isArray(data)) {
    return { phones: data, pagination: { total: data.length, page: 1, limit: 15, totalPages: 1 } };
  }

  if (data && Array.isArray(data.phones)) {
    return data;
  }

  return { phones: [], pagination: { total: 0, page: 1, limit: 15, totalPages: 1 } };
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

export async function getRelatedPhones(slug: string): Promise<any> {
  return apiFetch<any>(`/phones/${slug}/related`);
}

export async function getComparisonData(slugs: string[]): Promise<Phone[]> {
  if (slugs.length === 0) return [];
  const data = await apiFetch<Phone[]>(`/compare?slugs=${slugs.join(",")}`);
  return data || [];
}

export async function getAIComparisonVerdict(slugs: string[]): Promise<{ verdict: string, key_differences: Record<string, string[]> } | null> {
  if (slugs.length < 2) return null;
  const data = await apiFetch<{ verdict: string, key_differences: Record<string, string[]> }>(`/compare/ai?slugs=${slugs.join(",")}`);
  return data || null;
}

export async function trackComparison(slugs: string[]): Promise<void> {
  if (slugs.length < 2) return;
  try {
    await fetch(`${getApiBaseUrl()}/compare/track`, {
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

// ─── Vehicle (EV) Comparison ────────────────────────────────────────────────────

export async function getVehicleComparisonData(slugs: string[]): Promise<Vehicle[]> {
  if (slugs.length === 0) return [];
  const data = await apiFetch<Vehicle[]>(`/vehicles/compare?slugs=${slugs.join(",")}`, { cache: "no-store" });
  return data || [];
}

export async function getAIVehicleComparison(slugs: string[]): Promise<{ verdict: string, key_differences: Record<string, string[]> } | null> {
  if (slugs.length < 2) return null;
  const data = await apiFetch<{ verdict: string, key_differences: Record<string, string[]> }>(`/vehicles/compare/ai?slugs=${slugs.join(",")}`);
  return data || null;
}

export async function trackVehicleComparison(slugs: string[]): Promise<void> {
  if (slugs.length < 2) return;
  try {
    await fetch(`${getApiBaseUrl()}/vehicles/compare/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slugs: slugs.join(",") }),
    });
  } catch (error) {
    console.error("Failed to track vehicle comparison:", error);
  }
}

export async function getPopularVehicleComparisons(limit: number = 8): Promise<any[]> {
  const data = await apiFetch<any[]>(`/vehicles/compare/popular?limit=${limit}`);
  return data || [];
}

// ─── Vehicle (EV) Reviews & Voting ──────────────────────────────────────────────

export interface VehicleReview {
  _id: string;
  vehicleId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedVehicleReviews {
  reviews: VehicleReview[];
  pagination: PaginationInfo;
}

export async function getVehicleReviews(vehicleId: string, page = 1, limit = 6): Promise<PaginatedVehicleReviews> {
  const data = await apiFetch<any>(`/vehicle-reviews/${vehicleId}?page=${page}&limit=${limit}`);

  if (Array.isArray(data)) {
    return { reviews: data, pagination: { total: data.length, page: 1, limit: 6, totalPages: 1 } };
  }

  return data || { reviews: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } };
}

export async function postVehicleReview(payload: { vehicleId: string; rating: number; comment: string }): Promise<VehicleReview> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/vehicle-reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to submit review");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error submitting vehicle review:", error);
    throw error;
  }
}

export async function getVehicleVoteStats(vehicleId: string): Promise<any> {
  const data = await apiFetch<any>(`/vehicle-votes/${vehicleId}/stats`);
  return data || null;
}

export async function castVehicleVote(payload: { vehicleId: string; sessionId: string; pollType: string; value: any }): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/vehicle-votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to cast vote");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error casting vehicle vote:", error);
    throw error;
  }
}

export async function getPages(): Promise<any[]> {
  const data = await fetch(`${getApiBaseUrl()}/pages`, {
    next: { revalidate: 60 }
  }).then(res => res.json()).catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function getVoteStats(phoneId: string): Promise<any> {
  const data = await apiFetch<any>(`/votes/${phoneId}/stats`);
  return data || null;
}

export async function castVote(payload: { phoneId: string; sessionId: string; pollType: string; value: any }): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to cast vote");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
}

export async function getReviews(phoneId: string, page = 1, limit = 6): Promise<PaginatedReviews> {
  const data = await apiFetch<any>(`/reviews/${phoneId}?page=${page}&limit=${limit}`);

  if (Array.isArray(data)) {
    return { reviews: data, pagination: { total: data.length, page: 1, limit: 6, totalPages: 1 } };
  }

  return data || { reviews: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } };
}

export async function postReview(payload: { phoneId: string; rating: number; comment: string }): Promise<Review> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to submit review");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}
