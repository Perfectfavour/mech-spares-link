import { ShoppingBag, Package, TrendingUp, Bell, ChevronRight, MessageCircle } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { orders, requests, profile } = useApp();

  const recentOrders = orders.slice(0, 3).map((order) => ({
    id: order.id,
    customer: profile?.full_name || 'Mechanic',
    items: order.items?.length || 1,
    total: `₦${(order.total || 0).toLocaleString()}`,
    status: order.status,
    time: order.date || 'Just now',
  }));

  const pendingRequests = requests.slice(0, 3).map((req) => ({
    id: req.id,
    customer: req.vehicle || 'Mechanic',
    part: req.part,
    time: req.date || 'Just now',
  }));

  const salesTotal = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Abuja Auto Parts</h2>
            <p className="text-muted-foreground text-sm font-medium">Gudu Market • Shop 45</p>
          </div>
          <button className="bg-card p-3 rounded-2xl border border-border text-muted-foreground relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-3 h-3 bg-destructive border-2 border-card rounded-full" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 bg-primary text-primary-foreground border-none rounded-[32px] space-y-4">
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60 font-medium">Today's Sales</p>
              <p className="text-xl font-black">₦{salesTotal.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-5 bg-card border border-border rounded-[32px] space-y-4">
            <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center text-primary">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Orders</p>
              <p className="text-xl font-black text-foreground">{orders.length}</p>
            </div>
          </Card>
        </div>

        {/* Part Requests Signature Feature Notification */}
        <Card 
          className="p-5 bg-amber-50 border-2 border-amber-200 rounded-[32px] flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => navigate('/messages')}
        >
          <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
            <MessageCircle size={32} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 leading-tight">New Part Request</h4>
            <p className="text-xs text-amber-700 mt-1">
              {pendingRequests[0].customer} is looking for a {pendingRequests[0].part}.
            </p>
          </div>
          <ChevronRight size={20} className="text-amber-400" />
        </Card>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            <button className="text-primary font-bold text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card 
                key={order.id} 
                className="p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  order.status === 'New' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <Package size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm">{order.customer}</h4>
                    <span className="text-[10px] text-muted-foreground font-medium">{order.time}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xs text-muted-foreground">{order.items} items • {order.total}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      order.status === 'New' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
