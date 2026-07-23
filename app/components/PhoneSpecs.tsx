import { Phone } from "@/app/lib/api";

interface PhoneSpecsProps {
  specs: Phone["specs"];
  className?: string;
}

// ─── Rating Calculators ──────────────────────────────────────────────────────

function getPerformanceRating(specs: Phone["specs"]) {
  let score = 5.5; // Base score
  const chipset = (specs.performance?.chipset || "").toLowerCase();
  const ram = specs.performance?.ram_options_gb || [];
  const maxRam = ram.length ? Math.max(...ram) : 4;

  if (chipset.includes("snapdragon 8 elite") || chipset.includes("apple a18 pro") || chipset.includes("dimensity 9400") || chipset.includes("8s gen 4") || chipset.includes("7s gen 4")) {
    if (chipset.includes("7s gen 4")) {
      score = 8.2;
    } else {
      score = 9.8;
    }
  } else if (chipset.includes("snapdragon 8 gen 3") || chipset.includes("apple a18") || chipset.includes("apple a17 pro") || chipset.includes("dimensity 9300")) {
    score = 9.5;
  } else if (chipset.includes("snapdragon 8 gen 2") || chipset.includes("dimensity 9200") || chipset.includes("tensor g4")) {
    score = 9.0;
  } else if (chipset.includes("snapdragon 8 gen 1") || chipset.includes("snapdragon 8+") || chipset.includes("dimensity 9000") || chipset.includes("tensor g3")) {
    score = 8.5;
  } else if (chipset.includes("snapdragon 7") || chipset.includes("dimensity 8")) {
    score = 8.0;
  } else if (chipset.includes("snapdragon 6") || chipset.includes("dimensity 7") || chipset.includes("dimensity 6")) {
    score = 7.0;
  } else if (chipset.includes("helio g99") || chipset.includes("helio g96") || chipset.includes("helio g95")) {
    score = 6.5;
  } else if (chipset.includes("helio") || chipset.includes("unisoc")) {
    score = 5.2;
  }

  if (maxRam >= 16) score += 0.2;
  else if (maxRam >= 12) score += 0.1;
  else if (maxRam <= 4) score -= 0.5;

  score = Math.min(10.0, Math.max(1.0, score));

  let label = "Average";
  if (score >= 9.0) label = "Excellent";
  else if (score >= 8.0) label = "Very Good";
  else if (score >= 7.0) label = "Good";
  else if (score >= 5.0) label = "Average";
  else label = "Entry";

  return { score, label };
}

function getDisplayRating(specs: Phone["specs"]) {
  let score = 6.0;
  const display = specs.display || {};
  const refresh = display.refresh_rate_hz || 60;
  const type = (display.type || "").toLowerCase();
  const resolution = (display.resolution || "").toLowerCase();

  if (type.includes("amoled") || type.includes("oled") || type.includes("ltpo")) {
    score += 1.5;
  } else if (type.includes("ips") || type.includes("lcd")) {
    score += 0.5;
  }

  if (refresh >= 144) score += 1.5;
  else if (refresh >= 120) score += 1.2;
  else if (refresh >= 90) score += 0.6;

  if (resolution.includes("4k") || resolution.includes("3840")) score += 1.0;
  else if (resolution.includes("1440") || resolution.includes("2k") || resolution.includes("qhd")) score += 0.8;
  else if (resolution.includes("1080") || resolution.includes("fhd")) score += 0.4;

  score = Math.min(10.0, Math.max(1.0, score));

  let label = "Average";
  if (score >= 9.0) label = "Excellent";
  else if (score >= 8.0) label = "Very Good";
  else if (score >= 7.0) label = "Good";
  else if (score >= 5.0) label = "Average";
  else label = "Entry";

  return { score, label };
}

function getCameraRating(specs: Phone["specs"]) {
  let score = 5.5;
  const camera = specs.camera || {};
  const rear = (camera.rear_summary || "").toLowerCase();
  const video = (camera.video_recording || "").toLowerCase();

  if (rear.includes("200 mp")) score += 2.0;
  else if (rear.includes("108 mp")) score += 1.5;
  else if (rear.includes("50 mp")) score += 1.2;
  else if (rear.includes("48 mp") || rear.includes("64 mp")) score += 1.0;

  if (rear.includes("ois")) score += 1.0;
  if (rear.includes("telephoto") || rear.includes("periscope")) score += 1.0;
  if (rear.includes("triple") || rear.includes("quad")) score += 0.5;

  if (video.includes("8k")) score += 1.0;
  else if (video.includes("4k@60fps")) score += 0.8;
  else if (video.includes("4k")) score += 0.5;

  score = Math.min(10.0, Math.max(1.0, score));

  let label = "Average";
  if (score >= 9.0) label = "Excellent";
  else if (score >= 8.0) label = "Very Good";
  else if (score >= 7.0) label = "Good";
  else if (score >= 5.0) label = "Average";
  else label = "Entry";

  return { score, label };
}

function getBatteryRating(specs: Phone["specs"]) {
  let score = 6.0;
  const battery = specs.battery || {};
  const capacity = battery.capacity_mah || 4000;
  const charging = battery.charging_watts || 15;

  if (capacity >= 6000) score += 2.0;
  else if (capacity >= 5500) score += 1.6;
  else if (capacity >= 5000) score += 1.2;
  else if (capacity >= 4500) score += 0.7;

  if (charging >= 120) score += 2.0;
  else if (charging >= 80) score += 1.6;
  else if (charging >= 67) score += 1.2;
  else if (charging >= 45) score += 0.9;
  else if (charging >= 33) score += 0.6;
  else if (charging >= 25) score += 0.4;

  if (battery.wireless_charging) score += 0.5;

  score = Math.min(10.0, Math.max(1.0, score));

  let label = "Average";
  if (score >= 9.0) label = "Excellent";
  else if (score >= 8.0) label = "Very Good";
  else if (score >= 7.0) label = "Good";
  else if (score >= 5.0) label = "Average";
  else label = "Entry";

  return { score, label };
}

function getRatingColors(label: string) {
  switch (label) {
    case "Excellent": return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
    case "Very Good": return { bar: "bg-green-500", text: "text-green-600 dark:text-green-400" };
    case "Good": return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
    case "Average": return { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" };
    default: return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhoneSpecs({ specs, className = "" }: PhoneSpecsProps) {
  const ext = specs.extra_specs || {};

  const chipset = specs.performance?.chipset || "";
  let fabrication = ext.processor?.fabrication || "";
  let chipsetClean = chipset;
  if (!fabrication) {
    const fabMatch = chipset.match(/\((\d+\s*nm)\)/i) || chipset.match(/(\d+\s*nm)/i);
    if (fabMatch) {
      fabrication = fabMatch[1];
      chipsetClean = chipset.replace(/\(\d+\s*nm\)/i, "").replace(/\s\s+/g, " ").trim();
    }
  }

  let ramType = ext.ram_storage?.ram_type || "LPDDR4X";
  const chipsetLower = chipset.toLowerCase();
  if (!ext.ram_storage?.ram_type) {
    if (
      chipsetLower.includes("snapdragon 8") ||
      chipsetLower.includes("snapdragon 7+ gen") ||
      chipsetLower.includes("apple a17") ||
      chipsetLower.includes("apple a18") ||
      chipsetLower.includes("dimensity 9") ||
      chipsetLower.includes("dimensity 8300") ||
      chipsetLower.includes("tensor g") ||
      chipsetLower.includes("elite")
    ) {
      ramType = "LPDDR5X";
    } else if (chipsetLower.includes("lpddr5")) {
      ramType = "LPDDR5";
    }
  }

  const processorDisplay = ext.processor?.cpu_name || (specs.performance?.cpu ? specs.performance.cpu.replace(/Octa-core/i, "Octa core").trim() : "");

  const ratings = {
    performance: getPerformanceRating(specs),
    display: getDisplayRating(specs),
    camera: getCameraRating(specs),
    battery: getBatteryRating(specs),
  };

  const renderRow = (label: string, value: React.ReactNode) => {
    if (!value || value === "false") return null;
    if (value === "true" || value === true) value = "Yes";
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      value = value.join(", ");
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-1.5 px-6 border-b border-border-subtle last:border-b-0 hover:bg-surface-container-lowest/40 transition-colors duration-150">
        <span className="text-text-main font-bold text-sm capitalize">{label.replace(/_/g, " ")}</span>
        <span className="text-text-main text-sm font-normal leading-relaxed">{value}</span>
      </div>
    );
  };

  const renderSection = (
    id: string,
    title: string,
    icon: string,
    rows: React.ReactNode,
    rating?: { score: number; label: string }
  ) => {
    // Determine if the rows fragment actually contains any rendered rows
    if (!rows || (rows as any).props?.children?.length === 0 || (rows as any).props?.children?.every((c: any) => c === null)) {
      // We'll just render it anyway, empty rows usually evaluate to empty divs internally
    }
    const colors = rating ? getRatingColors(rating.label) : null;

    return (
      <details open className="group flex flex-col">
        <summary className="w-full p-5 md:px-6 flex items-center justify-between cursor-pointer select-none bg-surface-container-low/20 hover:bg-surface-container-low/40 transition-colors duration-200 list-none [&::-webkit-details-marker]:hidden border-none outline-none text-left">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-text-muted text-[22px]">{icon}</span>
            <span className="font-headline-sm text-base md:text-lg font-bold text-text-main">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto mr-4">
            {rating && colors && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block w-16 md:w-24 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors.bar} transition-all duration-500`} style={{ width: `${rating.score * 10}%` }} />
                </div>
                <span className={`text-xs font-semibold ${colors.text}`}>({rating.label})</span>
              </div>
            )}
          </div>
          <span className="material-symbols-outlined text-text-muted transition-transform duration-200 group-open:rotate-180">keyboard_arrow_down</span>
        </summary>
        <div className="flex flex-col bg-surface-white divide-y divide-border-subtle/30">
          {rows}
        </div>
      </details>
    );
  };

  return (
    <section className={`bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-border-subtle ${className}`}>
      {renderSection("performance", "Performance", "memory", (
        <>
          {renderRow("Chipset", chipsetClean || specs.performance?.chipset)}
          {renderRow("Processor", processorDisplay)}
          {renderRow("Fabrication", fabrication)}
          {renderRow("CPU Cores", ext.processor?.cpu_cores)}
          {renderRow("CPU Clock", ext.processor?.cpu_clock)}
          {renderRow("Graphics (GPU)", specs.performance?.gpu)}
          {renderRow("GPU Clock", ext.processor?.gpu_clock)}
          {renderRow("NPU / AI Engine", ext.processor?.npu || ext.processor?.ai_engine)}
          {renderRow("ISP", ext.processor?.isp)}
          {renderRow("RAM", specs.performance?.ram_options_gb?.length ? `${specs.performance.ram_options_gb.join(" GB / ")} GB` : "")}
          {renderRow("RAM Type", specs.performance?.ram_options_gb?.length ? ramType : "")}
          {renderRow("RAM Speed", ext.ram_storage?.ram_speed)}
          {renderRow("Storage Options", specs.performance?.storage_options_gb?.length ? `${specs.performance.storage_options_gb.join(" GB / ")} GB` : "")}
          {renderRow("Storage Type", ext.ram_storage?.storage_type)}
          {specs.performance?.expandable_storage !== undefined && renderRow("Expandable Storage", specs.performance.expandable_storage ? (ext.ram_storage?.max_expansion || "Yes") : "No")}
        </>
      ), ratings.performance)}

      {renderSection("display", "Display", "smartphone", (
        <>
          {specs.display?.size_inches && renderRow("Size", `${specs.display.size_inches} inches`)}
          {renderRow("Type", specs.display?.type)}
          {renderRow("Resolution", specs.display?.resolution)}
          {renderRow("Pixels", ext.features_listing?.pixels)}
          {renderRow("PPI", ext.features_listing?.ppi)}
          {renderRow("Aspect Ratio", ext.features_listing?.aspect_ratio)}
          {specs.display?.refresh_rate_hz && renderRow("Refresh Rate", `${specs.display.refresh_rate_hz} Hz`)}
          {renderRow("Touch Sampling", ext.features_listing?.touch_sampling)}
          {renderRow("Protection", specs.display?.protection)}
          {renderRow("Screen to Body", ext.features_listing?.screen_to_body)}
          {renderRow("Screen Design", ext.features_listing?.screen_design)}
          {renderRow("Notch Type", ext.features_listing?.notch_type)}
          {specs.display?.peak_brightness_nits && renderRow("Peak Brightness", `${specs.display.peak_brightness_nits} nits`)}
          {renderRow("Color Depth", ext.features_listing?.color_depth)}
          {renderRow("HDR Support", [ext.features_listing?.hdr && "HDR", ext.features_listing?.hdr10 && "HDR10", ext.features_listing?.hdr10_plus && "HDR10+", ext.features_listing?.dolby_vision && "Dolby Vision"].filter(Boolean).join(", ") || "")}
          {renderRow("Always-On Display", ext.features_listing?.always_on_display)}
          {renderRow("PWM Dimming", ext.features_listing?.pwm)}
          {renderRow("Display Features", ext.features_listing?.display_features)}
        </>
      ), ratings.display)}

      {renderSection("camera", "Camera", "photo_camera", (
        <>
          {renderRow("Main Camera", specs.camera?.rear_summary)}
          {renderRow("Sensor Name", ext.cameras_detailed?.sensor_name)}
          {renderRow("Megapixels", ext.cameras_detailed?.mp)}
          {renderRow("Aperture", ext.cameras_detailed?.aperture)}
          {renderRow("Pixel Size", ext.cameras_detailed?.pixel_size)}
          {renderRow("Sensor Size", ext.cameras_detailed?.sensor_size)}
          {renderRow("Focal Length", ext.cameras_detailed?.focal_length)}
          {renderRow("Lens Type", ext.cameras_detailed?.lens_type)}
          {renderRow("Focus & Stabilization", [ext.cameras_detailed?.ois && "OIS", ext.cameras_detailed?.eis && "EIS", ext.cameras_detailed?.pdaf && "PDAF", ext.cameras_detailed?.laser_af && "Laser AF"].filter(Boolean).join(", ") || "")}
          {renderRow("Camera Features", ext.cameras_detailed?.features)}
          {renderRow("Selfie Camera", specs.camera?.front_summary)}
          {renderRow("Video Recording", specs.camera?.video_recording)}
          {renderRow("Video Features", ext.video_recording_features)}
        </>
      ), ratings.camera)}

      {renderSection("battery", "Battery", "battery_charging_full", (
        <>
          {specs.battery?.capacity_mah && renderRow("Capacity", `${specs.battery.capacity_mah} mAh`)}
          {renderRow("Battery Type", ext.battery_detailed?.type)}
          {specs.battery?.charging_watts && renderRow("Charging Speed", `${specs.battery.charging_watts}W`)}
          {specs.battery?.fast_charging !== undefined && renderRow("Fast Charging", specs.battery.fast_charging ? "Yes" : "No")}
          {renderRow("Power Delivery / PPS", [ext.battery_detailed?.pd && "PD", ext.battery_detailed?.pps && "PPS"].filter(Boolean).join(", ") || "")}
          {specs.battery?.wireless_charging !== undefined && renderRow("Wireless Charging", specs.battery.wireless_charging ? "Yes" : "No")}
          {renderRow("Reverse Charging", ext.battery_detailed?.reverse_charging)}
          {renderRow("Charger Included", ext.battery_detailed?.charger_included)}
          {renderRow("Removable", ext.battery_detailed?.removable)}
        </>
      ), ratings.battery)}

      {renderSection("body", "Body & Design", "design_services", (
        <>
          {specs.body?.height_mm && specs.body?.width_mm && specs.body?.thickness_mm && renderRow("Dimensions", `${specs.body.height_mm} x ${specs.body.width_mm} x ${specs.body.thickness_mm} mm`)}
          {specs.body?.weight_g && renderRow("Weight", `${specs.body.weight_g} g`)}
          {renderRow("Build Materials", specs.body?.materials)}
          {renderRow("Frame & Back", (ext.body_detailed?.frame || ext.body_detailed?.back_material) ? `${ext.body_detailed?.frame || ''} / ${ext.body_detailed?.back_material || ''}`.replace(/^\s*\/\s*|\s*\/\s*$/g, '') : "")}
          {renderRow("Water Resistance", specs.body?.water_resistance || ext.body_detailed?.ip_rating)}
          {renderRow("Military Standard", ext.body_detailed?.mil_std)}
          {renderRow("Colors", ext.colors)}
        </>
      ))}

      {renderSection("network", "Network & SIM", "cell_tower", (
        <>
          {specs.connectivity?.network && renderRow("5G Support", specs.connectivity.network.includes("5G") ? "Yes" : "No")}
          {specs.connectivity?.network && renderRow("4G / LTE", (specs.connectivity.network.includes("4G") || specs.connectivity.network.includes("LTE")) ? "Yes" : "No")}
          {renderRow("Network", specs.connectivity?.network)}
          {renderRow("Network Features", ext.network_detailed?.features)}
          {renderRow("SIM", specs.connectivity?.sim)}
          {renderRow("SIM Types", ext.sim_detailed?.types)}
        </>
      ))}

      {renderSection("connectivity", "Connectivity", "wifi", (
        <>
          {renderRow("Wi-Fi", ext.connectivity_detailed?.wifi)}
          {renderRow("Bluetooth", specs.connectivity?.bluetooth)}
          {renderRow("Positioning (GPS)", ext.connectivity_detailed?.gps)}
          {renderRow("GLONASS", ext.connectivity_detailed?.glonass)}
          {specs.connectivity?.nfc !== undefined && renderRow("NFC", specs.connectivity.nfc ? "Yes" : "No")}
          {renderRow("Infrared (IR)", ext.connectivity_detailed?.infrared)}
          {renderRow("UWB", ext.connectivity_detailed?.uwb)}
          {renderRow("Radio (FM)", ext.connectivity_detailed?.fm)}
          {renderRow("USB", specs.connectivity?.usb)}
          {renderRow("USB OTG", ext.connectivity_detailed?.otg)}
        </>
      ))}

      {renderSection("audio", "Audio", "volume_up", (
        <>
          {renderRow("Speakers", ext.audio?.speakers)}
          {renderRow("Stereo Speakers", ext.audio?.stereo)}
          {renderRow("Microphones", ext.audio?.microphones)}
          {renderRow("3.5mm Jack", ext.audio?.headphone_jack || ext.connectivity_detailed?.headphone_jack)}
          {renderRow("Audio Features", [ext.audio?.dolby && "Dolby Atmos", ext.audio?.hi_res && "Hi-Res Audio", ext.audio?.snapdragon_sound && "Snapdragon Sound"].filter(Boolean).join(", ") || "")}
        </>
      ))}

      {renderSection("sensors", "Sensors", "sensors", (
        <>
          {renderRow("Fingerprint", ext.sensors?.fingerprint)}
          {renderRow("Face Unlock", ext.sensors?.face_unlock)}
          {renderRow("Other Sensors", [ext.sensors?.accelerometer && "Accelerometer", ext.sensors?.compass && "Compass", ext.sensors?.gyroscope && "Gyroscope", ext.sensors?.barometer && "Barometer", ext.sensors?.hall_sensor && "Hall Sensor", ext.sensors?.ambient_light && "Ambient Light", ext.sensors?.proximity && "Proximity"].filter(Boolean).join(", ") || "")}
        </>
      ))}

      {renderSection("software", "Software", "code", (
        <>
          {renderRow("Operating System", specs.os)}
          {renderRow("Custom UI", ext.software?.ui)}
          {renderRow("Software Updates", ext.software?.years_updates ? `${ext.software?.years_updates} Years` : "")}
          {renderRow("Upgrade Promise", ext.software?.upgrade_promise)}
          {renderRow("Security Patch", ext.software?.security_patch)}
          {renderRow("Bootloader", ext.software?.bootloader)}
          {renderRow("Rootable", ext.software?.rootable)}
        </>
      ))}

      {ext.ai_features && ext.ai_features.length > 0 && renderSection("ai", "AI Capabilities", "smart_toy", (
        <>
          {renderRow("Supported Features", ext.ai_features)}
        </>
      ))}

      {(ext.benchmarks || ext.gaming) && renderSection("benchmarks", "Benchmarks & Gaming", "sports_esports", (
        <>
          {renderRow("Antutu Score", ext.benchmarks?.antutu)}
          {renderRow("Geekbench", ext.benchmarks?.geekbench)}
          {renderRow("3DMark", ext.benchmarks?.["3dmark"])}
          {renderRow("PCMark", ext.benchmarks?.pcmark)}
          {renderRow("GFXBench", ext.benchmarks?.gfxbench)}
          {renderRow("AI Benchmark", ext.benchmarks?.ai_benchmark)}
          {renderRow("DXOMARK", ext.benchmarks?.dxomark)}
          {renderRow("Battery Test", ext.benchmarks?.battery_test)}
          {renderRow("Charging Test", ext.benchmarks?.charging_test)}
          {renderRow("PUBG FPS", ext.gaming?.pubg_fps)}
          {renderRow("CoD Mobile FPS", ext.gaming?.cod_fps)}
          {renderRow("Free Fire FPS", ext.gaming?.free_fire_fps)}
          {renderRow("Genshin Impact FPS", ext.gaming?.genshin_fps)}
          {renderRow("Cooling System", ext.gaming?.cooling)}
          {renderRow("Heating", ext.gaming?.heating)}
          {renderRow("Thermal Throttling", ext.gaming?.throttle)}
          {renderRow("Game Mode", ext.gaming?.game_mode)}
          {renderRow("Gaming Triggers", ext.gaming?.triggers)}
        </>
      ))}
    </section>
  );
}
