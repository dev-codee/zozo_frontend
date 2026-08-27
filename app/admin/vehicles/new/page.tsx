"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminVehicleForm from '../components/AdminVehicleForm';

function AddVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clone');
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!cloneId);

  useEffect(() => {
    if (!cloneId) return;
    const fetchVehicle = async () => {
      try {
        const token = Cookies.get('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${cloneId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const cloneData = data.data;
          delete cloneData._id;
          delete cloneData.slug;
          cloneData.name = `${cloneData.name} - Copy`;
          setInitialData(cloneData);
        }
      } catch (error) {
        console.error("Failed to load vehicle for cloning", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, [cloneId]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("EV created successfully!");
        router.push('/admin/vehicles');
      } else {
        const errorData = await response.json();
        alert(`Failed to create EV: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading original EV data...</div>;

  return <AdminVehicleForm onSubmit={handleSubmit} isEditing={false} initialData={initialData} />;
}

export default function AddVehiclePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <AddVehicleContent />
    </Suspense>
  );
}
