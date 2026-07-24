"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/app/lib/api";

const RAM_OPTIONS = ["4", "6", "8", "12", "16"];
const PROCESSOR_OPTIONS = ["Snapdragon", "MediaTek", "Apple", "Exynos"];
const DISPLAY_OPTIONS = ["AMOLED", "OLED", "LCD", "IPS"];
const CAMERA_OPTIONS = ["50 MP & above", "64 MP & above", "108 MP & above"];

export default function SidebarFilter({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  useEffect(() => {
    const brandsParam = searchParams.get("brand");
    if (brandsParam) setSelectedBrands(brandsParam.split(","));
    else setSelectedBrands([]);

    const ramsParam = searchParams.get("ram");
    if (ramsParam) setSelectedRams(ramsParam.split(","));
    else setSelectedRams([]);

    const procsParam = searchParams.get("processor");
    if (procsParam) setSelectedProcessors(procsParam.split(","));
    else setSelectedProcessors([]);

    const displaysParam = searchParams.get("display");
    if (displaysParam) setSelectedDisplays(displaysParam.split(","));
    else setSelectedDisplays([]);

    const camerasParam = searchParams.get("camera");
    if (camerasParam) setSelectedCameras(camerasParam.split(","));
    else setSelectedCameras([]);

    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  const updateFilters = (
    newBrands: string[], 
    min: string, 
    max: string, 
    newRams: string[], 
    newProcs: string[],
    newDisplays: string[],
    newCameras: string[]
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newBrands.length > 0) params.set("brand", newBrands.join(","));
    else params.delete("brand");

    if (newRams.length > 0) params.set("ram", newRams.join(","));
    else params.delete("ram");

    if (newProcs.length > 0) params.set("processor", newProcs.join(","));
    else params.delete("processor");

    if (newDisplays.length > 0) params.set("display", newDisplays.join(","));
    else params.delete("display");

    if (newCameras.length > 0) params.set("camera", newCameras.join(","));
    else params.delete("camera");

    if (min) params.set("min_price", min);
    else params.delete("min_price");

    if (max) params.set("max_price", max);
    else params.delete("max_price");

    // Reset page if pagination exists
    params.delete("page");

    router.push(`/phones?${params.toString()}`);
  };

  const handleBrandChange = (brandSlug: string) => {
    const updated = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter((b) => b !== brandSlug)
      : [...selectedBrands, brandSlug];
    setSelectedBrands(updated);
    updateFilters(updated, minPrice, maxPrice, selectedRams, selectedProcessors, selectedDisplays, selectedCameras);
  };

  const handleRamChange = (ram: string) => {
    const updated = selectedRams.includes(ram)
      ? selectedRams.filter((r) => r !== ram)
      : [...selectedRams, ram];
    setSelectedRams(updated);
    updateFilters(selectedBrands, minPrice, maxPrice, updated, selectedProcessors, selectedDisplays, selectedCameras);
  };

  const handleProcessorChange = (proc: string) => {
    const updated = selectedProcessors.includes(proc)
      ? selectedProcessors.filter((p) => p !== proc)
      : [...selectedProcessors, proc];
    setSelectedProcessors(updated);
    updateFilters(selectedBrands, minPrice, maxPrice, selectedRams, updated, selectedDisplays, selectedCameras);
  };

  const handleDisplayChange = (disp: string) => {
    const updated = selectedDisplays.includes(disp)
      ? selectedDisplays.filter((d) => d !== disp)
      : [...selectedDisplays, disp];
    setSelectedDisplays(updated);
    updateFilters(selectedBrands, minPrice, maxPrice, selectedRams, selectedProcessors, updated, selectedCameras);
  };

  const handleCameraChange = (cam: string) => {
    const updated = selectedCameras.includes(cam)
      ? selectedCameras.filter((c) => c !== cam)
      : [...selectedCameras, cam];
    setSelectedCameras(updated);
    updateFilters(selectedBrands, minPrice, maxPrice, selectedRams, selectedProcessors, selectedDisplays, updated);
  };

  const handlePriceApply = () => {
    updateFilters(selectedBrands, minPrice, maxPrice, selectedRams, selectedProcessors, selectedDisplays, selectedCameras);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
      {/* Price Range Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Price Range (PKR)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-2 bg-surface-container-high hover:bg-surface-dim text-text-main font-label-md text-label-md rounded-md transition-colors"
          >
            Apply Price
          </button>
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* Brand Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Brand
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {brands.map((brand) => (
            <label
              key={brand.slug}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => handleBrandChange(brand.slug)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* RAM Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          RAM
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {RAM_OPTIONS.map((ram) => (
            <label
              key={ram}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedRams.includes(ram)}
                onChange={() => handleRamChange(ram)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {ram} GB
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* Processor Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Processor
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {PROCESSOR_OPTIONS.map((proc) => (
            <label
              key={proc}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedProcessors.includes(proc)}
                onChange={() => handleProcessorChange(proc)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {proc}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* Display Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Display Type
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {DISPLAY_OPTIONS.map((disp) => (
            <label
              key={disp}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedDisplays.includes(disp)}
                onChange={() => handleDisplayChange(disp)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {disp}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* Camera Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Camera
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {CAMERA_OPTIONS.map((cam) => (
            <label
              key={cam}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCameras.includes(cam)}
                onChange={() => handleCameraChange(cam)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {cam}
              </span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
