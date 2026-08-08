"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import Cookies from 'js-cookie';

export default function BrandsListPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setIsLoading(true);
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch brands', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBrands();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brands {brands.length ? `(${brands.length})` : ''}</h1>
        <Link href="/admin/brands/new" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          <PlusCircle className="w-5 h-5 mr-2" /> Add Brand
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">Loading…</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No brands yet.</td></tr>
            ) : brands.map((brand) => (
              <tr key={brand._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400">
                      {brand.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/brands/${brand._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Pencil className="w-5 h-5 inline" />
                  </Link>
                  <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
