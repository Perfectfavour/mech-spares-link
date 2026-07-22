import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQty } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const delivery = subtotal > 0 ? 2500 : 0;
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <MobileContainer hasBottomNav>
        <div className="p-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 pb-24">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm">Looks like you haven't added any spare parts yet.</p>
          </div>
          <Button size="xl" onClick={() => navigate('/')} className="w-full">
            Start Shopping
          </Button>
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Your Cart ({cart.length})</h1>
      </div>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto">
        {cart.map((item, idx) => (
          <Card key={idx} className="p-4 rounded-3xl border border-border flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
              <img 
                src={item.image || item.image_url} 
                alt={item.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                <button
                  className="text-destructive p-3 min-h-12 min-w-12 flex items-center justify-center cursor-pointer hover:text-destructive/50 transition-colors duration-200 ease-in-out"
                  onClick={() => removeFromCart(idx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold">₦{item.price.toLocaleString()}</span>
                <div className="flex items-center bg-muted rounded-xl p-0.5">
                  <button
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground"
                    onClick={() => updateCartItemQty(idx, Math.max(1, (item.quantity || 1) - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity || 1}</span>
                  <button
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground"
                    onClick={() => updateCartItemQty(idx, (item.quantity || 1) + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-card border-t border-border p-8 space-y-6 pb-24">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-bold">₦{delivery.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg pt-3 border-t border-border">
            <span className="font-bold">Total</span>
            <span className="font-black text-primary">₦{total.toLocaleString()}</span>
          </div>
        </div>
        <Button size="xl" className="w-full font-bold cursor-pointer" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
