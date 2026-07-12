import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Search, ChevronRight } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function MechanicOrders() {
  const navigate = useNavigate();
  const { orders, requests } = useApp();
  const [tab, setTab] = useState<'orders' | 'requests'>('orders');

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 sticky top-0 bg-background z-10 space-y-6">
        <h1 className="text-2xl font-bold">My Activity</h1>
        
        <div className="flex p-1 bg-muted rounded-2xl">
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === 'orders' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === 'requests' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
            }`}
          >
            Spare Part Requests
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-4 pb-20">
        {tab === 'orders' ? (
          <>
            {orders.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Package size={64} />
                <p className="font-bold">No active orders</p>
              </div>
            ) : (
              orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="p-4 rounded-3xl border border-border shadow-sm active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{order.id}</h4>
                        <p className="text-[10px] text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-medium">Total Amount</p>
                      <p className="font-black text-primary">₦{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            {requests.map((req) => (
              <Card 
                key={req.id} 
                className="p-5 rounded-3xl border border-border space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{req.part}</h4>
                    <p className="text-xs text-muted-foreground">{req.vehicle}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-center justify-center gap-1">
                    <span className="text-xl font-black">{req.responses.length}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Offers Received</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-[10px] text-muted-foreground font-medium">Requested on {req.date}</p>
                    <button className="bg-primary text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-primary/20">
                      View Offers
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
