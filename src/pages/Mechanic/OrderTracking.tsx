import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, Phone, MessageSquare } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const steps = [
  { id: 1, label: 'Order Confirmed', icon: Package, time: '10:30 AM', status: 'completed' },
  { id: 2, label: 'Preparing', icon: Package, time: '11:15 AM', status: 'completed' },
  { id: 3, label: 'Dispatched', icon: Truck, time: '12:00 PM', status: 'current' },
  { id: 4, label: 'Out for Delivery', icon: Truck, time: '--:--', status: 'pending' },
  { id: 5, label: 'Delivered', icon: CheckCircle2, time: '--:--', status: 'pending' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="p-6 bg-primary text-primary-foreground space-y-6 rounded-b-[40px] shadow-2xl z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="bg-white/20 p-3 min-h-12 min-w-12 flex items-center justify-center rounded-xl backdrop-blur-md">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Track Order</h1>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-primary-foreground/60 text-xs font-medium">Order ID</p>
            <p className="text-2xl font-black">{id}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-primary-foreground/60 text-xs font-medium">Estimated Time</p>
            <p className="text-2xl font-black">45 Mins</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-10 overflow-y-auto">
        {/* Tracking Timeline */}
        <div className="space-y-8 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-muted" />
          
          {steps.map((step, i) => (
            <div key={step.id} className="flex gap-6 items-start relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                step.status === 'completed' ? 'bg-primary text-white' :
                step.status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary ring-4 ring-primary/10' :
                'bg-muted text-muted-foreground'
              }`}>
                <step.icon size={24} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className={`font-bold ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {step.label}
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground">{step.time}</span>
                </div>
                {step.status === 'current' && (
                  <p className="text-xs text-primary font-medium mt-1 animate-pulse">Your delivery driver is on the way...</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Courier Info */}
        <Card className="p-6 rounded-[32px] border border-border shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-muted rounded-2xl overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=driver" alt="Driver" />
              </div>
              <div>
                <h4 className="font-bold">Musa Ibrahim</h4>
                <p className="text-xs text-muted-foreground">Express Logistics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary/10 text-primary p-3 rounded-2xl"><Phone size={20} /></button>
              <button className="bg-primary/10 text-primary p-3 rounded-2xl" onClick={() => navigate('/messages?recipientId=seller-seed')}><MessageSquare size={20} /></button>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-2xl flex items-center gap-4">
            <MapPin size={20} className="text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Delivery Location</p>
              <p className="text-sm font-bold">Precision Motors, Gudu, Abuja</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-6">
        <Button variant="outline" size="xl" className="w-full font-bold border-2 rounded-2xl" onClick={() => navigate('/orders')}>
          Back to My Activity
        </Button>
      </div>
    </MobileContainer>
  );
}
