"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ImageUploader from '../../../components/ImageUploader';

const EXTRA_SPEC_FIELDS = [
  'dimensions', 'weight', 'build', 'sim', 'type', 'size', 'resolution',
  'protection', 'os', 'chipset', 'cpu', 'gpu', 'card slot', 'internal',
  'triple', 'features', 'video', 'single', 'loudspeaker', '3.5mm jack',
  'wlan', 'bluetooth', 'positioning', 'nfc', 'radio', 'usb', 'sensors',
  'charging', 'colors', 'models', 'sar', 'sar eu', 'price'
];

export default function AddMobilePage() {
  const router = useRouter();
  const [brands, setBrands] = useState<{ slug: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch brands
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBrands(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    brand_slug: '',
    model_number: '',
    release_date: '',
    status: 'available',
    images: [] as any[],
    specs: {
      display: { size_inches: '', resolution: '', type: '', refresh_rate_hz: '', protection: '', peak_brightness_nits: '' },
      performance: { chipset: '', cpu: '', gpu: '', ram_options_gb: '', storage_options_gb: '', expandable_storage: false },
      camera: { rear_summary: '', front_summary: '', video_recording: '' },
      battery: { capacity_mah: '', charging_watts: '', fast_charging: false, wireless_charging: false },
      body: { height_mm: '', width_mm: '', thickness_mm: '', weight_g: '', materials: '', water_resistance: '' },
      connectivity: { network: '', sim: '', usb: '', bluetooth: '', nfc: false },
      os: '',
      extra_specs: EXTRA_SPEC_FIELDS.reduce((acc, field) => ({ ...acc, [field]: '' }), {})
    },
    prices: [] as any[],
    seo: { meta_title: '', meta_description: '' },
    is_published: false
  });

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSpecChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [section]: {
          ...(prev.specs as any)[section],
          [field]: value
        }
      }
    }));
  };

  const handleExtraSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        extra_specs: {
          ...prev.specs.extra_specs,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Process some fields before sending
      const payload = JSON.parse(JSON.stringify(formData));

      // Convert comma-separated strings to arrays
      if (payload.specs.performance.ram_options_gb) {
        payload.specs.performance.ram_options_gb = payload.specs.performance.ram_options_gb.toString().split(',').map((x: string) => Number(x.trim()));
      } else { payload.specs.performance.ram_options_gb = []; }

      if (payload.specs.performance.storage_options_gb) {
        payload.specs.performance.storage_options_gb = payload.specs.performance.storage_options_gb.toString().split(',').map((x: string) => Number(x.trim()));
      } else { payload.specs.performance.storage_options_gb = []; }

      // Clean up empty number fields to prevent Mongoose cast errors
      const numFields = [
        ['display', 'size_inches'], ['display', 'refresh_rate_hz'], ['display', 'peak_brightness_nits'],
        ['battery', 'capacity_mah'], ['battery', 'charging_watts'],
        ['body', 'height_mm'], ['body', 'width_mm'], ['body', 'thickness_mm'], ['body', 'weight_g']
      ];
      numFields.forEach(([section, field]) => {
        if (payload.specs[section][field] === '') {
          delete payload.specs[section][field];
        } else {
          payload.specs[section][field] = Number(payload.specs[section][field]);
        }
      });

      // Mongoose Maps have a known bug when casting an object that contains a key literally named "type".
      if (payload.specs.extra_specs.type !== undefined) {
        payload.specs.extra_specs.device_type = payload.specs.extra_specs.type;
        delete payload.specs.extra_specs.type;
      }

      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Phone created successfully!");
        router.push('/admin/phones');
      } else {
        const errorData = await response.json();
        alert(`Failed to create phone: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Add New Mobile</h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Mobile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Images Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Phone Images</h3>
          <ImageUploader
            onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
            existingImages={formData.images}
          />
        </section>

        {/* Basic Info */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleBasicChange} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Samsung Galaxy S24 Ultra" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select required name="brand_slug" value={formData.brand_slug} onChange={handleBasicChange} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select a Brand</option>
                {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input type="text" name="model_number" value={formData.model_number} onChange={handleBasicChange} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleBasicChange} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="available">Available</option>
                <option value="upcoming">Upcoming</option>
                <option value="discontinued">Discontinued</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
              <input type="date" name="release_date" value={formData.release_date} onChange={handleBasicChange} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </section>

        {/* Display */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Display</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size (inches)</label>
              <input type="number" step="0.1" value={formData.specs.display.size_inches} onChange={e => handleSpecChange('display', 'size_inches', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input type="text" value={formData.specs.display.type} onChange={e => handleSpecChange('display', 'type', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Dynamic AMOLED 2X" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
              <input type="text" value={formData.specs.display.resolution} onChange={e => handleSpecChange('display', 'resolution', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 1440 x 3120 pixels" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Rate (Hz)</label>
              <input type="number" value={formData.specs.display.refresh_rate_hz} onChange={e => handleSpecChange('display', 'refresh_rate_hz', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peak Brightness (nits)</label>
              <input type="number" value={formData.specs.display.peak_brightness_nits} onChange={e => handleSpecChange('display', 'peak_brightness_nits', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protection</label>
              <input type="text" value={formData.specs.display.protection} onChange={e => handleSpecChange('display', 'protection', e.target.value)} className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chipset</label>
              <input type="text" value={formData.specs.performance.chipset} onChange={e => handleSpecChange('performance', 'chipset', e.target.value)} className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPU</label>
              <input type="text" value={formData.specs.performance.cpu} onChange={e => handleSpecChange('performance', 'cpu', e.target.value)} className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPU</label>
              <input type="text" value={formData.specs.performance.gpu} onChange={e => handleSpecChange('performance', 'gpu', e.target.value)} className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RAM Options (GB, comma separated)</label>
              <input type="text" value={formData.specs.performance.ram_options_gb} onChange={e => handleSpecChange('performance', 'ram_options_gb', e.target.value)} className="w-full px-4 py-2 border rounded-md" placeholder="e.g. 8, 12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Options (GB, comma separated)</label>
              <input type="text" value={formData.specs.performance.storage_options_gb} onChange={e => handleSpecChange('performance', 'storage_options_gb', e.target.value)} className="w-full px-4 py-2 border rounded-md" placeholder="e.g. 256, 512, 1024" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" checked={formData.specs.performance.expandable_storage} onChange={e => handleSpecChange('performance', 'expandable_storage', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Expandable Storage</label>
            </div>
          </div>
        </section>

        {/* Camera */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Camera Summaries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rear Camera Summary</label>
              <input type="text" value={formData.specs.camera.rear_summary} onChange={e => handleSpecChange('camera', 'rear_summary', e.target.value)} className="w-full px-4 py-2 border rounded-md" placeholder="200 MP + 50 MP + 12 MP + 10 MP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Front Camera Summary</label>
              <input type="text" value={formData.specs.camera.front_summary} onChange={e => handleSpecChange('camera', 'front_summary', e.target.value)} className="w-full px-4 py-2 border rounded-md" placeholder="12 MP" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Recording</label>
              <input type="text" value={formData.specs.camera.video_recording} onChange={e => handleSpecChange('camera', 'video_recording', e.target.value)} className="w-full px-4 py-2 border rounded-md" placeholder="8K@24/30fps, 4K@30/60/120fps" />
            </div>
          </div>
        </section>

        {/* Battery */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Battery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (mAh)</label>
              <input type="number" value={formData.specs.battery.capacity_mah} onChange={e => handleSpecChange('battery', 'capacity_mah', e.target.value)} className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charging (Watts)</label>
              <input type="number" value={formData.specs.battery.charging_watts} onChange={e => handleSpecChange('battery', 'charging_watts', e.target.value)} className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" checked={formData.specs.battery.fast_charging} onChange={e => handleSpecChange('battery', 'fast_charging', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Fast Charging</label>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" checked={formData.specs.battery.wireless_charging} onChange={e => handleSpecChange('battery', 'wireless_charging', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Wireless Charging</label>
            </div>
          </div>
        </section>

        {/* OS & Misc */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">OS & Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating System</label>
              <input type="text" value={formData.specs.os} onChange={e => setFormData(prev => ({ ...prev, specs: { ...prev.specs, os: e.target.value } }))} className="w-full px-4 py-2 border rounded-md" placeholder="Android 14, One UI 6.1" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleBasicChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm font-bold text-gray-900">Publish Immediately</label>
            </div>
          </div>
        </section>

        {/* Detailed Scraped Specs */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Detailed Specifications (Raw / Scraped)</h3>
          <p className="text-sm text-gray-500 mb-6">These fields map directly to raw GSMArena-style data.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXTRA_SPEC_FIELDS.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace(' ', ' ')} <span className="text-gray-400 font-normal text-xs lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={(formData.specs.extra_specs as any)[field]}
                  onChange={e => handleExtraSpecChange(field, e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </section>

      </form>
    </div>
  );
}
