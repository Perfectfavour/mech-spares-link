import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageSquare } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';

export default function SellerOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();

  const order = orders.find((o) => o.id === id);

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!order) return;
    try {
      await updateOrderStatus(order.id, nextStatus);
      toast.success(`Order status updated to ${nextStatus}!`);
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  if (!order) {
    return (
      <MobileContainer>
        <div className="p-6 flex items-center gap-4 sticky top-0 bg-background z-10">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Order Not Found</h1>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          Could not locate order {id}.
        </div>
      </MobileContainer>
    );
  }

  // Calculate items total
  const itemsTotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  const deliveryCost = 2500; // standard mock cost
  const grandTotal = itemsTotal + deliveryCost;

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
            <p className="text-sm text-muted-foreground font-medium">Placed: {order.date}</p>
          </div>
          <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase shadow-lg shadow-primary/20">
            {order.status || 'New'}
          </span>
        </div>

        {/* Customer Info */}
        <Card className="p-6 rounded-[32px] border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                {(order.buyer_name || 'M').charAt(0)}
              </div>
              <div>
                <h4 className="font-bold">{order.buyer_workshop || 'Precision Motors'}</h4>
                <p className="text-xs text-muted-foreground">Contact: {order.buyer_name || 'Mechanic'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary/10 text-primary p-3 rounded-2xl"><Phone size={20} /></button>
              <button className="bg-primary/10 text-primary p-3 rounded-2xl" onClick={() => navigate(`/messages?recipientId=${order.buyer_id || 'mech-seed'}`)}><MessageSquare size={20} /></button>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-2xl flex items-start gap-4">
            <MapPin size={20} className="text-primary mt-1" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Delivery Address</p>
              <p className="text-sm font-bold leading-snug">{order.deliveryAddress || 'Abuja, Nigeria'}</p>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Order Items</h3>
          <Card className="p-2 rounded-[32px] border border-border overflow-hidden">
            {order.items?.map((item: any, idx: number) => (
              <div key={item.id || idx} className={`p-4 flex gap-4 ${idx < order.items.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                  <img src={item.image || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&q=80"} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-bold text-sm">₦{(item.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items Total</span>
            <span className="font-bold">₦{itemsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-bold">₦{deliveryCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg pt-3 border-t border-border">
            <span className="font-bold">Grand Total</span>
            <span className="font-black text-primary">₦{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-background/80 backdrop-blur-lg border-t border-border flex gap-4">
        {order.status === 'Delivered' ? (
          <Button size="xl" className="w-full font-bold rounded-2xl" disabled>
            Order Delivered
          </Button>
        ) : order.status === 'Cancelled' ? (
          <Button size="xl" className="w-full font-bold rounded-2xl bg-destructive text-destructive-foreground" disabled>
            Order Cancelled
          </Button>
        ) : (
          <>
            {order.status === 'Confirmed' && (
              <Button 
                variant="outline" 
                size="xl" 
                className="flex-1 border-2 font-bold rounded-2xl"
                onClick={() => handleStatusUpdate('Cancelled')}
              >
                Decline
              </Button>
            )}
            <Button 
              size="xl" 
              className="flex-[2] font-bold rounded-2xl shadow-lg shadow-primary/20" 
              onClick={() => {
                const nextStatusMap: Record<string, string> = {
                  'Confirmed': 'Preparing',
                  'Preparing': 'Dispatched',
                  'Dispatched': 'Out for Delivery',
                  'Out for Delivery': 'Delivered'
                };
                const nextStatus = nextStatusMap[order.status || 'Confirmed'] || 'Preparing';
                handleStatusUpdate(nextStatus);
              }}
            >
              {order.status === 'Confirmed' ? 'Accept Order' :
               order.status === 'Preparing' ? 'Dispatch Order' :
               order.status === 'Dispatched' ? 'Mark Out for Delivery' :
               'Mark as Delivered'}
            </Button>
          </>
        )}
      </div>
    </MobileContainer>
  );
}
