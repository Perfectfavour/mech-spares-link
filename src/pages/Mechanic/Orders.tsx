import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Calendar, CheckCircle2, ChevronRight, Activity, MessageSquare } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function MechanicOrders() {
  const navigate = useNavigate();
  const { orders, requests } = useApp();
  const [tab, setTab] = useState<'orders' | 'requests'>('orders');

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'completed' || s === 'responded') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    }
    if (s === 'cancelled') {
      return 'bg-destructive/5 text-destructive border-destructive/10';
    }
    if (s === 'pending' || s === 'preparing') {
      return 'bg-amber-50 text-amber-700 border-amber-200/50';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
  };

  return (
    <MobileContainer hasBottomNav>
      {/* Sticky Premium Header */}
      <div className="p-6 sticky top-0 bg-background/95 backdrop-blur-md z-10 space-y-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <Activity size={20} />
          </div>
          <h1 className="text-2xl font-semibold font-poppins">My Activity</h1>
        </div>
        
        {/* Modern SaaS Tab System */}
        <div className="flex border-b border-border/80">
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-all duration-300 relative border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'orders' 
                ? 'border-primary text-primary font-extrabold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package size={16} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-all duration-300 relative border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'requests' 
                ? 'border-primary text-primary font-extrabold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare size={16} />
            <span>Requests ({requests.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-4 space-y-4 pb-24 overflow-y-auto">
        {tab === 'orders' ? (
          <>
            {orders.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="bg-muted p-4 rounded-full text-muted-foreground">
                  <Package size={48} />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-foreground text-sm">No orders yet</p>
                  <p className="text-xs text-muted-foreground">Active purchases will appear here.</p>
                </div>
              </div>
            ) : (
              orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="p-5 rounded-[24px] border border-border/80 shadow-2xs hover:shadow-sm hover:border-primary/20 transition-all duration-300 active:scale-[0.99] cursor-pointer bg-card space-y-4"
                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 text-primary p-2.5 rounded-xl border border-primary/10">
                        <Package size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider leading-none mb-1">
                          ID: {order.id.slice(0, 8)}...
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{order.date}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
                      <div className="flex -space-x-2 shrink-0">
                        {order.items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-lg border border-background overflow-hidden shadow-2xs bg-muted">
                            <img 
                              src={item.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'} 
                              className="w-full h-full object-cover" 
                              alt="" 
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-lg border border-background bg-muted flex items-center justify-center text-[10px] font-black shadow-2xs">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate leading-none mb-1">
                          {order.items.map((i: any) => i.name).join(', ')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider leading-none mb-0.5">Total</p>
                      <p className="font-black text-primary text-sm">₦{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            {requests.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="bg-muted p-4 rounded-full text-muted-foreground">
                  <Clock size={48} />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-foreground text-sm">No requests yet</p>
                  <p className="text-xs text-muted-foreground">Parts requests you submit will appear here.</p>
                </div>
              </div>
            ) : (
              requests.map((req) => (
                <Card 
                  key={req.id} 
                  className="p-5 rounded-[24px] border border-border/80 shadow-2xs hover:shadow-sm hover:border-primary/20 transition-all duration-300 bg-card space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-base leading-snug">{req.part}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{req.vehicle}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 items-center bg-primary/[0.02] p-3 rounded-2xl border border-primary/5">
                    <div className="text-center px-4 py-1.5 bg-card rounded-xl border border-border/60 shadow-2xs flex flex-col items-center justify-center gap-0.5 min-w-[76px] shrink-0">
                      <span className="text-base font-black text-primary leading-none">
                        {req.responses ? req.responses.length : 0}
                      </span>
                      <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-widest block scale-90">Offers</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-1.5">
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 leading-none">
                        <Calendar size={10} />
                        <span>Requested on {req.date}</span>
                      </p>
                      <button 
                        onClick={() => navigate('/messages')}
                        className="w-full bg-primary text-primary-foreground text-xs font-extrabold py-2.5 rounded-xl shadow-xs hover:bg-primary/95 transition-all cursor-pointer text-center"
                      >
                        View Live Offers
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
