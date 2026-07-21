"use client";

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminPhoneForm from '../components/AdminPhoneForm';

export default function AddMobilePage() {
  const router = useRouter();

  const handleSubmit = async (payload: any) => {
    try {
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
    }
  };

  return <AdminPhoneForm onSubmit={handleSubmit} isEditing={false} />;
}
