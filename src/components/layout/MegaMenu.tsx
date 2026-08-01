"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ChevronRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  children: Category[];
}

export default function MegaMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState<Category | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setActiveParent(data.data[0]);
          }
        }
      })
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  return (
    <div 
      className="relative group h-full flex items-stretch shrink-0"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Menu Trigger */}
      <div className="bg-orange-500 text-white font-bold px-5 flex items-center gap-2 cursor-pointer hover:bg-orange-600 w-[180px] xl:w-[210px] justify-between h-full">
        <span className="flex items-center gap-2">
          <Menu size={18}/>
          SHOP BY CATEGORY
        </span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && categories.length > 0 && (
        <div className="absolute top-full left-0 w-[800px] h-[450px] bg-white border border-slate-200 shadow-2xl flex z-50">
          
          {/* Left Column: Parents */}
          <div className="w-1/3 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onMouseEnter={() => setActiveParent(cat)}
                className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${
                  activeParent?.id === cat.id 
                    ? 'bg-white text-blue-600 font-bold border-l-4 border-blue-600' 
                    : 'text-slate-700 hover:bg-slate-100 font-medium border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {cat.imageUrl ? (
                    <img 
                      src={cat.imageUrl.startsWith('http') ? cat.imageUrl : `http://localhost:5000${cat.imageUrl}`} 
                      alt={cat.name} 
                      className="w-6 h-6 object-cover rounded shrink-0" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-lg opacity-80 shrink-0">📦</span>');
                      }}
                    />
                  ) : (
                    <span className="text-lg opacity-80 shrink-0">📦</span>
                  )}
                  <span className="text-sm font-semibold truncate">{cat.name}</span>
                </div>
                <ChevronRight size={16} className={activeParent?.id === cat.id ? 'text-blue-600' : 'text-slate-400'} />
              </div>
            ))}
          </div>

          {/* Right Column: Children */}
          <div className="w-2/3 p-6 bg-white overflow-y-auto">
            {activeParent && (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  {activeParent.name}
                </h3>
                
                {activeParent.children && activeParent.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {activeParent.children.map(child => (
                      <Link 
                        key={child.id} 
                        href={`/products?category=${child.slug}`}
                        className="text-sm text-slate-600 hover:text-blue-600 hover:font-semibold transition-all py-1 flex items-center group/link"
                      >
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2 group-hover/link:bg-orange-500 transition-colors"></span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No subcategories found.</p>
                )}

                {/* Promotional Callout inside Menu */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600">Explore all {activeParent.name}</h4>
                    <p className="text-xs text-slate-500">Up to 40% off on bulk orders</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
