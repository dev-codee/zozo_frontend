"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({ name: '', slug: '', logo: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBrand();
  }, [id]);

  const fetchBrand = async () => {
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setFormData({
          name: data.data.name || '',
          slug: data.data.slug || '',
          logo: data.data.logo || '',
          description: data.data.description || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: formData.name, logo: formData.logo, description: formData.description })
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/brands');
      } else {
        setError(data.message || 'Failed to update brand');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Brand</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" value={formData.slug} disabled className="mt-1 block w-full border border-gray-200 bg-gray-50 text-gray-500 rounded p-2" />
          <p className="text-xs text-gray-400 mt-1">Slug is regenerated from the name on save.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input type="text" value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })} placeholder="https://…" className="mt-1 block w-full border border-gray-300 rounded p-2" />
          {formData.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={formData.logo} alt="preview" className="h-10 w-10 object-contain mt-2" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" rows={3}></textarea>
        </div>
        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {saving ? 'Updating…' : 'Update'}
        </button>
      </form>
    </div>
  );
}
