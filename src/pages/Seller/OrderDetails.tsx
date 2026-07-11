import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, MessageSquare, Truck, CheckCircle2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SellerOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleAccept = () => {
    toast.success('Order accepted! Please prepare the items.');
  };

  return (
    <MobileContainer>
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-background z-10">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Order Details</h1>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-32">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-black">{id}</h2>
            <p className="text-sm text-muted-foreground font-medium">Placed Today, 10:45 AM</p>
          </div>
          <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase shadow-lg shadow-primary/20">
            New Order
          </span>
        </div>

        {/* Customer Info */}
        <Card className="p-6 rounded-[32px] border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                P
              </div>
              <div>
                <h4 className="font-bold">Precision Motors</h4>
                <p className="text-xs text-muted-foreground">Main Mechanic: John Doe</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary/10 text-primary p-3 rounded-2xl"><Phone size={20} /></button>
              <button className="bg-primary/10 text-primary p-3 rounded-2xl" onClick={() => navigate('/messages?recipientId=mech-seed')}><MessageSquare size={20} /></button>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-2xl flex items-start gap-4">
            <MapPin size={20} className="text-primary mt-1" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Delivery Address</p>
              <p className="text-sm font-bold leading-snug">Plot 124, Gudu District, Near Central Mosque, Abuja</p>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Order Items</h3>
          <Card className="p-2 rounded-[32px] border border-border overflow-hidden">
            <div className="p-4 flex gap-4 border-b border-border/50">
              <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-brake-pads-ffa5f246-1783313457127.webp" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-sm">Brake Pads - Toyota Camry</h4>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">Qty: 1</p>
                  <p className="font-bold text-sm">₦12,500</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-alternator-efc846f3-1783313457481.webp" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-sm">Oil Filter - Toyota Camry</h4>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">Qty: 2</p>
                  <p className="font-bold text-sm">₦12,000</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items Total</span>
            <span className="font-bold">₦24,500</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-bold">₦2,500</span>
          </div>
          <div className="flex justify-between text-lg pt-3 border-t border-border">
            <span className="font-bold">Grand Total</span>
            <span className="font-black text-primary">₦27,000</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-background/80 backdrop-blur-lg border-t border-border flex gap-4">
        <Button variant="outline" size="xl" className="flex-1 border-2 font-bold rounded-2xl">
          Decline
        </Button>
        <Button size="xl" className="flex-[2] font-bold rounded-2xl shadow-lg shadow-primary/20" onClick={handleAccept}>
          Accept Order
        </Button>
      </div>
    </MobileContainer>
  );
}
