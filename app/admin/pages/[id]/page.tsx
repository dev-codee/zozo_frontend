"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import TipTapEditor from '@/app/components/TipTapEditor';

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '', slug: '', body: '', status: 'DRAFT'
  });

  useEffect(() => {
    fetchPage();
  }, [id]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title,
          slug: data.slug,
          body: data.body || '',
          status: data.status,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) router.push('/admin/pages');
    } catch (error) {
      console.error(error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug });
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input required type="text" value={formData.title} onChange={handleTitleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Content</h2>
          <TipTapEditor content={formData.body} onChange={(html) => setFormData({...formData, body: html})} />
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Publishing</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-64 border border-gray-300 rounded p-2">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded font-bold hover:bg-indigo-700 w-full md:w-auto">Update Page</button>
      </form>
    </div>
  );
}
