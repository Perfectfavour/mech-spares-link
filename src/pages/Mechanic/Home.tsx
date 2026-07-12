import React, { useState } from 'react';
import { Search, MapPin, Bell, ChevronRight, Star, PlusCircle, Wrench, CircleDot, Sliders, Settings2, Zap, Car, Filter, Sparkles, Lightbulb, Circle, Disc, Battery, Fan, CircleDashed } from 'lucide-react';
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

  const trendingParts = products.slice(0, 3);
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
            className="h-14 rounded-2xl pl-12 bg-card border-none shadow-sm cursor-pointer"
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
              Request a Part
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
            <Search size={140} />
          </div>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xl font-bold">Categories</h3>
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-primary font-bold text-sm hover:underline cursor-pointer"
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
            <h3 className="text-xl font-bold">Trending Near You</h3>
            <button className="text-primary font-bold text-sm cursor-pointer" onClick={() => navigate('/search')}>View All</button>
          </div>
          <div className="space-y-4">
            {trendingParts.map((part) => (
              <Card
                key={part.id}
                className="p-4 rounded-3xl border border-border shadow-sm flex gap-4 active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => navigate(`/product/${part.id}`)}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img src={part.image || part.image_url} alt={part.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{part.name}</h4>
                    <p className="text-xs text-muted-foreground">{part.seller || 'Abuja Supplier'}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-primary font-bold">
                      {typeof part.price === 'number' ? `₦${part.price.toLocaleString()}` : part.price}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <span>{part.rating} ({part.reviews || part.reviews_count || 0})</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
