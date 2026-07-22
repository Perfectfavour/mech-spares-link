import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, X, Star, ShoppingCart, MapPin, Plus } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, products } = useApp();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [condition, setCondition] = useState('Any');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map((part) => part.category).filter(Boolean)))];

  const filteredResults = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const next = products.filter((part) => {
      const matchesQuery = !lowerQuery ||
        part.name.toLowerCase().includes(lowerQuery) ||
        (part.category && part.category.toLowerCase().includes(lowerQuery)) ||
        (part.description && part.description.toLowerCase().includes(lowerQuery));
      const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
      const matchesCondition = condition === 'Any' || part.condition === condition;
      return matchesQuery && matchesCategory && matchesCondition;
    });

    return next.sort((a, b) => {
      if (sortOrder === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortOrder === 'price-desc') return (b.price || 0) - (a.price || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [condition, products, query, selectedCategory, sortOrder]);

  return (
    <MobileContainer hasBottomNav>
      {/* Search Header */}
      <div className="bg-card p-6 sticky top-0 z-10 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-foreground p-2 rounded-xl hover:bg-muted active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-2xl pl-11 pr-10 bg-card border border-border/80 shadow-2xs hover:border-border/100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-inter text-sm"
              placeholder="Search spare parts..."
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-2 hover:text-foreground shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 relative cursor-pointer group shadow-2xs ${isFilterOpen
              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
              : (selectedCategory !== 'All' || condition !== 'Any' || sortOrder !== 'recommended')
                ? 'bg-primary/5 text-primary border-primary/45'
                : 'bg-card text-muted-foreground border-border/80 hover:text-primary hover:border-primary/30 hover:bg-primary/5'
              }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Toggle filters"
          >
            <Filter size={18} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105" />
            {(selectedCategory !== 'All' || condition !== 'Any' || sortOrder !== 'recommended') && !isFilterOpen && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>
          <button
            className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 relative cursor-pointer group shadow-2xs ${cart.length > 0
              ? 'bg-primary/5 text-primary border-primary/40'
              : 'bg-card text-muted-foreground border-border/80 hover:text-primary hover:border-primary/30 hover:bg-primary/5'
              }`}
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow-sm border border-background">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filters Pane (Modern SaaS Layout with accents & animations) */}
        {isFilterOpen && (
          <div className="p-4 bg-primary/[0.03] border border-primary/10 rounded-2xl space-y-4 pt-4 mt-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xs">
            {/* Category selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Categories</span>
              <div className="w-full overflow-x-auto custom-scrollbar pb-1">
                <div className="flex gap-1.5 w-max px-0.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200 cursor-pointer select-none ${selectedCategory === category
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/15 scale-102 font-extrabold'
                        : 'bg-card text-foreground border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/20'
                        }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid structure for condition & sorting */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Condition</span>
                <div className="flex gap-1.5">
                  {['Any', 'New', 'Used'].map((cond) => (
                    <button
                      key={cond}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border text-center ${condition === cond
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-extrabold'
                        : 'bg-card border-border/80 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20'
                        }`}
                      onClick={() => setCondition(cond)}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">Sort By</span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full h-8.5 rounded-lg border border-border/80 bg-card text-xs font-bold px-2 py-1.5 focus:border-primary focus:outline-none transition-all cursor-pointer font-sans"
                  >
                    <option value="recommended">⭐ Recommended</option>
                    <option value="price-asc">💵 Price: Low to High</option>
                    <option value="price-desc">💵 Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 flex-1 pb-24">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
            {filteredResults.length} Results Found
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {filteredResults.map((part) => (
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
                <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center gap-1.5">
                  <span className="bg-white/60 text-foreground/80 text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide shrink-0">
                    {part.category}
                  </span>
                  <span className="bg-white/60 text-foreground/80 text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0">
                    {part.condition || 'New'}
                  </span>
                </div>
              </div>

              <div className="px-1 pb-0.5 flex-1 flex flex-col justify-between space-y-1">
                <div className="space-y-1">
                  <h4 className="font-bold text-[13px] leading-snug line-clamp-2 mt-[-10px]">{part.name}</h4>

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
      <BottomNav />
    </MobileContainer>
  );
}
