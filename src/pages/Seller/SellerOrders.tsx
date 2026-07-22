import React from 'react';
import { Package, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function SellerOrders() {
  const navigate = useNavigate();
  const { orders, user } = useApp();

  // Filter orders matching this seller
  const sellerOrders = orders.filter((order) =>
    order.seller_id === user?.id || 
    order.items?.some((item: any) => item.seller_id === user?.id)
  );

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 rounded-xl active:scale-95 transition-transform text-muted-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Manage Orders</h2>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {sellerOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No orders found yet.
            </div>
          ) : (
            sellerOrders.map((order) => {
              const sellerItems = order.items ? order.items.filter((i: any) => i.seller_id === user?.id || order.seller_id === user?.id) : [];
              const sellerTotal = sellerItems.length > 0 
                ? sellerItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0)
                : order.total || 0;

              return (
                <Card
                  key={order.id}
                  className="p-4 rounded-2xl border border-border shadow-none flex items-center gap-3.5 active:scale-[0.99] transition-transform cursor-pointer hover:border-muted-foreground/20"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted/60 text-muted-foreground">
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {order.buyer_name || 'Mechanic'}
                      </h4>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {order.date || 'Just now'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-[11px] text-muted-foreground truncate">
                        {sellerItems.length || 1} items • ₦{sellerTotal.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase bg-primary/5 text-primary shrink-0">
                        {order.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}