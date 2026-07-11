import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, X, Star, ShoppingCart, MapPin } from 'lucide-react';
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
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl pl-11 bg-muted border-none"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-2 min-h-8 min-w-8 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="relative" onClick={() => navigate('/cart')}>
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="w-full pb-1">
          <div className="grid grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border ${selectedCategory === category ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border ${condition === 'Any' ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`} onClick={() => setCondition('Any')}>Condition: Any</button>
          <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border ${condition === 'New' ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`} onClick={() => setCondition('New')}>Condition: New</button>
          <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border ${condition === 'Used' ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`} onClick={() => setCondition('Used')}>Condition: Used</button>
          <button className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border ${sortOrder === 'price-asc' ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`} onClick={() => setSortOrder(sortOrder === 'price-asc' ? 'recommended' : 'price-asc')}>Price: Low to High</button>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 pb-24">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
            {filteredResults.length} Results Found
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredResults.map((part) => (
            <Card 
              key={part.id} 
              className="p-4 rounded-3xl border border-border shadow-sm flex gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => navigate(`/product/${part.id}`)}
            >
              <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0">
                <img src={part.image || part.image_url} alt={part.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{part.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {part.seller || 'Abuja Supplier'} • <MapPin size={10} /> {part.distance || 'Gudu Market'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-bold my-2">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span>{part.rating} ({part.reviews || part.reviews_count || 0})</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold text-lg">
                    {typeof part.price === 'number' ? `₦${part.price.toLocaleString()}` : part.price}
                  </span>
                  <button 
                    className="bg-primary/10 text-primary p-3 min-h-12 min-w-12 flex items-center justify-center rounded-xl active:bg-primary active:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${part.id}`);
                    }}
                  >
                    <ShoppingCart size={18} />
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
