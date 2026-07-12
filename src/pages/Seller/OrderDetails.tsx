import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Phone, MessageSquare, AlertCircle } from 'lucide-react';
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
          <button onClick={() => navigate(-1)} className="text-foreground p-1 -ml-1 rounded-lg active:scale-95 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Order Not Found</h1>
        </div>
        <div className="p-6 text-center text-muted-foreground text-sm">
          Could not locate order #{id?.slice(0, 8)}.
        </div>
      </MobileContainer>
    );
  }

  const itemsTotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0) || 0;
  const deliveryCost = 2500; 
  const grandTotal = itemsTotal + deliveryCost;

  // Status style helper function
  const getStatusStyles = (status: string = 'Confirmed') => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/10';
      case 'Cancelled':
      case 'Canceled':
        return 'bg-destructive/10 text-destructive border border-destructive/15';
      case 'Dispatched':
      case 'Out for Delivery':
        return 'bg-blue-500/10 text-blue-700 border border-blue-500/10';
      default:
        return 'bg-amber-500/10 text-amber-700 border border-amber-500/10';
    }
  };

  return (
    <MobileContainer>
      {/* Navbar Header */}
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-background/90 backdrop-blur-md z-10 border-b border-border/40">
        <button onClick={() => navigate(-1)} className="text-foreground p-1 -ml-1 rounded-lg active:scale-95 transition-transform cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-foreground">Order Details</h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-36">
        
        {/* Identifier Block */}
        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/40">
          <div className="space-y-0.5">
            <h2 className="text-xs font-mono font-semibold text-muted-foreground">ID: #{id?.slice(0, 8).toUpperCase()}</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Placed: {order.date || 'Today'}</p>
          </div>
          <span className={`text-[10px] bg-primary text-white font-bold px-3 py-1 rounded-md uppercase tracking-wider ${getStatusStyles(order.status)}`}>
            {order.status || 'Confirmed'}
          </span>
        </div>

        {/* Customer Information Section */}
        <div className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Customer</h3>
          <Card className="p-5 rounded-2xl border border-border shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                  {(order.buyer_name || 'M').charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-foreground">{order.buyer_workshop || 'Precision Motors'}</h4>
                  <p className="text-[11px] text-muted-foreground font-medium">Buyer: {order.buyer_name || 'Mechanic'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-muted/60 hover:bg-muted text-foreground p-2 rounded-xl border border-border/50 active:scale-95 transition-transform">
                  <Phone size={15} />
                </button>
                <button 
                  className="cursor-pointer bg-primary/5 text-primary p-2 rounded-xl border border-primary/10 active:scale-95 transition-transform" 
                  onClick={() => navigate(`/messages?recipientId=${order.buyer_id || 'mech-seed'}`)}
                >
                  <MessageSquare size={15} />
                </button>
              </div>
            </div>
            
            <div className="bg-muted/40 p-3.5 rounded-xl flex items-start gap-3 border border-border/40">
              <MapPin size={15} className="text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Delivery Destination</p>
                <p className="text-xs font-medium leading-relaxed text-foreground mt-0.5">
                  {order.delivery_address || order.deliveryAddress || 'Gudu District, Abuja'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items Section */}
        <div className="space-y-2.5">
          <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider px-0.5">Items Requested</h3>
          <Card className="rounded-2xl border border-border overflow-hidden shadow-none">
            {order.items?.map((item: any, idx: number) => (
              <div key={item.id || idx} className={`p-4 flex gap-4 ${idx < order.items.length - 1 ? 'border-b border-border/40' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-muted/60 overflow-hidden shrink-0 border border-border/30">
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&q=80"} 
                    className="w-full h-full object-cover" 
                    alt={item.name} 
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Qty: {item.quantity || 1}</p>
                    <p className="font-semibold text-xs text-foreground">₦{(item.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 px-1 border-t border-border/50 pt-4">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Subtotal</span>
            <span className="font-semibold text-foreground">₦{itemsTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Delivery Fee</span>
            <span className="font-semibold text-foreground">₦{deliveryCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 font-bold border-t border-dashed border-border/60 mt-1">
            <span className="text-foreground tracking-tight">Grand Total</span>
            <span className="text-primary font-bold">₦{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Action Sticky Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background/90 backdrop-blur-md border-t border-border flex gap-3 z-20">
        {order.status === 'Delivered' ? (
          <div className="w-full bg-emerald-500/10 text-emerald-700 text-center py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/20">
            <CheckCircle2 size={16} /> Order Completed & Disbursed
          </div>
        ) : (order.status === 'Cancelled' || order.status === 'Canceled') ? (
          <div className="w-full bg-destructive/5 text-destructive text-center py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-destructive/10">
            <AlertCircle size={16} /> Order Cancelled
          </div>
        ) : (
          <>
            {/* Show cancel option for anything not yet dispatched */}
            {['Confirmed', 'Preparing', undefined].includes(order.status) && (
              <Button 
                variant="outline" 
                className="cursor-pointer flex-1 border text-destructive hover:text-destructive border-border hover:bg-destructive/5 font-semibold text-xs rounded-xl py-5 h-auto transition-all"
                onClick={() => handleStatusUpdate('Cancelled')}
              >
                Cancel
              </Button>
            )}
            <Button 
              className="cursor-pointer flex-[2.5] font-semibold text-xs rounded-xl py-5 h-auto shadow-none transition-all" 
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
              {order.status === 'Confirmed' || !order.status ? 'Accept & Prepare' :
               order.status === 'Preparing' ? 'Mark Dispatched' :
               order.status === 'Dispatched' ? 'Out for Delivery' :
               'Confirm Handover (Delivered)'}
            </Button>
          </>
        )}
      </div>
    </MobileContainer>
  );
}