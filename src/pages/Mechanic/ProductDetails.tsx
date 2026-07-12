import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ShieldCheck, Truck, MessageSquare, ShoppingCart, Minus, Plus } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, products } = useApp();
  const [qty, setQty] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <MobileContainer>
        <div className="p-6 flex items-center gap-4 border-b border-border bg-card">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Product Details</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading product details...</p>
        </div>
      </MobileContainer>
    );
  }

  const specs = Array.isArray(product.specs)
    ? product.specs
    : product.specs && typeof product.specs === 'object'
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) }))
      : [];

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: qty });
    toast.success('Added to cart!');
    navigate('/cart');
  };

  const handleOpenChat = () => {
    const recipientId = product.seller_id || 'seller-seed';
    navigate(`/messages?recipientId=${recipientId}`);
    toast.success(`Opening chat with ${product.seller || 'the seller'}`);
  };

  const formattedPrice = typeof product.price === 'number' ? `₦${product.price.toLocaleString()}` : product.price;

  return (
    <MobileContainer hasBottomNav>
      {/* Product Image */}
      <div className="relative h-80">
        <img src={product.image || product.image_url} alt={product.name} className="w-full h-full object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="bg-background rounded-t-[40px] -mt-10 relative z-10 p-8 space-y-6 flex-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-muted-foreground text-xs font-medium">({product.reviews || product.reviews_count || 0} reviews)</span>
            </div>
          </div>
          <span className="text-2xl font-black text-primary">{formattedPrice}</span>
        </div>

        {/* Seller Info */}
        <div className="bg-card border border-border p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
              {(product.seller || 'A').charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm">{product.seller || 'Abuja Supplier'}</h4>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin size={10} /> {product.location || 'Gudu Market'}
              </p>
            </div>
          </div>
          <button className="bg-primary/10 text-primary p-3 rounded-2xl cursor-pointer" onClick={handleOpenChat}>
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Features */}
        <div className="flex justify-between py-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-bold">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <Truck size={24} />
            </div>
            <span className="text-[10px] font-bold">Express Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <Star size={24} />
            </div>
            <span className="text-[10px] font-bold">Top Rated</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-bold">Description</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-4">
          {specs.map((spec) => (
            <div key={spec.key} className="bg-muted p-3 rounded-2xl">
              <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">{spec.key}</p>
              <p className="text-sm font-bold">{spec.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-6 flex gap-4 items-center pb-24">
        <div className="flex items-center bg-muted rounded-2xl p-1 shrink-0">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-12 h-12 flex items-center justify-center text-muted-foreground"
          >
            <Minus size={20} />
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-12 h-12 flex items-center justify-center text-muted-foreground"
          >
            <Plus size={20} />
          </button>
        </div>
        <Button size="xl" className="flex-1 font-bold gap-3 cursor-pointer" onClick={handleAddToCart}>
          <ShoppingCart size={20} />
          Add to Cart
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
