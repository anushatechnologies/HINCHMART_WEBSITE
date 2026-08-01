'use client';
import Link from 'next/link';
import { BookOpen, Zap, Ticket, BookMarked, LayoutDashboard, Settings, Users, Package, ShoppingBag, ChevronRight, MessageSquare, HelpCircle, RotateCcw, LineChart, FileText } from 'lucide-react';

const adminSections = [
  {
    group: 'Marketing & Content',
    color: 'orange',
    items: [
      { icon: Zap, label: 'Deals & Offers', href: '/admin/deals', desc: 'Create flash sales and time-limited deals', color: 'bg-orange-50 text-orange-500' },
      { icon: Ticket, label: 'Coupons', href: '/admin/coupons', desc: 'Manage discount coupon codes', color: 'bg-blue-50 text-blue-600' },
      { icon: BookOpen, label: 'Blog Posts', href: '/admin/blogs', desc: 'Publish articles and news', color: 'bg-slate-50 text-slate-600' },
      { icon: BookMarked, label: 'Buying Guides', href: '/admin/buying-guides', desc: 'Create product buying guides', color: 'bg-teal-50 text-teal-600' },
    ]
  },
  {
    group: 'Support & Services',
    color: 'emerald',
    items: [
      { icon: MessageSquare, label: 'Support Tickets', href: '/admin/support-tickets', desc: 'Resolve customer support requests', color: 'bg-emerald-50 text-emerald-600' },
      { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs', desc: 'Manage knowledge base articles', color: 'bg-indigo-50 text-indigo-600' },
      { icon: RotateCcw, label: 'Returns', href: '/admin/returns', desc: 'Process return & refund requests', color: 'bg-rose-50 text-rose-600' }
    ]
  },
  {
    group: 'Vendors & Partners',
    color: 'blue',
    items: [
      { icon: Users, label: 'Manage Vendors', href: '/admin/vendors', desc: 'Approve and manage seller accounts', color: 'bg-blue-50 text-blue-600' },
      { icon: Package, label: 'Vendor Products', href: '/admin/vendor-products', desc: 'Review and approve vendor listings', color: 'bg-orange-50 text-orange-500' }
    ]
  },
  {
    group: 'System & Analytics',
    color: 'purple',
    items: [
      { icon: LineChart, label: 'Analytics Dashboard', href: '/admin/analytics', desc: 'Platform sales and performance metrics', color: 'bg-purple-50 text-purple-600' },
      { icon: FileText, label: 'Content Pages', href: '/admin/content', desc: 'Manage legal and corporate content', color: 'bg-slate-50 text-slate-800' }
    ]
  }
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Panel</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage content, marketing campaigns, and platform settings.</p>
        </div>

        {adminSections.map(section => (
          <div key={section.group} className="mb-8">
            <h2 className="font-extrabold text-slate-900 text-xl mb-4">{section.group}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.items.map(item => (
                <Link key={item.href} href={item.href} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</h3>
                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
