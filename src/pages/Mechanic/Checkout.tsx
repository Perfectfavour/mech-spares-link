import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Truck, Loader2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, addOrder } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState<'pod' | 'online'>('pod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamically inject Paystack inline script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const itemsTotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const deliveryCost = 2500;
  const total = itemsTotal + deliveryCost;

  const completeOrderProcessing = async (paymentReference?: string) => {
    const orderId = `ord-${Math.floor(Math.random() * 10000)}`;
    const finalId = await addOrder({
      id: orderId,
      items: cart,
      total,
      status: 'Confirmed',
      paymentMethod: paymentMethod === 'online' ? 'Online' : 'Pay on Delivery',
      paymentReference: paymentReference || 'N/A',
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success('Order placed successfully!');
    navigate(`/order-tracking/${finalId || orderId}`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    // PATH A: Pay on Delivery
    if (paymentMethod === 'pod') {
      setIsProcessing(true);
      await completeOrderProcessing();
      setIsProcessing(false);
      return;
    }

    // PATH B: Paystack Online Gateway
    if (!(window as any).PaystackPop) {
      toast.error('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    // Retrieve Paystack key from environment configurations safely
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      toast.error('Payment configuration error. Missing public gateway key.');
      console.error('Missing environment variable: VITE_PAYSTACK_PUBLIC_KEY');
      return;
    }

    setIsProcessing(true);

    const handler = (window as any).PaystackPop.setup({
      key: paystackKey, 
      email: 'buyer@precisionmotors.com', 
      amount: total * 100, // Paystack works natively in Kobo
      currency: 'NGN',
      metadata: {
        custom_fields: [
          {
            display_name: "Cart items count",
            variable_name: "cart_count",
            value: cart.length
          }
        ]
      },
      callback: function (response: { reference: string }) {
        completeOrderProcessing(response.reference);
        setIsProcessing(false);
      },
      onClose: function () {
        toast.error('Payment window closed.');
        setIsProcessing(false);
      },
    });

    handler.openIframe();
  };

  return (
    <MobileContainer hasBottomNav>
      {/* Header Sticky Bar */}
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-background/90 backdrop-blur-md z-10 border-b border-border/40">
        <button onClick={() => navigate(-1)} className="text-foreground p-1 -ml-1 rounded-lg active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-32">
        {/* Delivery Address */}
        <section className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Delivery Address</h3>
          <Card className="p-4 rounded-2xl border border-border shadow-none flex gap-4 items-center">
            <div className="bg-primary/5 p-2.5 rounded-xl text-primary border border-primary/15">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate">Precision Motors Workshop</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Plot 124, Gudu District, Abuja</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </Card>
        </section>

        {/* Delivery Method */}
        <section className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Delivery Method</h3>
          <Card className="p-4 rounded-2xl border border-primary/20 bg-primary/5 shadow-none flex gap-4 items-center">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Truck size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-foreground">Express Delivery</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Delivery within 2-4 hours</p>
            </div>
            <span className="text-xs font-bold text-primary">₦2,500</span>
          </Card>
        </section>

        {/* Payment Methods */}
        <section className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Payment Method</h3>
          <div className="space-y-2.5">
            {/* Pay on Delivery */}
            <Card 
              className={`p-4 rounded-2xl border shadow-none flex gap-4 items-center cursor-pointer transition-all ${
                paymentMethod === 'pod' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
              }`}
              onClick={() => setPaymentMethod('pod')}
            >
              <div className={`p-2.5 rounded-xl ${paymentMethod === 'pod' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs text-foreground">Pay on Delivery</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Pay with cash or POS at your shop</p>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'pod' ? 'border-primary' : 'border-muted-foreground/40'}`}>
                {paymentMethod === 'pod' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </Card>

            {/* Paystack Card Payment */}
            <Card 
              className={`p-4 rounded-2xl border shadow-none flex gap-4 items-center cursor-pointer transition-all ${
                paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
              }`}
              onClick={() => setPaymentMethod('online')}
            >
              <div className={`p-2.5 rounded-xl ${paymentMethod === 'online' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs text-foreground">Online Payment</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Secure Card, Bank Transfer or USSD via Paystack</p>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-muted-foreground/40'}`}>
                {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </Card>
          </div>
        </section>

        {/* Order Summary */}
        <section className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Order Summary</h3>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2.5 shadow-none">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">{item.quantity || 1}x {item.name}</span>
                <span className="text-foreground">₦{(item.price * (item.quantity || 1)).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-2.5 border-t border-dashed border-border flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">Total</span>
              <span className="font-bold text-primary text-base">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Button Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background/90 backdrop-blur-md border-t border-border flex flex-col z-20 pb-24">
        <Button 
          size="lg" 
          className="w-full font-semibold text-xs rounded-xl py-5 h-auto transition-all shadow-none" 
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing Order...
            </>
          ) : paymentMethod === 'online' ? (
            `Pay ₦${total.toLocaleString()} Now`
          ) : (
            'Place Order (Pay on Delivery)'
          )}
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}