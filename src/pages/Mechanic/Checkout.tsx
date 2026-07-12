import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Truck } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, addOrder } = useApp();

  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 2500);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    const orderId = `ord-${Math.floor(Math.random() * 10000)}`;
    await addOrder({
      id: orderId,
      items: cart,
      total,
      status: 'Confirmed',
      date: new Date().toISOString().split('T')[0]
    });
    toast.success('Order placed successfully!');
    navigate(`/order-tracking/${orderId}`);
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Delivery Address */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Delivery Address</h3>
          <Card className="p-5 rounded-3xl border border-border flex gap-4 items-center">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <MapPin size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Precision Motors Workshop</h4>
              <p className="text-xs text-muted-foreground">Plot 124, Gudu District, Abuja</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Card>
        </section>

        {/* Delivery Method */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Delivery Method</h3>
          <Card className="p-5 rounded-3xl border border-primary bg-primary/5 flex gap-4 items-center">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Truck size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Express Delivery</h4>
              <p className="text-xs text-muted-foreground">Delivery within 2-4 hours</p>
            </div>
            <span className="text-sm font-bold text-primary">₦2,500</span>
          </Card>
        </section>

        {/* Payment Method */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Payment Method</h3>
          <div className="space-y-3">
            <Card className="p-5 rounded-3xl border border-primary bg-primary/5 flex gap-4 items-center">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Pay on Delivery</h4>
                <p className="text-xs text-muted-foreground">Pay with cash or POS at your shop</p>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-primary bg-primary" />
            </Card>
            <Card className="p-5 rounded-3xl border border-border flex gap-4 items-center opacity-60">
              <div className="bg-muted p-3 rounded-2xl text-muted-foreground">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Online Payment</h4>
                <p className="text-xs text-muted-foreground">Card, Transfer or USSD</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-border" />
            </Card>
          </div>
        </section>

        {/* Order Summary */}
        <section className="space-y-4 pb-4">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <div className="bg-card rounded-3xl border border-border p-5 space-y-3">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity || 1}x {item.name}</span>
                <span className="font-bold">₦{(item.price * (item.quantity || 1)).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-black text-primary text-lg">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 pb-24">
        <Button size="xl" className="w-full font-bold" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
