import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, Phone, MessageSquare, MapPinned, FileText } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useApp();

  const order = orders.find(o => o.id === id) || orders[0]
  const displayId = order?.id && order.id.length > 8 ? order.id.slice(0, 8).toUpperCase() : order?.id || 'MOCK-ID';
  const sellerId = order?.items?.[0]?.seller_id || 'seller-seed';
  const orderStatus = order?.status || 'Confirmed';

  // Define steps and dynamically compute their statuses
  const rawSteps = [
    { label: 'Order Confirmed', icon: FileText, desc: 'Your order has been received' },
    { label: 'Preparing', icon: Package, desc: 'Seller is packaging your spare parts' },
    { label: 'Dispatched', icon: Truck, desc: 'Package picked up by courier' },
    { label: 'Out for Delivery', icon: MapPinned, desc: 'Rider is arriving at your workshop' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Spare Parts received and checked' },
  ];

  const statusOrder = ['Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = statusOrder.indexOf(orderStatus);

  const steps = rawSteps.map((step, idx) => {
    let status: 'completed' | 'current' | 'pending' = 'pending';
    if (orderStatus === 'Cancelled') {
      status = 'pending';
    } else if (idx < currentStatusIndex) {
      status = 'completed';
    } else if (idx === currentStatusIndex) {
      status = 'current';
    }
    
    let time = '--:--';
    if (idx === 0) time = '09:15 AM';
    if (idx === 1 && currentStatusIndex >= 1) time = '09:45 AM';
    if (idx === 2 && currentStatusIndex >= 2) time = '10:20 AM';
    if (idx === 3 && currentStatusIndex >= 3) time = '10:55 AM';
    if (idx === 4 && currentStatusIndex >= 4) time = '11:15 AM';

    return {
      ...step,
      id: idx + 1,
      status,
      time,
    };
  });

  return (
    <MobileContainer hasBottomNav>
      {/* Elegant Minimalist Header */}
      <div className="px-6 py-4 bg-background border-b border-border flex items-center justify-between">
        <button 
          onClick={() => navigate('/orders')} 
          className="text-foreground hover:bg-muted p-2 rounded-full transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold tracking-tight text-foreground uppercase">Track Order</span>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Sleek Summary Block */}
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Order ID</p>
              <h3 className="text-md font-black text-foreground">#{displayId}</h3>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Estimated Delivery</p>
              <h3 className="text-md font-black text-primary">30-45 mins</h3>
            </div>
          </div>
          
          <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <span>Status: <strong className="text-foreground uppercase">{orderStatus}</strong></span>
            <span>Date: <strong className="text-foreground">{order?.date || 'Today'}</strong></span>
          </div>
        </div>

        {/* Minimalist Timeline */}
        <div className="space-y-6 relative py-2">
          {/* Timeline Vertical Connector Line */}
          <div className="absolute left-[30px] top-3 bottom-3 w-[1.5px] bg-muted-foreground/15" />
          
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isPending = step.status === 'pending';

            return (
              <div key={step.id} className="flex gap-4 items-start relative z-10">
                {/* Timeline Circle Node */}
                <div className="w-[60px] flex items-center justify-center shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-primary/10 text-primary border border-primary/20' :
                    isCurrent ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10 scale-110' :
                    'bg-muted text-muted-foreground/50 border border-muted-foreground/10'
                  }`}>
                    <step.icon size={15} />
                  </div>
                </div>

                {/* Step Text Details */}
                <div className="flex-1 pt-1.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className={`text-sm font-bold transition-colors ${
                      isPending ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {step.label}
                    </h4>
                    <span className="text-[10px] font-semibold text-muted-foreground">{step.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-0.5 leading-snug">{step.desc}</p>
                  {isCurrent && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full animate-pulse">
                      Active Step
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Courier Details Card */}
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-2xl overflow-hidden border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                  alt="Courier profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Delivery Agent</p>
                <h4 className="font-bold text-sm text-foreground">Musa Ibrahim</h4>
                <p className="text-[10px] text-muted-foreground">Express Courier Service</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <a 
                href="tel:+2348030000000" 
                className="bg-muted hover:bg-muted/80 text-foreground p-2.5 rounded-xl transition-all flex items-center justify-center"
                title="Call driver"
              >
                <Phone size={16} />
              </a>
              <button 
                onClick={() => navigate(`/messages?recipientId=${sellerId}`)}
                className="bg-muted hover:bg-muted/80 text-foreground p-2.5 rounded-xl transition-all flex items-center justify-center"
                title="Chat with seller"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-muted/50 border border-muted-foreground/5 p-3 rounded-2xl flex items-start gap-3">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Delivery Destination</p>
              <p className="text-xs font-bold text-foreground leading-normal">
                {order?.deliveryAddress || 'Precision Motors, Gudu, Abuja'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-background border-t border-border pb-24">
        <Button 
          variant="outline" 
          size="xl" 
          className="w-full font-bold border-2 rounded-2xl text-xs tracking-wider" 
          onClick={() => navigate('/orders')}
        >
          BACK TO MY ACTIVITY
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
