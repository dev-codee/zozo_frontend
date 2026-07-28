"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/app/lib/api";

const RAM_OPTIONS = ["4", "6", "8", "12", "16"];
const PROCESSOR_OPTIONS = ["Snapdragon", "MediaTek", "Apple", "Exynos"];
const DISPLAY_OPTIONS = ["AMOLED", "OLED", "LCD", "IPS"];
const CAMERA_OPTIONS = ["50 MP & above", "64 MP & above", "108 MP & above"];
const NETWORK_OPTIONS = ["5G", "4G"];
const OS_UPDATE_OPTIONS = ["2 Years", "3 Years", "4+ Years"];
const BATTERY_OPTIONS = ["4000 mAh & above", "5000 mAh & above", "6000 mAh & above"];
const VIDEO_OPTIONS = ["4K", "8K"];

interface FilterState {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  rams: string[];
  processors: string[];
  displays: string[];
  cameras: string[];
  networks: string[];
  osUpdates: string[];
  batteries: string[];
  videos: string[];
}

export default function SidebarFilter({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [selectedOsUpdates, setSelectedOsUpdates] = useState<string[]>([]);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  useEffect(() => {
    const getParamArray = (param: string) => {
      const val = searchParams.get(param);
      return val ? val.split(",") : [];
    };

    setSelectedBrands(getParamArray("brand"));
    setSelectedRams(getParamArray("ram"));
    setSelectedProcessors(getParamArray("processor"));
    setSelectedDisplays(getParamArray("display"));
    setSelectedCameras(getParamArray("camera"));
    setSelectedNetworks(getParamArray("network"));
    setSelectedOsUpdates(getParamArray("os_updates"));
    setSelectedBatteries(getParamArray("battery"));
    setSelectedVideos(getParamArray("video"));

    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  const updateFilters = (state: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Helper to update param
    const updateParam = (key: string, arr?: string[]) => {
      if (arr && arr.length > 0) params.set(key, arr.join(","));
      else if (arr) params.delete(key);
    };

    if (state.brands !== undefined) updateParam("brand", state.brands);
    if (state.rams !== undefined) updateParam("ram", state.rams);
    if (state.processors !== undefined) updateParam("processor", state.processors);
    if (state.displays !== undefined) updateParam("display", state.displays);
    if (state.cameras !== undefined) updateParam("camera", state.cameras);
    if (state.networks !== undefined) updateParam("network", state.networks);
    if (state.osUpdates !== undefined) updateParam("os_updates", state.osUpdates);
    if (state.batteries !== undefined) updateParam("battery", state.batteries);
    if (state.videos !== undefined) updateParam("video", state.videos);

    if (state.minPrice !== undefined) {
      if (state.minPrice) params.set("min_price", state.minPrice);
      else params.delete("min_price");
    }
    
    if (state.maxPrice !== undefined) {
      if (state.maxPrice) params.set("max_price", state.maxPrice);
      else params.delete("max_price");
    }

    // Reset page if pagination exists
    params.delete("page");

    // Check if ONLY a single brand is selected and no other filters
    const filterKeys = Array.from(params.keys());
    if (
      filterKeys.length === 1 &&
      filterKeys[0] === "brand" &&
      params.get("brand")?.split(",").length === 1
    ) {
      router.push(`/${params.get("brand")}-phone-price-pakistan`);
      return;
    }

    router.push(`/phones?${params.toString()}`);
  };

  const handleToggle = (
    currentList: string[], 
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    stateKey: keyof FilterState
  ) => {
    const updated = currentList.includes(value)
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];
    setter(updated);
    updateFilters({ [stateKey]: updated });
  };

  const handlePriceApply = () => {
    updateFilters({ minPrice, maxPrice });
  };

  const boxClasses = "bg-white rounded-lg p-3 sm:p-4 border border-border-subtle shadow-sm";
  const titleClasses = "text-[11px] font-bold text-text-main mb-3 uppercase tracking-wider";

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
      {/* Price Range Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Price Range (PKR)</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-1.5 bg-surface-container-high hover:bg-surface-dim text-text-main text-xs font-semibold rounded-md transition-colors"
          >
            Apply Price
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Brand</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {brands.map((brand) => (
            <label key={brand.slug} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => handleToggle(selectedBrands, brand.slug, setSelectedBrands, "brands")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Network Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Network</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {NETWORK_OPTIONS.map((net) => (
            <label key={net} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedNetworks.includes(net)}
                onChange={() => handleToggle(selectedNetworks, net, setSelectedNetworks, "networks")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {net}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* OS Updates Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>OS Updates</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {OS_UPDATE_OPTIONS.map((os) => (
            <label key={os} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedOsUpdates.includes(os)}
                onChange={() => handleToggle(selectedOsUpdates, os, setSelectedOsUpdates, "osUpdates")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {os}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* RAM Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>RAM</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {RAM_OPTIONS.map((ram) => (
            <label key={ram} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedRams.includes(ram)}
                onChange={() => handleToggle(selectedRams, ram, setSelectedRams, "rams")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {ram} GB
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Processor Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Processor</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {PROCESSOR_OPTIONS.map((proc) => (
            <label key={proc} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedProcessors.includes(proc)}
                onChange={() => handleToggle(selectedProcessors, proc, setSelectedProcessors, "processors")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {proc}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Display Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Display Type</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {DISPLAY_OPTIONS.map((disp) => (
            <label key={disp} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedDisplays.includes(disp)}
                onChange={() => handleToggle(selectedDisplays, disp, setSelectedDisplays, "displays")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {disp}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Battery Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Battery</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {BATTERY_OPTIONS.map((bat) => (
            <label key={bat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBatteries.includes(bat)}
                onChange={() => handleToggle(selectedBatteries, bat, setSelectedBatteries, "batteries")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {bat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Camera Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Camera</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {CAMERA_OPTIONS.map((cam) => (
            <label key={cam} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCameras.includes(cam)}
                onChange={() => handleToggle(selectedCameras, cam, setSelectedCameras, "cameras")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {cam}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Video Recording Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Video Recording</h3>
        <div className="space-y-2 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {VIDEO_OPTIONS.map((vid) => (
            <label key={vid} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedVideos.includes(vid)}
                onChange={() => handleToggle(selectedVideos, vid, setSelectedVideos, "videos")}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="text-xs text-text-main group-hover:text-primary-container transition-colors">
                {vid}
              </span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
