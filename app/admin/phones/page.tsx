"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Trash2, Pencil, Copy } from 'lucide-react';
import Cookies from 'js-cookie';

export default function PhonesListPage() {
  const router = useRouter();
  const [phones, setPhones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setPhones(data.data);
      } else if (res.status === 401) {
        Cookies.remove('admin_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch phones', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setPhones(prev => prev.filter(p => p._id !== id));
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete phone', error);
      alert('An error occurred while deleting the phone');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Mobiles</h2>
          <p className="mt-1 text-sm text-gray-500">Manage all your phones here.</p>
        </div>
        <Link 
          href="/admin/phones/new" 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Mobile
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading phones...</div>
      ) : phones.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">No phones found.</p>
          <Link href="/admin/phones/new" className="text-indigo-600 font-medium hover:underline">
            Add your first phone
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {phones.map((phone) => (
                <tr key={phone._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                        {phone.images && phone.images.length > 0 ? (
                          <img src={phone.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">No img</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{phone.name}</div>
                        <div className="text-sm text-gray-500">{phone.model_number || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                      {phone.brand_slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {phone.status.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/admin/phones/${phone._id}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Edit Mobile"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/admin/phones/new?clone=${phone._id}`}
                        className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Clone Mobile"
                      >
                        <Copy className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(phone._id, phone.name)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Delete Mobile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
