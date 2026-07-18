import { cookies } from 'next/headers';

async function getStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return { totalPhones: 0 };
    const data = await res.json();
    return data.data || { totalPhones: 0 };
  } catch (e) {
    return { totalPhones: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Phones</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.totalPhones}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
