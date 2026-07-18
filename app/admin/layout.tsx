import Link from 'next/link';
import { LayoutDashboard, Smartphone, PlusCircle } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Zozo Admin</h1>
        </div>
        
        <nav className="flex-1 py-4 px-3 flex flex-col">
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50"
            >
              <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500" />
              Dashboard
            </Link>
            
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mobiles
              </p>
            </div>
            
            <Link 
              href="/admin/phones" 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Smartphone className="mr-3 h-5 w-5 text-gray-400" />
              All Mobiles
            </Link>
            
            <Link 
              href="/admin/phones/new" 
              className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md"
            >
              <PlusCircle className="mr-3 h-5 w-5 text-indigo-500" />
              Add Mobile
            </Link>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
