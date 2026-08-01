"use client";

import { useEffect, useState } from 'react';
import { Package, TrendingUp, IndianRupee, ShoppingCart } from 'lucide-react';

export default function SellerDashboard() {
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      setVendor(JSON.parse(info));
    }
  }, []);

  const stats = [
    { name: 'Total Revenue', value: '₹0.00', icon: IndianRupee, change: '+0%', changeType: 'positive' },
    { name: 'Total Orders', value: '0', icon: ShoppingCart, change: '0%', changeType: 'neutral' },
    { name: 'Active Products', value: '0', icon: Package, change: '0 new', changeType: 'neutral' },
    { name: 'Conversion Rate', value: '0.0%', icon: TrendingUp, change: '+0.0%', changeType: 'positive' },
  ];

  if (!vendor) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800">Welcome back, {vendor.companyName}!</h2>
        <p className="text-slate-500 mt-1">Here is what is happening with your store today.</p>
        
        {vendor.status !== 'ACTIVE' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-medium">
            Your account is currently in {vendor.status} status. Some features may be restricted until admin approval.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
              <div className="text-sm">
                <span className={`font-medium ${item.changeType === 'positive' ? 'text-green-600' : 'text-slate-500'}`}>
                  {item.change}
                </span>
                <span className="text-slate-500 ml-2">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h2>
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-12 text-center text-slate-500">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>No orders yet. Start adding products to get sales!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
