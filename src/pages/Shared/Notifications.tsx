import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, ChevronRight } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';

const notifications = [
  {
    id: 1,
    title: 'New offer received',
    message: 'A seller replied to your request for a Honda Accord alternator.',
    time: '5 min ago',
  },
  {
    id: 2,
    title: 'Order confirmed',
    message: 'Your brake pads order is now confirmed and being prepared.',
    time: '1 hour ago',
  },
  {
    id: 3,
    title: 'Inventory updated',
    message: 'Your shop profile is now visible to nearby mechanics.',
    time: 'Yesterday',
  },
];

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on offers, orders, and activity.</p>
          </div>
        </div>

        <div className="space-y-3 pb-20">
          {notifications.map((item) => (
            <Card key={item.id} className="p-4 rounded-[28px] border border-border flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                <BellRing size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-bold text-sm">{item.title}</h2>
                  <span className="text-[10px] text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground mt-1" />
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
