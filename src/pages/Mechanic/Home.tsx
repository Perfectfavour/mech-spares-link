import React, { useState } from 'react';
import { Search, MapPin, Bell, ChevronRight, Star, PlusCircle, Wrench, CircleDot, Sliders, Settings2, Zap, Car, Filter, Sparkles, Lightbulb, Circle, Disc, Battery, Fan, CircleDashed, ShoppingCart } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

const categories = [
  { id: 1, name: 'Engine', icon: Wrench },
  { id: 2, name: 'Brakes', icon: CircleDot },
  { id: 3, name: 'Suspension', icon: Sliders },
  { id: 4, name: 'Transmission', icon: Settings2 },
  { id: 5, name: 'Electrical', icon: Zap },
  { id: 6, name: 'Body', icon: Car },
  { id: 7, name: 'Filters', icon: Filter },
  { id: 8, name: 'Accessories', icon: Sparkles },
  { id: 9, name: 'Lighting', icon: Lightbulb },
  { id: 10, name: 'Wheels', icon: Circle },
  { id: 11, name: 'Tires', icon: Disc },
  { id: 12, name: 'Battery', icon: Battery },
  { id: 13, name: 'Cooling System', icon: Fan },
  { id: 14, name: 'Other', icon: CircleDashed }
];

export default function MechanicHome() {
  const navigate = useNavigate();
  const { products, profile } = useApp();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const trendingParts = products.slice(0, 4);
  const userName = profile?.full_name?.split(' ')[0] || 'John';
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm font-medium mb-1">
              <MapPin size={14} />
              <span>Garki, Abuja</span>
            </div>
            <h2 className="text-2xl font-bold">Hello, {userName}</h2>
          </div>
          <button className="bg-card p-3 rounded-2xl border border-border text-muted-foreground cursor-pointer" onClick={() => navigate('/notifications')}>
            <Bell size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative" onClick={() => navigate('/search')}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search for spare parts (e.g. Camry Brake Pads)"
            className="h-14 rounded-2xl pl-12 text-sm bg-card border-none shadow-sm cursor-pointer"
            readOnly
          />
        </div>

        {/* Signature Feature Banner */}
        <Card className="bg-primary p-5 rounded-3xl text-primary-foreground border-none overflow-hidden relative group">
          <div className="relative z-10 space-y-4 max-w-[70%]">
            <h3 className="text-xl font-bold">Can't find what you need?</h3>
            <p className="text-primary-foreground/90 text-sm">
              Send a request to all sellers in Abuja and get offers in minutes.
            </p>
            <Button
              variant="secondary"
              className="rounded-xl font-bold gap-2 text-primary"
              onClick={() => navigate('/request-part')}
            >
              <PlusCircle size={18} />
              Request a Spare Part
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
            <Search size={140} />
          </div>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-semibold">Categories</h3>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-red-700 font-bold text-sm hover:underline cursor-pointer"
            >
              {showAllCategories ? 'Show Less' : 'See All'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {displayedCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-card p-4 rounded-3xl flex flex-col items-center gap-2 border border-border shadow-sm active:scale-95 hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/search?category=${cat.name}`)}
                >
                  <div className="text-primary p-2 bg-primary/10 rounded-2xl">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-center">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Parts */}
        <div className="space-y-4 pb-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-semibold">Trending Near You</h3>
            <button className="text-red-700 font-bold text-sm cursor-pointer" onClick={() => navigate('/search')}>View All</button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {trendingParts.map((part) => (
              <Card
                key={part.id}
                className="rounded-[20px] border border-border bg-card p-1.5 flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                onClick={() => navigate(`/product/${part.id}`)}
              >
                {/* Nested Image Container */}
                <div className="h-32 w-full relative bg-muted rounded-[15px] overflow-hidden shrink-0">
                  <img
                    src={part.image || part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80'}
                    alt={part.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  {/* Spaced categories / condition left and right */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center gap-1.5">
                    <span className="bg-white/60 text-foreground/80 text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide shrink-0">
                      {part.category}
                    </span>
                    <span className="bg-white/60 text-foreground/80 text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0">
                      {part.condition || 'New'}
                    </span>
                  </div>
                </div>

                {/* Details Area */}
                <div className=" px-1 pb-0.5 flex-1 flex flex-col justify-between space-y-1">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[13px] leading-snug line-clamp-2 mt-[-10px]">{part.name}</h4>

                    {/* Stock far left & Rating far right on same horizontal level */}
                    <div className="w-full flex justify-between items-center gap-1.5 pt-0 mx-[-5px]">
                      <div className="shrink-0">
                        {part.stock !== undefined ? (
                          part.stock < 5 ? (
                            <span className="bg-destructive/10 text-destructive text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                              Only {part.stock} left!
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                              In Stock
                            </span>
                          )
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                            In Stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span>{part.rating || '4.8'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Price & Add Row */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-primary font-bold text-sm">
                      {typeof part.price === 'number' ? `₦${part.price.toLocaleString()}` : part.price}
                    </span>
                    <button
                      className="bg-red-700 text-primary-foreground h-8 w-8 flex items-center justify-center rounded-xl active:scale-95 transition-transform cursor-pointer shadow-xs hover:bg-red-800/90 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${part.id}`);
                      }}
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileContainer >
  );
}
