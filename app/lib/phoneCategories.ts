// Curated "Best Phones for …" categories shown in the Navbar mega-menu.
// Each item maps to real, working /phones filters (verified against the data),
// plus a display-only `for` param that sets the landing page title.

export interface PhoneCategoryItem {
  label: string; // short label shown in the menu
  icon: string; // material-symbols icon name
  href: string;
}

export interface PhoneCategoryGroup {
  title: string;
  items: PhoneCategoryItem[];
}

// filters: the actual query the API understands. title: the landing page H1.
const build = (filters: string, title: string) =>
  `/phones?${filters}&for=${encodeURIComponent(title)}`;

export const phoneCategoryGroups: PhoneCategoryGroup[] = [
  {
    title: "Profession & Study",
    items: [
      { label: "Students", icon: "school", href: build("max_price=45000", "Best Phones for Students") },
      { label: "Teachers", icon: "menu_book", href: build("battery=5000", "Best Phones for Teachers") },
      { label: "Doctors", icon: "medical_services", href: build("ram=8,12,16", "Best Phones for Doctors") },
      { label: "Engineers", icon: "engineering", href: build("ram=8,12,16", "Best Phones for Engineers") },
      { label: "Software Developers", icon: "code", href: build("ram=8,12,16&storage=256,512,1024", "Best Phones for Software Developers") },
      { label: "Architects", icon: "architecture", href: build("storage=256,512,1024", "Best Phones for Architects") },
      { label: "Designers", icon: "palette", href: build("display=AMOLED", "Best Phones for Designers") },
      { label: "Business Professionals", icon: "business_center", href: build("battery=5000", "Best Phones for Business Professionals") },
    ],
  },
  {
    title: "Lifestyle & Creators",
    items: [
      { label: "Photographers", icon: "photo_camera", href: build("camera=64", "Best Phones for Photographers") },
      { label: "Videographers", icon: "videocam", href: build("video=4K", "Best Phones for Videographers") },
      { label: "Gamers", icon: "sports_esports", href: build("ram=8,12,16", "Best Phones for Gamers") },
      { label: "Content Creators", icon: "movie", href: build("camera=50", "Best Phones for Content Creators") },
      { label: "Travelers", icon: "flight", href: build("battery=6000", "Best Phones for Travelers") },
      { label: "Seniors", icon: "elderly", href: build("max_price=30000", "Best Phones for Seniors") },
      { label: "Kids", icon: "child_care", href: build("max_price=20000", "Best Phones for Kids") },
      { label: "Outdoor Workers", icon: "hiking", href: build("battery=6000", "Best Phones for Outdoor Workers") },
    ],
  },
  {
    title: "By Need & Feature",
    items: [
      { label: "Budget Buyers", icon: "savings", href: build("max_price=25000", "Best Phones for Budget Buyers") },
      { label: "Battery Life", icon: "battery_charging_full", href: build("battery=6000", "Best Phones for Battery Life") },
      { label: "Camera Lovers", icon: "camera", href: build("camera=108", "Best Phones for Camera Lovers") },
      { label: "AI Features", icon: "smart_toy", href: build("sort=latest", "Best Phones for AI Features") },
      { label: "Multitasking", icon: "dashboard", href: build("ram=8,12,16", "Best Phones for Multitasking") },
      { label: "Heavy Users", icon: "bolt", href: build("battery=6000&ram=8,12,16", "Best Phones for Heavy Users") },
      { label: "Frequent Video Calls", icon: "call", href: build("network=5G", "Best Phones for Frequent Video Calls") },
      { label: "Privacy & Security", icon: "lock", href: build("sort=latest", "Best Phones for Privacy & Security") },
      { label: "Mobile Office", icon: "work", href: build("storage=256,512,1024", "Best Phones for Mobile Office") },
      { label: "Remote Work", icon: "wifi", href: build("network=5G", "Best Phones for Remote Work") },
      { label: "Camera Phones Under 60k", icon: "photo_camera", href: build("camera=50&max_price=60000", "Best Camera Phones in Pakistan Under 60k") },
    ],
  },
];

export const phoneCategoriesFlat: PhoneCategoryItem[] = phoneCategoryGroups.flatMap((g) => g.items);
