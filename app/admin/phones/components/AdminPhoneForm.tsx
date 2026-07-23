"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Wand2 } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ImageUploader from '../../../components/ImageUploader';

const EXTRA_SPEC_FIELDS = [
  'dimensions', 'weight', 'build', 'sim', 'type', 'size', 'resolution',
  'protection', 'os', 'chipset', 'cpu', 'gpu', 'card slot', 'internal',
  'triple', 'features', 'video', 'single', 'loudspeaker', '3_5mm_jack',
  'wlan', 'bluetooth', 'positioning', 'nfc', 'radio', 'usb', 'sensors',
  'charging', 'colors', 'models', 'sar', 'sar eu', 'price'
];

const DISPLAY_FEATURES = ["OLED", "AMOLED", "POLED", "LCD", "IPS", "LTPO", "Mini LED", "Foldable"];
const VIDEO_FEATURES = ["8K", "4K", "HDR", "Dolby Vision", "Slow Motion", "Time Lapse", "Night Video", "Director Mode", "LOG", "Pro Video"];
const SIM_TYPES = ["Single", "Dual", "Triple", "Nano", "eSIM", "Hybrid"];
const NETWORK_FEATURES = ["2G", "3G", "4G", "5G", "VoLTE", "VoWiFi", "SA", "NSA", "Satellite", "Bands"];
const AI_FEATURES_LIST = ["Circle To Search", "Gemini", "Galaxy AI", "Apple Intelligence", "Live Translate", "Magic Eraser", "AI Photo", "AI Video", "AI Call", "AI Notes", "AI Writing", "AI Wallpaper", "AI Voice", "AI Search", "AI Assistant", "AI Summary", "AI Interpreter"];

const DEFAULT_EXTRA_SPECS = {
  price_section: { store_name: "", store_logo: "", store_url: "", affiliate_url: "", current_price: "", old_price: "", discount_percent: "", coupon: "", cashback: "", cod: false, warranty: "", delivery_time: "", stock_status: "In Stock", price_source: "" },
  features_listing: { display_features: [], pixels: "", ppi: "", aspect_ratio: "", touch_sampling: "", hdr: false, hdr10: false, hdr10_plus: false, dolby_vision: false, always_on_display: false, screen_to_body: "", color_depth: "", pwm: "", screen_design: "Flat/Curved", notch_type: "Dynamic Island/Punch Hole/Notch/Waterdrop" },
  processor: { brand: "", fabrication: "", cpu_name: "", cpu_clock: "", cpu_cores: "", gpu_clock: "", ai_engine: "", npu: "", isp: "" },
  ram_storage: { ram_type: "", ram_speed: "", storage_type: "", max_expansion: "" },
  cameras_detailed: { sensor_name: "", mp: "", aperture: "", ois: false, eis: false, pdaf: false, laser_af: false, focal_length: "", pixel_size: "", sensor_size: "", lens_type: "", features: "" },
  video_recording_features: [],
  battery_detailed: { type: "Li-Ion", removable: false, reverse_charging: false, pd: false, pps: false, charger_included: false },
  body_detailed: { frame: "", back_material: "", ip_rating: "", mil_std: "" },
  sim_detailed: { types: [] },
  network_detailed: { features: [] },
  connectivity_detailed: { wifi: "", infrared: false, gps: "", glonass: false, otg: false, uwb: false, fm: false, headphone_jack: false },
  audio: { stereo: false, dolby: false, hi_res: false, snapdragon_sound: false, speakers: "", microphones: "" },
  sensors: { fingerprint: "Under display, optical/ultrasonic", face_unlock: false, accelerometer: false, compass: false, gyroscope: false, barometer: false, hall_sensor: false, ambient_light: false, proximity: false },
  software: { ui: "", security_patch: "", upgrade_promise: "", years_updates: "", bootloader: "", rootable: false },
  ai_features: [],
  benchmarks: { antutu: "", geekbench: "", "3dmark": "", pcmark: "", gfxbench: "", ai_benchmark: "", dxomark: "", battery_test: "", charging_test: "" },
  gaming: { pubg_fps: "", cod_fps: "", free_fire_fps: "", genshin_fps: "", heating: "", throttle: "", cooling: "", game_mode: false, triggers: false },
  ai_generated_content: { ai_summary: "", ai_pros: "", ai_cons: "", ai_verdict: "", ai_comparison: "", ai_buying_advice: "", ai_faq: "", ai_meta_title: "", ai_meta_description: "", ai_keywords: "", ai_highlights: "" },
  seo: { slug: "", canonical: "", og_title: "", og_image: "", twitter_card: "", schema: "", breadcrumb: "", faq_schema: false, review_schema: false },
  affiliate: { commission_percent: "", geo_redirect: false, deep_link: "" },
  moderation: { fact_checked: false, verified_specs: false, ai_verified: true, editor_approved: false },
  ai_automation: { auto_summary: true, auto_pros_cons: true, auto_buying_advice: true, auto_faqs: true, auto_comparison: true, auto_seo_title: true, auto_meta_description: true, auto_alt_text: true, auto_tag: true, auto_categorize: true, auto_link_related: true, auto_detect_duplicate: true, auto_translate: false, auto_create_news: false, auto_create_buying_guide: false, auto_calc_value: true, auto_update_price: false, auto_recalc_score: true, auto_monitor_competitors: false, auto_summarize_reviews: false, auto_extract_specs: true, auto_schema: true },
  colors: ""
};

export default function AdminPhoneForm({ initialData, onSubmit, isEditing = false }: { initialData?: any, onSubmit: (data: any) => Promise<void>, isEditing?: boolean }) {
  const router = useRouter();
  const [brands, setBrands] = useState<{ slug: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'ai_content', 'detailed_specs', 'seo'

  const [newPrice, setNewPrice] = useState({
    retailer_name: '',
    price_pkr: '',
    stock_status: 'available',
    product_url: '',
    variant: ''
  });

  const addPriceItem = () => {
    if (!newPrice.retailer_name || !newPrice.price_pkr) {
      alert("Retailer Name and Price are required.");
      return;
    }
    const priceNum = Number(newPrice.price_pkr);
    if (isNaN(priceNum)) {
      alert("Price must be a valid number.");
      return;
    }

    const itemToAdd = {
      retailer_name: newPrice.retailer_name,
      retailer_slug: newPrice.retailer_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price_pkr: priceNum,
      stock_status: newPrice.stock_status,
      product_url: newPrice.product_url || undefined,
      variant: newPrice.variant || undefined
    };

    setFormData((p: any) => ({
      ...p,
      prices: [...(p.prices || []), itemToAdd]
    }));

    setNewPrice({
      retailer_name: '',
      price_pkr: '',
      stock_status: 'available',
      product_url: '',
      variant: ''
    });
  };

  const removePriceItem = (index: number) => {
    setFormData((p: any) => ({
      ...p,
      prices: (p.prices || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const [formData, setFormData] = useState<any>(() => {
    const defaultData = {
      name: '', brand_slug: '', model_number: '', release_date: '', status: 'available', images: [] as any[],
      series: '', category: '', subcategory: '', country_availability: '', carrier_version: '', region_version: '', manufacturer: '', made_in: '', tags: [] as string[], video_url: '',
      specs: {
        display: { size_inches: '', resolution: '', type: '', refresh_rate_hz: '', protection: '', peak_brightness_nits: '', features: [] },
        performance: { chipset: '', cpu: '', gpu: '', ram_options_gb: '', storage_options_gb: '', expandable_storage: false },
        camera: { rear_summary: '', front_summary: '', video_recording: '', video_features: [] },
        battery: { capacity_mah: '', charging_watts: '', fast_charging: false, wireless_charging: false },
        body: { height_mm: '', width_mm: '', thickness_mm: '', weight_g: '', materials: '', water_resistance: '' },
        connectivity: { network: '', sim: '', usb: '', bluetooth: '', nfc: false, network_features: [], sim_types: [] },
        os: '',
        ai_features: [],
        extra_specs: { ...EXTRA_SPEC_FIELDS.reduce((acc, field) => ({ ...acc, [field]: '' }), {}), ...DEFAULT_EXTRA_SPECS }
      },
      prices: [] as any[], seo: { meta_title: '', meta_description: '' }, is_published: false
    };

    if (initialData) {
      const dataToLoad = { ...initialData };
      if (Array.isArray(dataToLoad.country_availability)) {
        dataToLoad.country_availability = dataToLoad.country_availability.join(', ');
      }
      return {
        ...defaultData,
        ...dataToLoad,
        specs: {
          ...defaultData.specs,
          ...dataToLoad.specs,
          extra_specs: {
            ...defaultData.specs.extra_specs,
            ...(dataToLoad.specs?.extra_specs || {})
          }
        }
      };
    }
    return defaultData;
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/brands`)
      .then(res => res.json())
      .then(data => { if (data.success && data.data) setBrands(data.data); })
      .catch(console.error);
  }, []);

  // Duplicate checker & Revisions state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const checkDuplicate = async (nameVal: string, modelVal: string) => {
    if (!nameVal && !modelVal) return;
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/check-duplicate?name=${encodeURIComponent(nameVal)}&model_number=${encodeURIComponent(modelVal)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const filtered = data.data.filter((x: any) => x._id !== initialData?._id);
        setDuplicates(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.model_number) {
        checkDuplicate(formData.name, formData.model_number);
      } else {
        setDuplicates([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.name, formData.model_number]);

  useEffect(() => {
    if (activeTab === 'history' && isEditing && initialData?._id) {
      const fetchRevisions = async () => {
        setLoadingRevisions(true);
        try {
          const token = Cookies.get('admin_token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${initialData._id}/revisions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setRevisions(data.data || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingRevisions(false);
        }
      };
      fetchRevisions();
    }
  }, [activeTab, isEditing, initialData?._id]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSpecChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, specs: { ...prev.specs, [section]: { ...(prev.specs as any)[section], [field]: value } } }));
  };

  const handleNestedExtraSpec = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: {
        ...prev.specs,
        extra_specs: {
          ...prev.specs.extra_specs,
          [section]: {
            ...((prev.specs.extra_specs as any)[section] || {}),
            [field]: value
          }
        }
      }
    }));
  };

  const toggleArrayItem = (category: string | null, field: string, item: string) => {
    setFormData((prev: any) => {
      if (!category) {
        const arr = prev.specs[field] || [];
        const newArr = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
        return { ...prev, specs: { ...prev.specs, [field]: newArr } };
      }
      const arr = prev.specs[category]?.[field] || [];
      const newArr = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
      return { ...prev, specs: { ...prev.specs, [category]: { ...prev.specs[category], [field]: newArr } } };
    });
  };

  const handleAIFill = async () => {
    if (!formData.name) {
      alert("Please enter a Phone Name first (e.g. 'iPhone 15 Pro Max')");
      return;
    }
    setIsAIFilling(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/admin/phones/ai-fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phoneName: formData.name })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const ai = data.data;
        setFormData((prev: any) => ({
          ...prev,
          brand_slug: ai.brand_slug || prev.brand_slug,
          model_number: ai.model_number || prev.model_number,
          release_date: ai.release_date || prev.release_date,
          status: ai.status || prev.status,
          specs: {
            ...prev.specs,
            display: { ...prev.specs.display, ...ai.specs?.display },
            performance: { ...prev.specs.performance, ...ai.specs?.performance },
            camera: { ...prev.specs.camera, ...ai.specs?.camera },
            battery: { ...prev.specs.battery, ...ai.specs?.battery },
            body: { ...prev.specs.body, ...ai.specs?.body },
            connectivity: { ...prev.specs.connectivity, ...ai.specs?.connectivity },
            os: ai.specs?.os || prev.specs.os,
            extra_specs: {
              ...prev.specs.extra_specs,
              ...(ai.specs?.extra_specs || {})
            }
          }
        }));
        alert("AI successfully researched and populated the phone fields!");
      } else {
        alert("Failed to auto-fill: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred during AI auto-fill.");
    } finally {
      setIsAIFilling(false);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify(formData));
      // Cleanup arrays and types
      if (typeof payload.specs.performance.ram_options_gb === 'string') {
        payload.specs.performance.ram_options_gb = payload.specs.performance.ram_options_gb.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      }
      if (typeof payload.specs.performance.storage_options_gb === 'string') {
        payload.specs.performance.storage_options_gb = payload.specs.performance.storage_options_gb.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      }
      if (typeof payload.country_availability === 'string' && payload.country_availability) {
        payload.country_availability = payload.country_availability.split(',').map((x: string) => x.trim()).filter(Boolean);
      } else if (!payload.country_availability) {
        payload.country_availability = [];
      }

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label: string, value: any, onChange: (val: any) => void, type = "text", placeholder = "") => (
    <div key={label} className="mb-[5px]">
      <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{label.replace(/_/g, ' ')}</label>
      {type === 'checkbox' ? (
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="h-4 w-4 text-indigo-600" />
      ) : type === 'textarea' ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" placeholder={placeholder} rows={4} />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" placeholder={placeholder} />
      )}
    </div>
  );

  const renderTextFields = (specSection: string, defaultSpecs: any, excludeKeys: string[] = []) => {
    const textKeys = Object.keys(defaultSpecs).filter(k => typeof defaultSpecs[k] !== 'boolean' && !excludeKeys.includes(k));
    return textKeys.map(key => renderInput(key, (formData.specs.extra_specs as any)[specSection]?.[key], v => handleNestedExtraSpec(specSection, key, v), 'text'));
  };

  const renderBooleanFields = (specSection: string, defaultSpecs: any, excludeKeys: string[] = []) => {
    const boolKeys = Object.keys(defaultSpecs).filter(k => typeof defaultSpecs[k] === 'boolean' && !excludeKeys.includes(k));
    if (boolKeys.length === 0) return null;
    return (
      <div className="mt-[5px] flex flex-wrap gap-[5px]">
        {boolKeys.map(key => (
          <label key={key} className="flex items-center space-x-1.5 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={!!(formData.specs.extra_specs as any)[specSection]?.[key]} onChange={e => handleNestedExtraSpec(specSection, key, e.target.checked)} className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300" />
            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/admin/phones" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Mobile' : 'Add New Mobile'}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleAIFill} disabled={isAIFilling} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50">
            <Wand2 className="w-4 h-4 mr-2" />
            {isAIFilling ? 'AI Researching...' : 'Auto-fill with AI'}
          </button>
          <button onClick={onFormSubmit} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Phone'}
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['basic', 'detailed_specs', 'ai_content', 'gaming_benchmarks', 'seo_affiliate', ...(isEditing ? ['history'] : [])].map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={onFormSubmit} className="space-y-8">

        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {duplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-xs">Warning: Potential Duplicates Detected!</span>
                  <div className="text-xs space-y-1">
                    {duplicates.map(d => (
                      <div key={d._id}>• <span className="font-semibold">{d.name}</span> ({d.model_number || 'No Model No.'}) - Status: {d.status}</div>
                    ))}
                  </div>
                </div>
              )}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Core Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('Phone Name', formData.name, v => setFormData((p: any) => ({ ...p, name: v })))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                    <select value={formData.brand_slug} onChange={e => setFormData((p: any) => ({ ...p, brand_slug: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-xs">
                      <option value="">Select Brand</option>
                      {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                    </select>
                  </div>
                  {renderInput('Model Number', formData.model_number, v => setFormData((p: any) => ({ ...p, model_number: v })))}
                  {renderInput('Release Date', formData.release_date, v => setFormData((p: any) => ({ ...p, release_date: v })), 'date')}
                  {renderInput('Series', formData.series, v => setFormData((p: any) => ({ ...p, series: v })))}
                  {renderInput('Category', formData.category, v => setFormData((p: any) => ({ ...p, category: v })))}
                  {renderInput('Subcategory', formData.subcategory, v => setFormData((p: any) => ({ ...p, subcategory: v })))}
                  {renderInput('Country Availability (comma separated)', formData.country_availability, v => setFormData((p: any) => ({ ...p, country_availability: v })))}
                  {renderInput('Carrier Version', formData.carrier_version, v => setFormData((p: any) => ({ ...p, carrier_version: v })))}
                  {renderInput('Region Version', formData.region_version, v => setFormData((p: any) => ({ ...p, region_version: v })))}
                  {renderInput('Manufacturer', formData.manufacturer, v => setFormData((p: any) => ({ ...p, manufacturer: v })))}
                  {renderInput('Made In', formData.made_in, v => setFormData((p: any) => ({ ...p, made_in: v })))}
                  {renderInput('Video URL (Youtube)', formData.video_url, v => setFormData((p: any) => ({ ...p, video_url: v })))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Primary Specs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderInput('Display Size (in)', formData.specs.display.size_inches, v => handleSpecChange('display', 'size_inches', v), 'number')}
                  {renderInput('Display Type', formData.specs.display.type, v => handleSpecChange('display', 'type', v))}
                  {renderInput('Chipset', formData.specs.performance.chipset, v => handleSpecChange('performance', 'chipset', v))}
                  {renderInput('RAM (GB, comma)', formData.specs.performance.ram_options_gb, v => handleSpecChange('performance', 'ram_options_gb', v))}
                  {renderInput('Storage (GB, comma)', formData.specs.performance.storage_options_gb, v => handleSpecChange('performance', 'storage_options_gb', v))}
                  {renderInput('Battery (mAh)', formData.specs.battery.capacity_mah, v => handleSpecChange('battery', 'capacity_mah', v), 'number')}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Prices</h3>
                
                {/* List of current prices */}
                {formData.prices && formData.prices.length > 0 ? (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50 text-gray-600">
                          <th className="py-2 px-3 font-bold">Retailer</th>
                          <th className="py-2 px-3 font-bold">Price (PKR)</th>
                          <th className="py-2 px-3 font-bold">Stock Status</th>
                          <th className="py-2 px-3 font-bold">Variant</th>
                          <th className="py-2 px-3 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.prices.map((pr: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50/50">
                            <td className="py-2 px-3 font-semibold text-gray-800">{pr.retailer_name}</td>
                            <td className="py-2 px-3 text-gray-700">Rs. {pr.price_pkr.toLocaleString()}</td>
                            <td className="py-2 px-3 capitalize text-gray-700">{pr.stock_status || 'available'}</td>
                            <td className="py-2 px-3 text-gray-700">{pr.variant || '-'}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => removePriceItem(idx)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-4">No prices added yet.</p>
                )}

                {/* Add new price form */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Retailer Name (e.g. PriceOye, Daraz)</label>
                    <input
                      type="text"
                      value={newPrice.retailer_name}
                      onChange={e => setNewPrice(p => ({ ...p, retailer_name: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="Retailer Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice.price_pkr}
                      onChange={e => setNewPrice(p => ({ ...p, price_pkr: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Variant (Optional)</label>
                    <input
                      type="text"
                      value={newPrice.variant}
                      onChange={e => setNewPrice(p => ({ ...p, variant: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 8GB/256GB"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Stock Status</label>
                    <select
                      value={newPrice.stock_status}
                      onChange={e => setNewPrice(p => ({ ...p, stock_status: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Product URL (Optional)</label>
                    <input
                      type="text"
                      value={newPrice.product_url}
                      onChange={e => setNewPrice(p => ({ ...p, product_url: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. https://priceoye.pk/..."
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={addPriceItem}
                      className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Add Price
                    </button>
                  </div>
                </div>
              </section>
            </div>
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Images</h3>
                <ImageUploader onImagesChange={(images) => setFormData((prev: any) => ({ ...prev, images }))} existingImages={formData.images} />
              </section>
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Publishing</h3>
                {renderInput('Publish Immediately', formData.is_published, v => setFormData((p: any) => ({ ...p, is_published: v })), 'checkbox')}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-xs">
                    <option value="available">Available</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="rumored">Rumored</option>
                    <option value="released">Released</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Approval Workflow Status</label>
                  <div className="px-3 py-2 bg-gray-50 border rounded-md text-xs font-semibold capitalize text-gray-700">
                    {formData.approvalStatus || 'DRAFT'}
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Integration Sync</h4>
                  {renderInput('Import Source', formData.importSource, v => setFormData((p: any) => ({ ...p, importSource: v })))}
                  {renderInput('Last Sync Date', formData.lastSync, v => setFormData((p: any) => ({ ...p, lastSync: v })), 'datetime-local')}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sync Status</label>
                    <select value={formData.syncStatus || ''} onChange={e => setFormData((p: any) => ({ ...p, syncStatus: e.target.value || undefined }))} className="w-full px-3 py-2 border rounded-md text-xs">
                      <option value="">No Sync / Local Only</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Featured', 'Trending', 'Best Seller', 'Recommended', 'Staff Pick', 'Sponsored', 'Editor Choice', 'AI Recommended', 'Flagship'].map(tag => (
                      <label key={tag} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                        <input type="checkbox" checked={formData.tags?.includes(tag) || false} onChange={e => {
                          const newTags = e.target.checked 
                            ? [...(formData.tags || []), tag] 
                            : (formData.tags || []).filter((t: string) => t !== tag);
                          setFormData((p: any) => ({ ...p, tags: newTags }));
                        }} />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* DETAILED SPECS TAB */}
        {activeTab === 'detailed_specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Display Extended</h3>
              <div className="space-y-2">
                {renderTextFields('features_listing', DEFAULT_EXTRA_SPECS.features_listing, ['display_features'])}
              </div>
              {renderBooleanFields('features_listing', DEFAULT_EXTRA_SPECS.features_listing, ['display_features'])}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Display Features</label>
                <div className="flex flex-wrap gap-2">
                  {DISPLAY_FEATURES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.display?.features?.includes(feat) || false} onChange={() => toggleArrayItem('display', 'features', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Processor & RAM</h3>
              <div className="space-y-2">
                {Object.keys(DEFAULT_EXTRA_SPECS.processor).map(key => renderInput(key, (formData.specs.extra_specs as any).processor[key], v => handleNestedExtraSpec('processor', key, v)))}
                {Object.keys(DEFAULT_EXTRA_SPECS.ram_storage).map(key => renderInput(key, (formData.specs.extra_specs as any).ram_storage[key], v => handleNestedExtraSpec('ram_storage', key, v)))}
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Cameras & Video</h3>
              <div className="space-y-2">
                {renderTextFields('cameras_detailed', DEFAULT_EXTRA_SPECS.cameras_detailed)}
              </div>
              {renderBooleanFields('cameras_detailed', DEFAULT_EXTRA_SPECS.cameras_detailed)}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Video Features</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_FEATURES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.camera?.video_features?.includes(feat) || false} onChange={() => toggleArrayItem('camera', 'video_features', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Connectivity & Sensors</h3>
              <div className="space-y-2">
                {renderTextFields('connectivity_detailed', DEFAULT_EXTRA_SPECS.connectivity_detailed)}
                {renderTextFields('sensors', DEFAULT_EXTRA_SPECS.sensors)}
              </div>
              {renderBooleanFields('connectivity_detailed', DEFAULT_EXTRA_SPECS.connectivity_detailed)}
              {renderBooleanFields('sensors', DEFAULT_EXTRA_SPECS.sensors)}
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Battery & Body Extended</h3>
              <div className="space-y-2">
                {renderTextFields('battery_detailed', DEFAULT_EXTRA_SPECS.battery_detailed)}
                {renderTextFields('body_detailed', DEFAULT_EXTRA_SPECS.body_detailed)}
              </div>
              {renderBooleanFields('battery_detailed', DEFAULT_EXTRA_SPECS.battery_detailed)}
              {renderBooleanFields('body_detailed', DEFAULT_EXTRA_SPECS.body_detailed)}
            </section>

          </div>
        )}

        {/* GAMING & BENCHMARKS TAB */}
        {activeTab === 'gaming_benchmarks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Benchmarks</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(DEFAULT_EXTRA_SPECS.benchmarks).map(key => renderInput(key, (formData.specs.extra_specs as any).benchmarks[key], v => handleNestedExtraSpec('benchmarks', key, v)))}
              </div>
            </section>
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Gaming</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderTextFields('gaming', DEFAULT_EXTRA_SPECS.gaming)}
              </div>
              {renderBooleanFields('gaming', DEFAULT_EXTRA_SPECS.gaming)}
            </section>
          </div>
        )}

        {/* AI CONTENT TAB */}
        {activeTab === 'ai_content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">
              <h3 className="font-bold mb-3">AI Features Supported</h3>
              <div className="flex flex-wrap gap-3">
                {AI_FEATURES_LIST.map(feat => (
                  <label key={feat} className="flex items-center space-x-2 text-xs bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                    <input type="checkbox" checked={formData.specs.ai_features?.includes(feat) || false} onChange={() => toggleArrayItem(null, 'ai_features', feat)} className="text-purple-600 rounded" />
                    <span>{feat}</span>
                  </label>
                ))}
              </div>
            </section>
            <section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">
              <h3 className="font-bold mb-3">AI Generated Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(DEFAULT_EXTRA_SPECS.ai_generated_content).map(key => renderInput(key, (formData.specs.extra_specs as any).ai_generated_content[key], v => handleNestedExtraSpec('ai_generated_content', key, v), 'textarea'))}
              </div>
            </section>
            <section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">
              <h3 className="font-bold mb-3">AI Automations (Moderation Flags)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(DEFAULT_EXTRA_SPECS.ai_automation).map(key => renderInput(key, (formData.specs.extra_specs as any).ai_automation[key], v => handleNestedExtraSpec('ai_automation', key, v), 'checkbox'))}
              </div>
            </section>
          </div>
        )}

        {/* SEO & AFFILIATE TAB */}
        {activeTab === 'seo_affiliate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">SEO</h3>
              <div className="space-y-4">
                {renderInput('Meta Title', formData.seo.meta_title, v => setFormData((p: any) => ({ ...p, seo: { ...p.seo, meta_title: v } })))}
                {renderInput('Meta Description', formData.seo.meta_description, v => setFormData((p: any) => ({ ...p, seo: { ...p.seo, meta_description: v } })), 'textarea')}
                {renderTextFields('seo', DEFAULT_EXTRA_SPECS.seo)}
                {renderBooleanFields('seo', DEFAULT_EXTRA_SPECS.seo)}
              </div>
            </section>
            <section className="bg-white p-5 rounded-xl border shadow-sm h-fit">
              <h3 className="font-bold mb-3">Affiliate & Pricing Extra</h3>
              <div className="space-y-4">
                {renderTextFields('affiliate', DEFAULT_EXTRA_SPECS.affiliate)}
                {renderBooleanFields('affiliate', DEFAULT_EXTRA_SPECS.affiliate)}
                {renderTextFields('price_section', DEFAULT_EXTRA_SPECS.price_section)}
                {renderBooleanFields('price_section', DEFAULT_EXTRA_SPECS.price_section)}
              </div>
            </section>
          </div>
        )}

        {/* REVISION HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold">Revision History & Change Logs</h3>
            {loadingRevisions ? (
              <div className="text-gray-500 text-xs">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="text-gray-500 text-xs">No revisions recorded for this mobile.</div>
            ) : (
              <div className="space-y-4">
                {revisions.map(rev => (
                  <div key={rev._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-gray-900">
                        {rev.changedBy?.name || 'System'} ({rev.changedBy?.role || 'SYSTEM'})
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold mt-1">
                      Action: {rev.action}
                    </div>
                    {rev.note && (
                      <div className="text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 mt-2">
                        Rejection Note: "{rev.note}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </form>
    </div>
  );
}
