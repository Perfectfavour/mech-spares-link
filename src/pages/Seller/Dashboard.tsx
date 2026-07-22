import { ShoppingBag, Package, TrendingUp, Bell, ChevronRight, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { orders, requests, offers, profile, user, products } = useApp();

  // Unified Matching Strategy: Check top-level seller_id fallback OR individual items match
  const sellerOrders = orders.filter((order) =>
    order.seller_id === user?.id || 
    order.items?.some((item: any) => item.seller_id === user?.id)
  );

  // Status breakdown calculations
  const pendingCount = sellerOrders.filter(o => o.status === 'Confirmed' || !o.status).length;
  const activeCount = sellerOrders.filter(o => ['Preparing', 'Dispatched', 'Out for Delivery'].includes(o.status)).length;
  const completedCount = sellerOrders.filter(o => o.status === 'Delivered').length;

  // Calculate Revenue ONLY from orders that are fully Delivered
  const salesTotal = sellerOrders.reduce((sum, order) => {
    if (order.status !== 'Delivered') return sum;

    const sellerItems = order.items ? order.items.filter((i: any) => i.seller_id === user?.id || order.seller_id === user?.id) : [];
    const sellerTotal = sellerItems.length > 0
      ? sellerItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0)
      : order.total || 0;
      
    return sum + sellerTotal;
  }, 0);

  const recentOrders = sellerOrders.slice(0, 3).map((order) => {
    const sellerItems = order.items ? order.items.filter((i: any) => i.seller_id === user?.id || order.seller_id === user?.id) : [];
    const sellerTotal = sellerItems.length > 0 
      ? sellerItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0)
      : order.total || 0;

    return {
      id: order.id,
      customer: order.buyer_name || 'Mechanic',
      items: sellerItems.length || 1,
      total: `₦${sellerTotal.toLocaleString()}`,
      status: order.status || 'Confirmed',
      time: order.date || 'Just now',
    };
  });

  const sellerCategories = Array.from(
    new Set(products.filter((p) => p.seller_id === user?.id).map((p) => p.category))
  );

  const sellerRespondedRequestIds = new Set(
    offers.filter((o) => o.seller_id === user?.id).map((o) => o.request_id)
  );

  const filteredRequests = requests.filter(
    (req) =>
      sellerCategories.includes(req.category) &&
      req.status === 'pending' &&
      !sellerRespondedRequestIds.has(req.id)
  );

  const pendingRequests = filteredRequests.slice(0, 3).map((req) => ({
    id: req.id,
    customer: req.customer || req.vehicle || 'Mechanic',
    part: req.part,
    vehicle: req.vehicle,
    mechanic_id: req.mechanic_id,
    time: req.date || 'Just now',
  }));

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Hello, {profile?.full_name || 'Seller'}</h2>
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              {profile?.store_name || 'Abuja Auto Spare Parts'} • {profile?.location || 'Gudu Market'}
            </p>
          </div>
          <button
            className="bg-card p-2.5 rounded-xl border border-border cursor-pointer text-muted-foreground relative active:scale-95 transition-transform"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>

        {/* 2x2 Clean, Minimalist Metrics Grid */}
<div className="grid grid-cols-2 gap-4">
  {/* Row 1, Box 1: Revenue (Sales) */}
  <Card className="p-5 bg-primary text-primary-foreground border-none rounded-2xl flex flex-col justify-between h-28 shadow-sm shadow-primary/5">
    <div className="bg-white/15 w-8 h-8 rounded-lg flex items-center justify-center">
      <TrendingUp size={16} />
    </div>
    <div>
      <p className="text-[10px] text-primary-foreground/75 font-semibold uppercase tracking-wider">Total Sales</p>
      <p className="text-lg font-bold tracking-tight mt-1">₦{salesTotal.toLocaleString()}</p>
    </div>
  </Card>

  {/* Row 1, Box 2: Delivered Orders */}
  <Card className="p-5 bg-card border border-border rounded-2xl flex flex-col justify-between h-28 shadow-sm">
    <div className="bg-emerald-500/10 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center">
      <CheckCircle2 size={16} />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Delivered</p>
      <p className="text-lg font-bold text-foreground tracking-tight mt-1">
        {completedCount} <span className="text-sm font-medium text-muted-foreground/80 lowercase">orders</span>
      </p>
    </div>
  </Card>

  {/* Row 2, Box 1: Pending Orders */}
  <Card className="p-5 bg-card border border-border rounded-2xl flex flex-col justify-between h-28 shadow-sm">
    <div className="bg-amber-500/10 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center">
      <Clock size={16} />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
      <p className="text-lg font-bold text-foreground tracking-tight mt-1">
        {pendingCount} <span className="text-sm font-medium text-muted-foreground/80 lowercase">new</span>
      </p>
    </div>
  </Card>

  {/* Row 2, Box 2: In Progress Orders */}
  <Card className="p-5 bg-card border border-border rounded-2xl flex flex-col justify-between h-28 shadow-sm">
    <div className="bg-blue-500/10 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
      <ShoppingBag size={16} />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">In Progress</p>
      <p className="text-lg font-bold text-foreground tracking-tight mt-1">
        {activeCount} <span className="text-sm font-medium text-muted-foreground/80 lowercase">active</span>
      </p>
    </div>
  </Card>
</div>

        {/* Part Requests Notification */}
        {pendingRequests.length > 0 && (
          <Card
            className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => navigate(`/messages?recipientId=${pendingRequests[0].mechanic_id || 'mech-seed'}&requestId=${pendingRequests[0].id}`)}
          >
            <div className="bg-amber-100/80 p-3 rounded-xl text-amber-600 shrink-0">
              <MessageCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-amber-900 text-xs tracking-tight">New Spare Part Request</h4>
              <p className="text-[11px] text-amber-700 mt-0.5 truncate">
                Looking for a {pendingRequests[0].part} ({pendingRequests[0].vehicle}).
              </p>
            </div>
            <ChevronRight size={16} className="text-amber-400 shrink-0" />
          </Card>
        )}

        {/* Recent Orders Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <h3 className="text-base font-bold tracking-tight text-foreground">Recent Orders</h3>
            <button 
              onClick={() => navigate('/orders')} 
              className="text-primary font-bold text-xs cursor-pointer hover:underline transition-all"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                className="p-3.5 rounded-2xl border border-border shadow-none flex items-center gap-3.5 active:scale-[0.99] transition-transform cursor-pointer hover:border-muted-foreground/20"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground">
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-bold text-xs text-foreground truncate">{order.customer}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-medium">{order.time}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-[11px] text-muted-foreground truncate">{order.items} items • {order.total}</p>
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase bg-primary/5 text-primary shrink-0">
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